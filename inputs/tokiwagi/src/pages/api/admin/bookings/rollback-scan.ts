import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import {
  BookingStatus,
  PaymentStatus,
  PaymentType,
  Prisma,
  TicketType,
} from "@prisma/client";

import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import prisma from "utils/db";
import { DEFAULT_TRANSACTION_TIMEOUT, ROLE } from "constants/common";
import { IResponse } from "models/Response";
import { checkExistingBarCode } from "utils/server/barcode";
import {
  getDateOneYearAgo,
  isAfterTime,
  isBeforeTime,
  isSameDay,
  isSameTime,
} from "utils/date-time";
import { logRequest } from "utils/server/request";
import { Booking } from "models/Entity";
import {
  attachTicketNumbering,
  countAdultQuantityInPartialCheckout,
  countChildQuantityInPartialCheckout,
  isHourlyBooking,
  isHourlyTimesLimitBooking,
} from "utils/booking";
import { ERROR_MESSAGES } from "constants/errors";
import { softDeleteObicCodesForRollback } from "utils/server/obicCodes";
import { rollbackSmaregiForCheckoutCancel } from "utils/server/smaregiSync";
import {
  getSseCancelAndRefundSuccessPayload,
  registerSseNotification,
} from "utils/server/sse-hub";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.STAFF]));

/* ─────────────────────────────────────────────────────────────
   Route: POST /api/admin/bookings/rollback-scan
   Body:  { barCode: string }
   Decide automatically which rollback to execute based on status
───────────────────────────────────────────────────────────── */
handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  logRequest(req);
  const { barCode } = req.body;
  const today = new Date();
  const tenantCode = req.user?.tenantCode;

  if (!barCode) {
    return res.status(400).json({ error: "バーコードが必要です" });
  }

  const isExisting = await checkExistingBarCode(barCode);
  if (!isExisting) {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_BAR_CODE });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      barCode: barCode as string,
      createdAt: { gte: getDateOneYearAgo(today) },
      tenantCode,
    },
    include: {
      Ticket: true,
      PartialCheckout: true,
      User: true,
    },
  });

  if (bookings.length === 0) {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_BAR_CODE });
  }

  // A CheckedOut booking can be a stale leftover from an EARLIER cycle — e.g. an Hourly/HourlyTimesLimit
  // ticket, which request-re-check-in.ts deliberately excludes from re-check-in, stays CheckedOut
  // forever while its siblings under the same barCode go through a later re-check-in cycle. Such a
  // booking must not make this call route into the CHECKOUT-rollback branch below: that would
  // incorrectly roll back its own unrelated (already-settled) checkout/Smaregi transaction instead of
  // the intended check-in rollback for the siblings that actually re-entered.
  const maxCheckedInAtMs = Math.max(
    ...bookings.map((b) => (b.checkedInAt ? new Date(b.checkedInAt).getTime() : 0)),
  );
  const isStaleCheckedOutFromEarlierCycle = (booking: (typeof bookings)[number]) =>
    booking.status === BookingStatus.CheckedOut &&
    !!booking.checkedInAt &&
    new Date(booking.checkedInAt).getTime() < maxCheckedInAtMs;

  const hasCheckedOutBookings = bookings.some(
    (b) => b.status === BookingStatus.CheckedOut && !isStaleCheckedOutFromEarlierCycle(b),
  );
  const hasCheckedInBookings = bookings.some(
    (b) => b.status === BookingStatus.CheckedIn,
  );

  const ownerUserId = (bookings[0] as any).User?.id;
  /* ─────────── ROLLBACK CHECK-OUT ─────────── */
  if (hasCheckedOutBookings) {
    let bookingsToRollback = bookings;

    const hasOneDayBookingAndCheckedOutFromSecondTime = bookingsToRollback.some(
      (booking) =>
        booking.Ticket.type === TicketType.Daily &&
        !checkIsFirstTimeCheckedOut(booking as unknown as Booking),
    );

    if (hasOneDayBookingAndCheckedOutFromSecondTime) {
      bookingsToRollback = bookingsToRollback.filter((booking) => {
        const isHourlyTicket = (
          [TicketType.Hourly, TicketType.HourlyTimesLimit] as string[]
        ).includes(booking.Ticket.type);
        return (
          !isHourlyTicket ||
          (isHourlyTicket &&
            checkIsFirstTimeCheckedOut(booking as unknown as Booking))
        );
      });
    }

    let checkedOutBookings = bookingsToRollback.filter(
      (booking) => booking.status === BookingStatus.CheckedOut,
    );
    const alreadyCheckedOutHourlyBookings = getAlreadyCheckedOutHourlyBookings(
      checkedOutBookings as unknown as Booking[],
    );
    const alreadyCheckedOutHourlyBookingIds =
      alreadyCheckedOutHourlyBookings.map((booking) => booking.id);
    checkedOutBookings = checkedOutBookings.filter(
      (booking) => !alreadyCheckedOutHourlyBookingIds.includes(booking.id),
    );

    if (checkedOutBookings.length === 0) {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.CANNOT_ROLLBACK_BAR_CODE });
    }
    // Group by barCode: SmaregiTemporaryTransaction is one-per-barCode-per-cycle, so we call
    // rollbackBookingFromSmaregi once per barCode, not once per booking.
    // isFirstCheckout is false for the whole group if ANY booking had a prior paid cycle —
    // this prevents a newly-bought ticket (isFirstCheckout=true) from cancelling previous cycles'
    // transactions when it shares a barCode with an already-paid booking.
    // reCheckinAt is the re-check-in time for non-first-checkout cycles; used to guard against
    // cancelling the prior cycle's Smaregi transaction when lần 2 didn't create a new one.
    const smaregiRollbackByBarCode = new Map<string, { id: number; isFirstCheckout: boolean; reCheckinAt: Date | null }>();
    // Confirmed-sale (確定販売) cleanup is per BOOKING, not per barCode — a barCode can have several
    // independently-prepaid bookings (e.g. Daily Online + Monthly first-use checked out together),
    // each with its own confirmed transaction, so every booking needs its own rollback call.
    const confirmedTransactionRollbackTargets: { id: number; isFirstCheckout: boolean }[] = [];
    for (const b of checkedOutBookings) {
      const barCode = b.barCode as string;
      const isFirstCheckout = checkIsFirstTimeCheckedOut(b as unknown as Booking);
      confirmedTransactionRollbackTargets.push({ id: b.id, isFirstCheckout });
      const existing = smaregiRollbackByBarCode.get(barCode);
      if (!existing) {
        smaregiRollbackByBarCode.set(barCode, { id: b.id, isFirstCheckout, reCheckinAt: isFirstCheckout ? null : b.checkedInAt });
      } else if (!isFirstCheckout) {
        existing.isFirstCheckout = false;
        if (!existing.reCheckinAt || (b.checkedInAt && b.checkedInAt < existing.reCheckinAt)) {
          existing.reCheckinAt = b.checkedInAt;
        }
      }
    }

    await rollbackCheckedOutBookings(
      checkedOutBookings as unknown as Booking[],
    );

    // Best-effort Smaregi cleanup scoped to the specific checkout cycle being reverted.
    // Fire-and-forget (not awaited) so a Smaregi failure/delay never blocks the Tokiwagi rollback response.
    void rollbackSmaregiForCheckoutCancel(
      Array.from(smaregiRollbackByBarCode.values()),
      confirmedTransactionRollbackTargets,
    );

    const updatedBookings = await getBookingByIds(
      checkedOutBookings.map((b) => b.id),
    );

    registerSseNotification(ownerUserId, getSseCancelAndRefundSuccessPayload());
    return res.status(200).json({
      data: {
        action: "rollback-checkout",
        bookings: attachTicketNumbering(updatedBookings).map(formatBookingResult),
      },
    });
  }

  /* ─────────── ROLLBACK CHECK-IN ─────────── */
  if (hasCheckedInBookings) {
    const checkedInBookings = bookings.filter(
      (b) => b.status === BookingStatus.CheckedIn,
    );

    await rollbackCheckedInBookings(checkedInBookings as any[]);

    const updatedBookings = await getBookingByIds(
      checkedInBookings.map((b) => b.id),
    );

    registerSseNotification(ownerUserId, getSseCancelAndRefundSuccessPayload());
    return res.status(200).json({
      data: {
        action: "rollback-checkin",
        bookings: attachTicketNumbering(updatedBookings).map(formatBookingResult),
      },
    });
  }

  return res
    .status(400)
    .json({ error: ERROR_MESSAGES.CANNOT_ROLLBACK_BAR_CODE });
});

/* ─────────────────────────────────────────────────────────
   Helpers (copied from pos/check-out.ts)
───────────────────────────────────────────────────────── */
const checkIsFirstTimeCheckedOut = (booking: Booking) => {
  return (
    isSameTime(booking.checkedInAt, booking.firstCheckedInAt) &&
    isSameDay(booking.checkedInAt, booking.firstCheckedInAt)
  );
};

const getAlreadyCheckedOutHourlyBookings = (checkedOutBookings: Booking[]) => {
  let alreadyCheckedOutHourlyBookings: Booking[] = [];
  const checkedOutAts = checkedOutBookings
    .map((booking) => booking.checkedOutAt)
    .filter((checkedOutAt) => !!checkedOutAt);
  if (checkedOutAts.length) {
    const maxCheckedOutAt = Math.max.apply(null, checkedOutAts as any);
    alreadyCheckedOutHourlyBookings = checkedOutBookings.filter(
      (booking) =>
        (isHourlyBooking(booking) || isHourlyTimesLimitBooking(booking)) &&
        isBeforeTime(booking.checkedOutAt, maxCheckedOutAt as any),
    );
  }
  return alreadyCheckedOutHourlyBookings;
};

const rollbackCheckedOutBookings = async (bookings: Booking[]) => {
  return await prisma.$transaction(async (tx) => {
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const isFirstTimeCheckedOut = checkIsFirstTimeCheckedOut(booking);
      const lastStayDuration = null;
      const stayDuration =
        booking.stayDuration - (booking.lastStayDuration || 0) || null;

      const updateData: Partial<Booking> = {
        checkedOutAt: null,
        status: BookingStatus.CheckedIn,
        coupons: Prisma.DbNull as any,
        firstCheckedInAt: isFirstTimeCheckedOut
          ? null
          : booking.firstCheckedInAt,
        firstCheckoutAt: isFirstTimeCheckedOut
          ? null
          : booking.firstCheckoutAt,
        stayDuration,
        lastStayDuration,
      };

      // Reset payment state when rolling back:
      //   - isFirstTimeCheckedOut: cycle 1, no prior paid cycle.
      //   - !booking.firstCheckedInAt: booking was created during re-check-in (never had a prior
      //     checkout cycle). Its isSmaregiScanned may be true from the current cycle's POS payment,
      //     but cycle 1 never existed for it → reset to Pending.
      //   Bookings with firstCheckedInAt set (carried over from a prior cycle, e.g. cycle-1-paid
      //   booking A) keep paymentStatus=Completed and isSmaregiScanned=true so the prior payment
      //   remains valid and they continue to be excluded from future-cycle 仮販売 items.
      if (
        (booking.Ticket.paymentType !== PaymentType.Online ||
          (booking.Ticket.type === TicketType.HourlyTimesLimit &&
            booking.parentBookingId)) &&
        (isFirstTimeCheckedOut || !booking.firstCheckedInAt)
      ) {
        updateData.paymentStatus = PaymentStatus.Pending;
        updateData.totalAmount = null;
        updateData.isSmaregiScanned = false;
      }

      if (booking.PartialCheckout?.length) {
        const partialCheckouts = booking.PartialCheckout.filter((item) =>
          isAfterTime(item.checkedOutAt, booking.checkedInAt),
        );
        let totalAdult = 0;
        let totalChild = 0;
        for (const partialCheckout of partialCheckouts) {
          totalAdult += countAdultQuantityInPartialCheckout([partialCheckout]);
          totalChild += countChildQuantityInPartialCheckout([partialCheckout]);
          await tx.partialCheckout.update({
            where: { id: partialCheckout.id },
            data: { deleted: false },
          });
        }

        updateData.partialCheckedOutAdultQuantity = totalAdult;
        updateData.partialCheckedOutChildQuantity = totalChild;
      }

      await softDeleteObicCodesForRollback(tx, booking.id);

      await tx.booking.update({
        where: { id: booking.id },
        data: updateData as any,
      });

      if (
        isFirstTimeCheckedOut &&
        booking.User?.firstCheckedOutBookingId === booking.id
      ) {
        await prisma.user.update({
          where: { id: booking.User.id },
          data: { firstCheckedOutBookingId: null },
        });
      }
    }
  },
  { timeout: DEFAULT_TRANSACTION_TIMEOUT }
  );
};

/* ─────────────────────────────────────────────────────────
   Helpers (copied from pos/check-in.ts)
───────────────────────────────────────────────────────── */
const rollbackCheckedInBookings = async (bookings: any[]) => {
  const now = new Date();
  return await prisma.$transaction(async (tx) => {
    const updatePromises: Promise<any>[] = [];
    const partialCheckedOutBookingIds: number[] = [];
    const hasFirstCheckedInBookingInSameBarcode = bookings.some(
      (booking) =>
        booking.status === BookingStatus.CheckedIn && !booking.firstCheckedInAt,
    );

    for (const booking of bookings) {
      if (booking.status === BookingStatus.CheckedIn) {
        const wasReCheckedIn = !!booking.firstCheckedInAt;
        let partialCheckedOutAdultQuantity: number | null | undefined =
          undefined;
        let partialCheckedOutChildQuantity: number | null | undefined =
          undefined;

        const activePartialCheckouts = (booking.PartialCheckout || []).filter(
          (p: any) => !p.deleted,
        );

        if (activePartialCheckouts.length) {
          partialCheckedOutAdultQuantity = null;
          partialCheckedOutChildQuantity = null;
          partialCheckedOutBookingIds.push(booking.id);
        }

        let status: BookingStatus = BookingStatus.Successful;
        if (wasReCheckedIn) {
          if (hasFirstCheckedInBookingInSameBarcode) {
            status = BookingStatus.Calling;
          } else {
            status = BookingStatus.CheckedOut;
          }
        }

        const dataToUpdate: any = {
          checkedInAt: wasReCheckedIn ? booking.firstCheckedInAt : null,
          status,
          requestedReCheckInAt: null,
          reCheckInCount: { decrement: booking.reCheckInCount ? 1 : 0 },
          partialCheckedOutAdultQuantity,
          partialCheckedOutChildQuantity,
          createdAt: wasReCheckedIn ? undefined : now,
        };

        updatePromises.push(
          tx.booking.update({ where: { id: booking.id }, data: dataToUpdate }),
        );
      }
    }

    await Promise.all(updatePromises);

    if (partialCheckedOutBookingIds.length) {
      await tx.partialCheckout.deleteMany({
        where: { bookingId: { in: partialCheckedOutBookingIds } },
      });
    }
  },
  { timeout: DEFAULT_TRANSACTION_TIMEOUT });
};

/* ─────────────────────────────────────────────────────────
   Response helpers
───────────────────────────────────────────────────────── */
const getBookingByIds = async (ids: number[]) => {
  return prisma.booking.findMany({
    where: { id: { in: ids } },
    include: {
      User: true,
      Ticket: {
        include: {
          TicketDetail: true,
          TicketDiscountSetting: true,
          TicketBookingSchedule: { where: { deleted: false } },
        },
      },
    },
  });
};

const formatBookingResult = (b: any) => ({
  id: b.id,
  barCode: b.barCode,
  shortBarCode: b.shortBarCode,
  ticketIndex: b.ticketIndex,
  ticketCount: b.ticketCount,
  ticketName: b.Ticket?.name,
  tenantCode: b.tenantCode,
  adultQuantity: b.adultQuantity,
  childQuantity: b.childQuantity,
  date: b.date,
  status: b.status,
  checkedInAt: b.checkedInAt,
  checkedOutAt: b.checkedOutAt,
});

export default handler;
