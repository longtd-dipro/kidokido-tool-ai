import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import {
  BookingStatus,
  PaymentStatus,
  PaymentType,
  TicketType,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { isNil } from "lodash";

import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import prisma from "utils/db";
import {
  ROLE,
  DEFAULT_TRANSACTION_TIMEOUT,
  CHECK_IN_OUT_TENANT_VERSION,
} from "constants/common";
import { IResponse } from "models/Response";
import {
  canCheckIn,
  checkBookingsDate,
  checkBookingsStatus,
  checkPaymentStatus,
  checkExistingBarCode,
} from "utils/server/barcode";
import {
  getDateOneYearAgo,
  calculateStayingDurationWithoutParsing,
  truncateToMinute,
  newDateKeepLocalTime,
  isAfterTime,
} from "utils/date-time";
import { selectBookingsForUpdate } from "utils/server/sql";
import { logRequest } from "utils/server/request";
import { chooseNextCallingBookingsAndSendNotifications, getEntryCapacityStatus } from "utils/server/booking-queue";
import EmailService from "services/email.service";
import { EMAIL_SETTING_KEY } from "constants/settings";
import { Booking } from "models/Entity";
import {
  flattenObicCodesForLedger,
  getNextObicRevision,
} from "utils/server/obicCodes";
import {
  calculateCheckoutCharges,
  sumSalesPrice,
  toObicCodes,
  toSmaregiQRCodes,
} from "utils/server/checkoutCharges";
import {
  cancelConfirmedTransactionsAfterRollback,
  ConfirmedTransactionRequest,
  createSmaregiTemporaryTransaction,
  enabledTenantSmaregiSetting,
  persistSmaregiTemporaryTransaction,
  resolvePrepaidChargeLines,
  SmaregiTemporaryGroupItem,
  syncConfirmedTransactionsForPrepaidBookings,
} from "utils/server/smaregiSync";
import { deleteTemporaryTransaction } from "services/smaregi/smaregi.service";
import {
  attachTicketNumbering,
  calculateBookingExtendedPrices,
  calculateBookingsPriceMap,
  calculateTotalBookingsPayAmount,
  getFormattedTotalAmount,
  isHourlyTicket,
  isHourlyTimesLimitTicket,
  isGroupTicket,
} from "utils/booking";
import { formatThousands } from "utils/common";
import { ERROR_MESSAGES } from "constants/errors";
import {
  getSseScanErrorPayload,
  getSseScanSuccessPayload,
  registerSseNotification,
} from "utils/server/sse-hub";
import { checkIsFirstTimeUsingMonthlyTicket } from "utils/server/booking";
import {
  USER_BOOKING_SELECT_FIELDS,
  USER_TICKET_WITHIN_INCLUDE_FIELDS,
  USER_TENANT_WITHIN_INCLUDE_FIELDS,
} from "utils/server/db-fields-selector";
import { MESSAGES } from "constants/messages";
import { GROUP_TICKET_TYPES } from "constants/ticket";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.STAFF]));

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  logRequest(req);
  const { barCode, performedAt } = req.body;
  const parsedPerformedAt = truncateToMinute(performedAt);
  const today = new Date();

  const tenantCode = req.user?.tenantCode;

  if (!barCode) {
    return res.status(400).json({ error: "バーコードが必要です" });
  }

  const isExisting = await checkExistingBarCode(barCode);
  if (!isExisting) {
    return res.status(400).json({
      error: "バーコードの読み取りに失敗しました。再度お試しください。",
    });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      barCode,
      createdAt: { gte: getDateOneYearAgo(today) },
      tenantCode,
    },
    include: {
      User: true,
      Tenant: true,
      Ticket: {
        include: {
          TicketDetail: true,
          TicketDiscountSetting: true,
          TicketBookingSchedule: { where: { deleted: false } },
        },
      },
      TicketBookingSchedule: true,
      PartialCheckout: {
        where: {
          deleted: false,
        }
      },
    },
  });

  if (bookings.length === 0) {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_BAR_CODE });
  }

  const checkedInBookings = bookings.filter(
    (b) => b.status === BookingStatus.CheckedIn,
  );
  const checkableBookings = bookings.filter((b) =>
    (
      [
        BookingStatus.Successful,
        BookingStatus.Waiting,
        BookingStatus.Calling,
      ] as string[]
    ).includes(b.status),
  );
  const ownerUserId = (bookings[0] as any).User?.id;
  const isV2Tenant =
    (bookings[0] as any)?.Tenant?.allowedVersion === CHECK_IN_OUT_TENANT_VERSION;

  /* ─────────── CHECKOUT ─────────── */
  if (checkedInBookings.length > 0) {
    const checkoutBookingIds = checkedInBookings.map((b) => b.id);
    let checkedOutBookings: Booking[] = [];
    // 仮販売 head ids created via the Smaregi API inside the transaction — used to roll them back if
    // the DB transaction fails (the API calls are not part of the DB transaction).
    const createdTemporaryHeadIds: string[] = [];
    // Confirmed (already-settled) sale head ids created for prepaid bookings inside the transaction —
    // if the DB transaction fails, these must be cancelled (not just deleted like a pending 仮販売).
    const createdConfirmedHeadIds: string[] = [];

    try {
      await prisma.$transaction(
        async (tx: PrismaClient) => {
          // Lock the rows (FOR UPDATE SKIP LOCKED) and re-validate status to prevent a concurrent
          // scan from checking out the same booking twice.
          const locked = await selectBookingsForUpdate(tx, checkoutBookingIds);
          const stillCheckedInIds = new Set(
            locked
              .filter((b) => b.status === BookingStatus.CheckedIn)
              .map((b) => b.id),
          );
          checkedOutBookings = (
            checkedInBookings as unknown as Booking[]
          ).filter((b) => stillCheckedInIds.has(b.id));
          await performCheckOut(
            checkedOutBookings,
            parsedPerformedAt,
            tx,
            createdTemporaryHeadIds,
            createdConfirmedHeadIds,
          );
        },
        { timeout: DEFAULT_TRANSACTION_TIMEOUT },
      );
    } catch (error) {
      // Transaction rolled back, but the 仮販売 were already created in Smaregi — delete them so the
      // POS side stays consistent with the DB. Uses the tenant's Smaregi contract id (the whole scan
      // is scoped to one tenant); skip if it isn't configured.
      const smaregiContractId = (bookings[0] as any)?.Tenant?.smaregiContractId;
      if (smaregiContractId) {
        Promise.allSettled(
          createdTemporaryHeadIds.map((id) =>
            deleteTemporaryTransaction(smaregiContractId, id),
          ),
        );
        // Confirmed sales are already-settled, real transactions — cancel (not delete) them.
        cancelConfirmedTransactionsAfterRollback(smaregiContractId, createdConfirmedHeadIds);
      }
      registerSseNotification(
        ownerUserId,
        getSseScanErrorPayload(
          (error as any)?.message || ERROR_MESSAGES.INTERNAL_ERROR,
        ),
      );
      throw error;
    }

    const firstBooking = checkedOutBookings[0] as any;
    const ownerBookingUser = firstBooking?.User;
    // Post-commit side effects (kept out of the transaction).
    if (checkedOutBookings.length > 0) {
      EmailService.sendEmail(
        [firstBooking.subEmail, ownerBookingUser?.email],
        EMAIL_SETTING_KEY.USER_CHECK_OUT,
        { name: ownerBookingUser?.name },
      );
      for (const booking of checkedOutBookings) {
        await chooseNextCallingBookingsAndSendNotifications(
          (booking as any).ticketId,
        );
      }
    }
    const checkedoutIds = checkedOutBookings.map((b) => b.id);
    const [updatedBookings, hasRemainingCheckout] = await Promise.all([
      getBookingByIds(checkedoutIds, true),
      hasRemainingCheckoutBookings(ownerBookingUser?.id, checkedoutIds),
    ]);
    await attachFirstTimeUsingMonthlyTicketFlag(updatedBookings);

    const needPayment = updatedBookings.some(
      (b) => (b as any).paymentStatus === PaymentStatus.Pending,
    );

    registerSseNotification(
      ownerBookingUser?.id,
      getSseScanSuccessPayload(MESSAGES.CHECKOUT_SUCCESS, {
        checkOut: { barCode, hasRemaining: hasRemainingCheckout, needPayment },
      }),
    );
    return res.status(200).json({
      data: {
        action: "checkout",
        ...formatCheckedOutBookings(updatedBookings, isV2Tenant),
      },
    });
  }

  /* ─────────── CHECK-IN ─────────── */
  if (checkableBookings.length > 0) {
    // a booking not yet called (status !== Calling) must not be
    // checked in by scanning while its ticket's entry capacity is still full — checked against live
    // occupancy rather than `status === Waiting`, since sibling bookings under the same barCode can
    // still be Successful even when the queue is full.
    const uncalledTicketIds = Array.from(
      new Set(
        checkableBookings
          .filter((b) => b.status !== BookingStatus.Calling)
          .map((b) => b.ticketId),
      ),
    );
    const capacityStatuses = await Promise.all(
      uncalledTicketIds.map((ticketId) => getEntryCapacityStatus(ticketId)),
    );
    if (capacityStatuses.some((status) => status?.isFull)) {
      registerSseNotification(
        ownerUserId,
        getSseScanErrorPayload(ERROR_MESSAGES.BOOKING_IS_WAITING_FOR_CALL),
      );
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.BOOKING_IS_WAITING_FOR_CALL });
    }

    if (!checkBookingsDate(checkableBookings)) {
      registerSseNotification(
        ownerUserId,
        getSseScanErrorPayload(ERROR_MESSAGES.INVALID_DATE_BAR_CODE),
      );
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.INVALID_DATE_BAR_CODE });
    }
    if (!checkBookingsStatus(checkableBookings)) {
      registerSseNotification(
        ownerUserId,
        getSseScanErrorPayload(ERROR_MESSAGES.INVALID_STATUS_BAR_CODE),
      );
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.INVALID_STATUS_BAR_CODE });
    }
    if (!checkPaymentStatus(checkableBookings)) {
      registerSseNotification(
        ownerUserId,
        getSseScanErrorPayload(ERROR_MESSAGES.INVALID_PAYMENT_BAR_CODE),
      );
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.INVALID_PAYMENT_BAR_CODE });
    }
    if (!canCheckIn(checkableBookings)) {
      registerSseNotification(
        ownerUserId,
        getSseScanErrorPayload(ERROR_MESSAGES.ALREADY_USED_BAR_CODE),
      );
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.ALREADY_USED_BAR_CODE });
    }

    const bookingIds = checkableBookings.map((b) => b.id);
    await prisma.$transaction(
      async (tx: PrismaClient) => {
        const locked = await selectBookingsForUpdate(tx, bookingIds);
        const filtered = locked.filter(
          (b) =>
            !(
              [
                BookingStatus.Cancelled,
                BookingStatus.SystemCancelled,
              ] as string[]
            ).includes(b.status),
        );
        await performCheckIn(filtered, tx);
      },
      { timeout: DEFAULT_TRANSACTION_TIMEOUT },
    );

    const [updatedBookings, hasRemainingCheckIn] = await Promise.all([
      getBookingByIds(checkableBookings.map((b) => b.id)),
      hasRemainingCheckInBookings(ownerUserId, bookingIds),
    ]);
    await attachFirstTimeUsingMonthlyTicketFlag(updatedBookings);

    registerSseNotification(
      ownerUserId,
      getSseScanSuccessPayload(MESSAGES.CHECKIN_SUCCESS, {
        checkIn: { hasRemainingCheckIn },
      }),
    );
    return res.status(200).json({
      data: {
        action: "checkin",
        bookings: attachTicketNumbering(updatedBookings).map(formatBookingResult),
      },
    });
  }

  registerSseNotification(
    (bookings[0] as any).User?.id,
    getSseScanErrorPayload(ERROR_MESSAGES.ALREADY_USED_BAR_CODE),
  );
  return res.status(400).json({ error: ERROR_MESSAGES.ALREADY_USED_BAR_CODE });
});

const ticketUseInDayCondition = () => {
  return [
    { Ticket: { type: { notIn: GROUP_TICKET_TYPES } } },
    { parentBookingId: { not: null } },
  ];
};

const hasRemainingCheckoutBookings = async (
  ownerUserId: number,
  excludedBookingIds: number[],
): Promise<boolean> => {
  const remainingCheckOutBookingCount = await prisma.booking.count({
    where: {
      AND: [
        {
          userId: ownerUserId,
          id: { notIn: excludedBookingIds },
          date: newDateKeepLocalTime(),
          status: BookingStatus.CheckedIn,
          Ticket: {
            Tenant: {
              allowedVersion: CHECK_IN_OUT_TENANT_VERSION,
            },
          },
        },
        {
          OR: [...ticketUseInDayCondition()],
        },
      ],
    },
  });

  return remainingCheckOutBookingCount > 0;
};

const hasRemainingCheckInBookings = async (
  ownerUserId: number,
  excludedBookingIds: number[],
): Promise<boolean> => {
  const remainingCheckInBookingCount = await prisma.booking.count({
    where: {
      AND: [
        {
          userId: ownerUserId,
          id: { notIn: excludedBookingIds },
          date: newDateKeepLocalTime(),
          status: {
            in: [
              BookingStatus.Successful,
              BookingStatus.Waiting,
              BookingStatus.Calling,
            ],
          },
          Ticket: {
            Tenant: {
              allowedVersion: CHECK_IN_OUT_TENANT_VERSION,
            },
          },
        },
        {
          OR: [...ticketUseInDayCondition()],
        },
      ],
    },
  });

  return remainingCheckInBookingCount > 0;
};

const getBookingByIds = async (ids: number[], isCheckedOut = false) => {
  let commonSelect = {
    ...USER_BOOKING_SELECT_FIELDS,
    User: true,
    Ticket: {
      include: {
        TicketDetail: true,
        TicketDiscountSetting: true,
        TicketBookingSchedule: { where: { deleted: false } },
      },
    },
  } as Prisma.BookingSelect;

  if (isCheckedOut) {
    commonSelect = {
      ...USER_BOOKING_SELECT_FIELDS,
      Ticket: {
        select: {
          ...USER_TICKET_WITHIN_INCLUDE_FIELDS,
          TicketDetail: true,
          TicketDiscountSetting: true,
          TicketBookingSchedule: { where: { deleted: false } },
        },
      },
      Tenant: { select: USER_TENANT_WITHIN_INCLUDE_FIELDS },
      BookingChildAgeInfo: true,
      TicketBookingSchedule: true,
      // select partial checkout included deleted for re-calculate the extended price for hourly booking
      PartialCheckout: { include: { BookingChildAgeInfo: true } },
    };
  }

  return prisma.booking.findMany({
    select: commonSelect,
    where: {
      id: { in: ids },
    },
  });
};

/* ─────────────────────────────────────────────────────────
   Check-In helper  (logic từ /api/pos/bookings/check-in.ts)
───────────────────────────────────────────────────────── */
const performCheckIn = async (bookings: any[], tx: PrismaClient) => {
  const checkedInAt = new Date();
  const updatePromises = [];
  const partialCheckedOutBookingIds = [];

  for (const booking of bookings) {
    if (canCheckIn([booking])) {
      updatePromises.push(
        tx.booking.update({
          where: { id: booking.id },
          data: {
            checkedInAt,
            status: BookingStatus.CheckedIn,
            partialCheckedOutAdultQuantity: null,
            partialCheckedOutChildQuantity: null,
            partialCheckedOutAt: null,
            requestedReCheckInAt: null,
            reCheckInCount: { increment: booking.requestedReCheckInAt ? 1 : 0 },
          },
        }),
      );
      partialCheckedOutBookingIds.push(booking.id);
    }
  }

  await Promise.all(updatePromises);

  if (partialCheckedOutBookingIds.length) {
    await tx.partialCheckout.deleteMany({
      where: { bookingId: { in: partialCheckedOutBookingIds } },
    });
  }
};

/* ─────────────────────────────────────────────────────────
   Check-Out helper  (logic từ /api/pos/bookings/check-out.ts)
───────────────────────────────────────────────────────── */
const performCheckOut = async (
  bookings: Booking[],
  checkedOutAt: Date,
  tx: PrismaClient,
  createdTemporaryHeadIds: string[] = [],
  createdConfirmedHeadIds: string[] = [],
) => {
  let updatedTotalAmount = false;
  let updatedFirstCheckedOutBookingId = false;
  const hasOfflineBookings = bookings.some(
    (b) => (b.Ticket as any)?.paymentType !== PaymentType.Online,
  );
  const totalAmount = calculateTotalBookingsPayAmount(
    checkedOutAt,
    bookings,
    true,
  );

  // Resolve the tenant once, from within the transaction — a scan is scoped to a single tenant (one
  // barCode belongs to one tenant code). Shared by both the per-booking confirmed-transaction gate
  // below and the batched 仮販売 created after the loop.
  const tenantCode = (bookings[0] as any)?.tenantCode as string | undefined;
  const tenant = tenantCode
    ? await tx.tenant.findUnique({ where: { code: tenantCode } })
    : null;
  const isSmaregiTransactionTenant =
    !!tenant && tenant.allowedVersion === CHECK_IN_OUT_TENANT_VERSION;

  // A scan always checks out a single barCode → accumulate every booking's charge lines into one
  // 仮販売 (created after the loop). The barCode / checkedInAt are captured once.
  const smaregiItems: SmaregiTemporaryGroupItem[] = [];
  let smaregiBarCode: string | null = null;
  let smaregiCheckedInAt: Date | null = null;

  // Prepaid bookings needing a confirmed Smaregi sale — gathered during the loop, created one-by-one
  // after it (mirrors createSmaregiTemporaryTransaction's batched-after-the-loop placement below).
  const confirmedTransactionRequests: ConfirmedTransactionRequest[] = [];

  for (const booking of bookings) {
    let lastStayDuration = calculateStayingDurationWithoutParsing(
      (booking as any).checkedInAt,
      checkedOutAt,
    );
    let stayDuration = booking.stayDuration
      ? booking.stayDuration + lastStayDuration
      : lastStayDuration;

    if ((booking as any).partialCheckedOutAt) {
      lastStayDuration = undefined;
      stayDuration = undefined;
    }

    let parentBooking = booking;
    let isFirstTimeUsingMonthlyTicket = true;
    if (booking.parentBookingId) {
      [parentBooking, isFirstTimeUsingMonthlyTicket] = await Promise.all([
        tx.booking.findUnique({
          where: {
            id: booking.parentBookingId,
          },
          include: {
            Ticket: {
              include: {
                TicketDetail: true,
                TicketDiscountSetting: true,
                TicketBookingSchedule: { where: { deleted: false } },
              },
            },
            TicketBookingSchedule: true,
          },
        }),
        checkIsFirstTimeUsingMonthlyTicket(booking),
      ]);
    }

    const sameTicketBookings = bookings.filter(
      (b) => (b as any).ticketId === (booking as any).ticketId,
    );
    // Single source of truth for per-person charges → projected to both the Smaregi side and OBIC ledger.
    const chargeLines = calculateCheckoutCharges(
      booking,
      sameTicketBookings as any[],
      checkedOutAt,
      parentBooking,
      isFirstTimeUsingMonthlyTicket,
    );
    const smaregiQRCodes = toSmaregiQRCodes(chargeLines);
    const nextRevision = await getNextObicRevision(booking.id);
    const obicRows = flattenObicCodesForLedger(
      toObicCodes(chargeLines),
      booking.id,
      nextRevision,
      checkedOutAt,
    );
    const webTotalAmount = totalAmount;

    // Prepaid-online tickets (ticket price already collected via GMO at booking time) get ONE
    // confirmed Smaregi sale instead of contributing to the shared 仮販売 batch below — see
    // resolvePrepaidChargeLines in smaregiSync.ts.
    const { temporaryChargeLines, confirmedTransactionRequest } =
      resolvePrepaidChargeLines(booking, chargeLines, isFirstTimeUsingMonthlyTicket, parentBooking);
    if (confirmedTransactionRequest) {
      confirmedTransactionRequests.push(confirmedTransactionRequest);
    }

    // Accumulate this booking's remaining charge lines into the single 仮販売 for this scan (created
    // after the loop). Skip bookings already paid via Smaregi in a previous cycle
    // (isSmaregiScanned=true) to avoid double-charging on re-check-in. New tickets bought during
    // re-check-in have isSmaregiScanned=false.
    if (temporaryChargeLines && temporaryChargeLines.length > 0 && !(booking as any).isSmaregiScanned) {
      if (!smaregiBarCode) {
        smaregiBarCode = (booking as any).barCode as string;
        smaregiCheckedInAt = (booking as any).checkedInAt as Date | null;
      }
      smaregiItems.push({
        ticketName: booking.Ticket?.name ?? "",
        lines: temporaryChargeLines,
      });
    }

    const canUpdatePaymentStatus =
      booking.Ticket?.paymentType === PaymentType.Offline ||
      !(
        [TicketType.Monthly, TicketType.DailyTimesLimit] as unknown as string[]
      ).includes(booking.Ticket?.type);

    const zeroSalesPrice =
      chargeLines !== null &&
      chargeLines.length > 0 &&
      sumSalesPrice(chargeLines) === 0;

    let paymentStatus = booking.paymentStatus;
    if (zeroSalesPrice) {
      paymentStatus = PaymentStatus.Completed;
    } else if (canUpdatePaymentStatus) {
      paymentStatus = (booking.checkedOutAt || booking.firstCheckedInAt)
        ? PaymentStatus.Completed
        : booking.GMOTransactionId
          ? PaymentStatus.Completed
          : PaymentStatus.Pending;
    }

    const updateData: any = {
      checkedOutAt,
      status: BookingStatus.CheckedOut,
      paymentStatus,
      firstCheckedInAt:
        (booking as any).firstCheckedInAt || (booking as any).checkedInAt,
      firstCheckoutAt: (booking as any).firstCheckoutAt || checkedOutAt,
      requestedReCheckInAt: null,
      partialCheckedOutAdultQuantity: null,
      partialCheckedOutChildQuantity: null,
      stayDuration,
      lastStayDuration,
      ...(smaregiQRCodes ? { smaregiQRCodes, webTotalAmount } : {}),
    };

    if (
      !isNil(totalAmount) &&
      ((booking.Ticket as any)?.paymentType !== PaymentType.Online ||
        (!hasOfflineBookings &&
          (booking.Ticket as any)?.type === TicketType.HourlyTimesLimit &&
          (booking as any).parentBookingId))
    ) {
      if (!updatedTotalAmount) {
        updateData.totalAmount = new Prisma.Decimal(
          booking.totalAmount || 0,
        ).add(totalAmount);
        updatedTotalAmount = true;
      } else {
        if (isNil(booking.totalAmount)) {
          updateData.totalAmount = 0 as any;
        }
      }
    }
    await prisma.bookingObicCode.updateMany({
      where: { bookingId: booking.id, deleted: false },
      data: { deleted: true },
    });

    // All writes run on the locked transaction (tx), so they are atomic with the FOR UPDATE lock
    // acquired by the caller. Run sequentially — an interactive transaction shares one connection.
    await tx.booking.update({
      where: { id: booking.id },
      data: updateData as any,
    });
    await tx.partialCheckout.deleteMany({ where: { bookingId: booking.id } });

    if (obicRows.length > 0) {
      await tx.bookingObicCode.createMany({ data: obicRows });
    }

    // Record the first user's checked out booking id
    if (
      !booking.User.firstCheckedOutBookingId &&
      !updatedFirstCheckedOutBookingId
    ) {
      await tx.user.update({
        where: { id: booking.User.id },
        data: { firstCheckedOutBookingId: booking.id },
      });
      updatedFirstCheckedOutBookingId = true;
    }
  }

  // Confirmed sales for prepaid bookings gathered above — see syncConfirmedTransactionsForPrepaidBookings.
  if (confirmedTransactionRequests.length > 0 && isSmaregiTransactionTenant) {
    await syncConfirmedTransactionsForPrepaidBookings(
      confirmedTransactionRequests,
      tenant,
      checkedOutAt,
      tx,
      createdConfirmedHeadIds,
    );
  }

  // One 仮販売 for the scan, built from the accumulated charge lines of every booking under the barCode.
  // Created via the Smaregi API; throws on failure (aborting the checkout transaction). The returned
  // head id is tracked so the caller can delete the 仮販売 if the transaction later rolls back.
  if (smaregiBarCode && isSmaregiTransactionTenant) {
    if (!enabledTenantSmaregiSetting(tenant)) {
      throw new Error(ERROR_MESSAGES.MISSING_SMAREGI_CONFIG_FOR_TENANT);
    }
    const smaregiTemporaryTransaction = await createSmaregiTemporaryTransaction(
      smaregiBarCode,
      smaregiItems,
      tenant,
      smaregiCheckedInAt,
      tx,
    );
    await persistSmaregiTemporaryTransaction(smaregiTemporaryTransaction, tx, createdTemporaryHeadIds);
  }
};

// Marks each day-booking of a monthly / yearly / DailyTimesLimit pass as the pass's first use or not,
// via the same helper that decides revenue recognition. HourlyTimesLimit is excluded — it can still
// charge overtime on any use.
const attachFirstTimeUsingMonthlyTicketFlag = async (bookings: any[]) => {
  await Promise.all(
    bookings.map(async (b) => {
      // Guard: without parentBookingId the helper queries `parent_booking_id IS NULL` and matches unrelated bookings.
      if (!b.parentBookingId || !isGroupTicket(b.Ticket?.type)) return;
      b.isFirstTimeUsingMonthlyTicket = await checkIsFirstTimeUsingMonthlyTicket(b);
    }),
  );
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
  reCheckInCount: b.reCheckInCount,
  isFirstTimeUsingMonthlyTicket: b.isFirstTimeUsingMonthlyTicket,
});

// Partial checkouts are soft-deleted on every full checkout / re-check-in, so the relation (fetched
// without a `deleted` filter) can carry rows from a prior check-in cycle for repeat-entry tickets —
// scope to the current session the same way rollback-scan.ts does (checkedOutAt after checkedInAt),
// then collapse same-timestamp adult/child rows into one timeline entry.
const buildPartialCheckoutTimeline = (booking: any) => {
  const currentSessionCheckouts = (booking.PartialCheckout || []).filter((pc: any) =>
    isAfterTime(pc.checkedOutAt, booking.checkedInAt),
  );
  const grouped = new Map<number, { checkedOutAt: Date; adultQuantity: number; childQuantity: number }>();
  for (const pc of currentSessionCheckouts) {
    const key = new Date(pc.checkedOutAt).getTime();
    const entry = grouped.get(key) || { checkedOutAt: pc.checkedOutAt, adultQuantity: 0, childQuantity: 0 };
    if (pc.isAdult) {
      entry.adultQuantity += pc.quantity;
    } else {
      entry.childQuantity += pc.quantity;
    }
    grouped.set(key, entry);
  }
  return Array.from(grouped.values()).sort(
    (a, b) => new Date(a.checkedOutAt).getTime() - new Date(b.checkedOutAt).getTime(),
  );
};

const formatCheckedOutBookings = (checkedOutBookings: Booking[], isV2Tenant: boolean) => {
  const { bookingsPriceListMap } = calculateBookingsPriceMap(
    checkedOutBookings as Booking[],
  );

  const numberedBookings = attachTicketNumbering(checkedOutBookings);

  // v2 only: performCheckOut folds the whole barCode group's pay amount onto ONE booking's raw
  // totalAmount (the first offline booking it processes), not split across bookings — reuse that
  // value as-is for the group total instead of re-summing, and force every per-card 利用料金 to its
  // own discount-adjusted amount (bookingsPriceListMap) so the aggregate isn't shown twice on a card.
  // Only bookings performCheckOut actually adds the pay amount onto are eligible candidates — the same
  // predicate as its `updateData.totalAmount` guard above. Everything else (oneday online, monthly/annual
  // pass, times-limit ticket) keeps its own already-paid purchase price in `totalAmount`, which must NOT
  // leak into "amount due" here.
  const hasOfflineBookings = numberedBookings.some(
    (b) => (b.Ticket as any)?.paymentType !== PaymentType.Online,
  );
  // Bookings already paid in a prior cycle (isSmaregiScanned=true, carried over across re-check-in —
  // performCheckIn never resets it) must be excluded here too, mirroring the same exclusion used at
  // checkout time (line 596) to skip them from the Smaregi 仮販売 batch: their stale `totalAmount`
  // still reflects that earlier, already-settled payment and must not leak into the group total shown now.
  const isEligibleForTotalAmount = (booking: (typeof numberedBookings)[number]) =>
    !(booking as any).isSmaregiScanned &&
    ((booking.Ticket as any)?.paymentType !== PaymentType.Online ||
      (!hasOfflineBookings &&
        (booking.Ticket as any)?.type === TicketType.HourlyTimesLimit &&
        !!(booking as any).parentBookingId));
  let groupTotalAmount = 0;

  const responseBookings = [];
  for (const booking of numberedBookings) {
    const responseBooking = formatBookingResult(booking);
    const calculatedBookingPrice = bookingsPriceListMap?.[booking.id];
    let chargeAmount = calculatedBookingPrice?.totalAmountAfterDiscount;

    (responseBooking as any).formattedTotalAmount = isV2Tenant
      ? formatThousands(calculatedBookingPrice?.totalAmountAfterDiscount || 0)
      : getFormattedTotalAmount(booking, bookingsPriceListMap);

    if (
      isHourlyTicket(booking.Ticket) ||
      isHourlyTimesLimitTicket(booking.Ticket)
    ) {
      const extendedPrices = calculateBookingExtendedPrices(
        booking as any,
      );
      (responseBooking as any).extendedPrices = extendedPrices;
      chargeAmount += extendedPrices.totalExtendedAmount;
    }

    (responseBooking as any).partialCheckouts = buildPartialCheckoutTimeline(booking);
    if (isEligibleForTotalAmount(booking)) {
      groupTotalAmount += chargeAmount || 0;
    }
    responseBookings.push(responseBooking);
  }
  return {
    bookings: responseBookings,
    totalAmount: isV2Tenant ? formatThousands(groupTotalAmount as number) : undefined,
  };
};

export default handler;
