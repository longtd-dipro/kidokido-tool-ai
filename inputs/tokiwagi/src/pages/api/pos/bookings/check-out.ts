import { BookingStatus, PaymentStatus, PaymentType, Prisma, TicketType } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { isNil } from "lodash";

import { POS_API_ERROR_MESSAGE, POS_API_RESULT_CODE } from "constants/pos-api-result";
import checkPOSAuth from "libs/middleware/checkPOSAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withPOSApiValidation from "libs/middleware/withPOSApiValidation";
import { checkoutPayloadSchema } from "libs/validation/posApiSchema";
import { checkExistingBarCode } from "utils/server/barcode";
import prisma from "utils/db";
import { chooseNextCallingBookingsAndSendNotifications } from "utils/server/booking-queue";
import { withLogging } from "libs/middleware/withLogging";
import EmailService from "services/email.service";
import { EMAIL_SETTING_KEY } from "constants/settings";
import { Booking } from "models/Entity";
import { calculateStayingDuration, getDateOneYearAgo, isAfterTime, isBeforeTime, isSameDay, isSameTime } from "utils/date-time";
import { countAdultQuantityInPartialCheckout, countChildQuantityInPartialCheckout, isHourlyBooking, isHourlyTimesLimitBooking } from "utils/booking";
import { checkIsFirstTimeUsingMonthlyTicket } from "utils/server/booking";
import { calculateObicCodesV2, flattenObicCodesForLedger, getNextObicRevision, softDeleteObicCodesForRollback } from "utils/server/obicCodes";
import { DEFAULT_TRANSACTION_TIMEOUT } from "constants/common";

const validate = withPOSApiValidation({
  schema: checkoutPayloadSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch }).use(checkPOSAuth);

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse) => {
  const { barCode, totalAmount, coupons } = req.body;
  const today = new Date();

  const isExistingBarCode = await checkExistingBarCode(barCode);
  if (!isExistingBarCode) {
    return res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.INVALID_BAR_CODE });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      barCode: barCode as string,
      createdAt: { gte: getDateOneYearAgo(today) },
    },
    include: {
      User: true,
      Ticket: {
        include: {
          TicketDetail: true,
          TicketDiscountSetting: true,
          TicketBookingSchedule: { where: { deleted: false } },
        },
      },
      TicketBookingSchedule: true,
    },
  });

  const checkedInBookings = bookings.filter((booking) => booking.status === BookingStatus.CheckedIn);
  if (checkedInBookings.length === 0) {
    return res.status(400).json({ resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.BOOKING_HAS_NOT_CHECKED_IN });
  }
  const firstCheckedInBooking = checkedInBookings[0];

  const hasOfflineBookings = checkedInBookings.some((booking) => booking.Ticket.paymentType !== PaymentType.Online);
  const checkedOutAt = new Date();
  let updatedTotalAmount: Boolean = false;
  let updatedFirstCheckedOutBookingId: Boolean = false;
  for (let i = 0; i < checkedInBookings.length; i++) {
    const booking = checkedInBookings[i];

    let lastStayDuration = calculateStayingDuration(booking.checkedInAt, checkedOutAt);
    let stayDuration = booking.stayDuration ? booking.stayDuration + lastStayDuration : lastStayDuration;
    // skip calculate and save stayDuration/lastStayDuration when booking proceed fully partial checked out all people
    if (booking.partialCheckedOutAt) {
      lastStayDuration = undefined;
      stayDuration = undefined;
    }

    let allCoupons = booking.coupons || undefined;
    if (coupons) {
      allCoupons = allCoupons ? (allCoupons as Prisma.JsonArray).concat(coupons) : coupons;
    }

    let parentBooking = booking as Booking;
    let isFirstTimeUsingMonthlyTicket = true;
    if (booking.parentBookingId) {
      [parentBooking, isFirstTimeUsingMonthlyTicket] = await Promise.all([
        prisma.booking.findUnique({
          where: {
            id: booking.parentBookingId
          },
          include: {
            Ticket: {
              include: {
                TicketDetail: true,
                TicketBookingSchedule: true,
                TicketDiscountSetting: true
              },
            },
            TicketBookingSchedule: true,
          },
        }),
        checkIsFirstTimeUsingMonthlyTicket(booking)
      ]);
    }
    const sameTicketBookings = bookings.filter((b) => (b as any).ticketId === (booking as any).ticketId);
    // Compute OBIC codes against the time saved at calculate-pay-amount (the moment the amount
    // was quoted/charged), so the OBIC stats match what was actually collected. Fall back to the
    // live checkout time only when no quote was made.
    const obicCheckedOutAt = booking.tempCheckoutAt ?? checkedOutAt;
    const obicCodes = calculateObicCodesV2(booking, sameTicketBookings as any[], obicCheckedOutAt, parentBooking, isFirstTimeUsingMonthlyTicket);

    const nextRevision = await getNextObicRevision(booking.id);
    const obicRows = flattenObicCodesForLedger(obicCodes, booking.id, nextRevision, checkedOutAt);

    const updateData: Partial<Booking> = {
      checkedOutAt: checkedOutAt,
      status: BookingStatus.CheckedOut,
      paymentStatus: PaymentStatus.Completed,
      coupons: allCoupons,
      firstCheckedInAt: booking.firstCheckedInAt ? booking.firstCheckedInAt : booking.checkedInAt,
      firstCheckoutAt: booking.firstCheckoutAt ? booking.firstCheckoutAt : checkedOutAt,
      requestedReCheckInAt: null,
      partialCheckedOutAdultQuantity: null,
      partialCheckedOutChildQuantity: null,
      stayDuration,
      lastStayDuration,
    };

    // Only update total amount for the first offline booking
    if (!isNil(totalAmount) &&
      (booking.Ticket.paymentType !== PaymentType.Online ||
        (!hasOfflineBookings && booking.Ticket.type == TicketType.HourlyTimesLimit && booking.parentBookingId))) {
      if (!updatedTotalAmount) {
        updateData.totalAmount = new Prisma.Decimal(booking.totalAmount || 0).add(totalAmount);
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

    const transactionPromises: Prisma.PrismaPromise<any>[] = [
      prisma.booking.update({ where: { id: booking.id }, data: updateData as any }),
      prisma.partialCheckout.deleteMany({ where: { bookingId: booking.id } }),
    ];

    if (obicRows.length > 0) {
      transactionPromises.push(prisma.bookingObicCode.createMany({ data: obicRows }));
    }

    // Record the first user's checked out booking id
    if (!booking.User.firstCheckedOutBookingId && !updatedFirstCheckedOutBookingId) {
      transactionPromises.push(
        prisma.user.update({
          where: { id: booking.User.id },
          data: {
            firstCheckedOutBookingId: booking.id
          },
        })
      );

      updatedFirstCheckedOutBookingId = true;
    }

    await prisma.$transaction(transactionPromises);
  }

  EmailService.sendEmail([firstCheckedInBooking.subEmail, firstCheckedInBooking.User.email], EMAIL_SETTING_KEY.USER_CHECK_OUT, {
    name: firstCheckedInBooking.User.name,
  });

  processNextCallingBookings(checkedInBookings);
  res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000000 });
});

handler.delete(validate(handler), async (req: NextApiRequest, res: NextApiResponse) => {
  const { barCode } = req.body;
  const today = new Date();

  const isExistingBarCode = await checkExistingBarCode(barCode);
  if (!isExistingBarCode) {
    return res.status(400).json({ resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.INVALID_BAR_CODE });
  }

  let bookings = await prisma.booking.findMany({
    where: { barCode: barCode as string, createdAt: { gte: getDateOneYearAgo(today) } },
    include: { Ticket: true, PartialCheckout: true, User: true },
  });
  if (bookings.every((booking) => booking.status !== BookingStatus.CheckedOut)) {
    return res.status(400).json({ resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.BOOKING_HAS_NOT_CHECKED_OUT });
  }

  const hasOneDayBookingAndCheckedOutFromSecondTime = bookings.some(
    (booking) => booking.Ticket.type === TicketType.Daily && !checkIsFirstTimeCheckedOut(booking)
  );

  if (hasOneDayBookingAndCheckedOutFromSecondTime) {
    bookings = bookings.filter(
      (booking) => {
        const isHourlyTicket = ([TicketType.Hourly, TicketType.HourlyTimesLimit] as string[]).includes(booking.Ticket.type);
        return !isHourlyTicket || (isHourlyTicket && checkIsFirstTimeCheckedOut(booking));
      }
    );
  }

  let checkedOutBookings = bookings.filter((booking) => booking.status === BookingStatus.CheckedOut);
  const alreadyCheckedOutHourlyBookings = getAlreadyCheckedOutHourlyBookings(checkedOutBookings);
  const alreadyCheckedOutHourlyBookingIds = alreadyCheckedOutHourlyBookings.map((booking) => booking.id);
  checkedOutBookings = checkedOutBookings.filter((booking) => !alreadyCheckedOutHourlyBookingIds.includes(booking.id));

  await rollbackCheckedOutBookings(checkedOutBookings);

  res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000000 });
});

const processNextCallingBookings = async (bookings: Booking[]) => {
  for (let i = 0; i < bookings.length; i++) {
    await chooseNextCallingBookingsAndSendNotifications(bookings[i].ticketId);
  }
};

const checkIsFirstTimeCheckedOut = (booking: Booking) => {
  return isSameTime(booking.checkedInAt, booking.firstCheckedInAt) && isSameDay(booking.checkedInAt, booking.firstCheckedInAt);
};

const getAlreadyCheckedOutHourlyBookings = (checkedOutBookings: Booking[]) => {
  let alreadyCheckedOutHourlyBookings = [];
  const checkedOutAts = checkedOutBookings.map((booking) => booking.checkedOutAt).filter((checkedOutAt) => !!checkedOutAt);
  if (checkedOutAts) {
    const maxCheckedOutAt = Math.max.apply(null, checkedOutAts);
    alreadyCheckedOutHourlyBookings = checkedOutBookings.filter((booking) =>
      (isHourlyBooking(booking) || isHourlyTimesLimitBooking(booking)) && isBeforeTime(booking.checkedOutAt, maxCheckedOutAt));
  }

  return alreadyCheckedOutHourlyBookings;
};

const rollbackCheckedOutBookings = async (bookings: Booking[]) => {
  return await prisma.$transaction(async (tx) => {
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const isFirstTimeCheckedOut = checkIsFirstTimeCheckedOut(booking);
      const lastStayDuration = null;
      const stayDuration = booking.stayDuration - booking.lastStayDuration || null;

      const updateData: Partial<Booking> = {
        checkedOutAt: null,
        status: BookingStatus.CheckedIn,
        coupons: (Prisma.DbNull) as any,
        firstCheckedInAt: isFirstTimeCheckedOut ? null : booking.firstCheckedInAt,
        firstCheckoutAt: isFirstTimeCheckedOut ? null : booking.firstCheckoutAt,
        stayDuration,
        lastStayDuration,
      };

      if ((booking.Ticket.paymentType !== PaymentType.Online || (booking.Ticket.type == TicketType.HourlyTimesLimit && booking.parentBookingId))
        && isFirstTimeCheckedOut) {
        updateData.paymentStatus = PaymentStatus.Pending;
        updateData.totalAmount = null;
      }

      if (booking.PartialCheckout.length) {
        const partialCheckouts = booking.PartialCheckout.filter((item) => isAfterTime(item.checkedOutAt, booking.checkedInAt));
        let totalAdult = 0;
        let totalChild = 0;
        for (const partialCheckout of partialCheckouts) {
          totalAdult += countAdultQuantityInPartialCheckout([partialCheckout]);
          totalChild += countChildQuantityInPartialCheckout([partialCheckout]);
          await tx.partialCheckout.update({ where: { id: partialCheckout.id }, data: { deleted: false } });
        }

        updateData.partialCheckedOutAdultQuantity = totalAdult;
        updateData.partialCheckedOutChildQuantity = totalChild;
      }

      await softDeleteObicCodesForRollback(tx, booking.id);

      await tx.booking.update({
        where: { id: booking.id },
        data: updateData as any,
      });

      // Remove User's firstCheckedOutBookingId if this booking is the first user's checkout booking
      if (isFirstTimeCheckedOut && booking.User.firstCheckedOutBookingId === booking.id) {
        await prisma.user.update({
          where: { id: booking.User.id },
          data: {
            firstCheckedOutBookingId: null
          },
        });
      }
    }
  }, { timeout: DEFAULT_TRANSACTION_TIMEOUT });
};

export default withLogging(handler);
