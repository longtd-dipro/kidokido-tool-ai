import { BookingStatus, TicketBookingSchedule, TicketType } from "@prisma/client";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { DEAFAULT_CHILD_QUANTITY_FIRST_TIME, MAX_LENGTH_TICKET_CODE, SHORT_DATE } from "constants/common";
import { POS_API_ERROR_MESSAGE, POS_API_RESULT_CODE } from "constants/pos-api-result";
import checkPOSAuth from "libs/middleware/checkPOSAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { withLogging } from "libs/middleware/withLogging";
import withPOSApiValidation from "libs/middleware/withPOSApiValidation";
import { barCodeSchema } from "libs/validation/posApiSchema";
import { Booking, Ticket } from "models/Entity";
import { POSResponse } from "models/Response";
import prisma from "utils/db";
import { canCheckIn, checkBookingsDate } from "utils/server/barcode";
import { getTicketBookingSchedule } from "utils/ticket";
import { checkIsFirstTimeUsingMonthlyTicket } from "utils/server/booking";
import { getDateOneYearAgo } from "utils/date-time";
import {
  calculateDiscountAmounts,
  isDailyTimesLimitTicket,
  isHourlyTimesLimitTicket,
  isTimesLimitTicket
} from "utils/booking";

const validate = withPOSApiValidation({
  schema: barCodeSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch }).use(checkPOSAuth);

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<POSResponse>) => {
  const { barCode, noCheck } = req.body;
  const today = new Date();

  const bookings = await prisma.booking.findMany({
    where: { barCode: barCode as string, createdAt: { gte: getDateOneYearAgo(today) } },
    include: {
      TicketBookingSchedule: true,
      Ticket: {
        include: {
          TicketDetail: true,
          TicketDiscountSetting: true,
          TicketBookingSchedule: { where: { deleted: false } },
        },
      },
    },
    orderBy: { id: "asc" },
  });

  if (!bookings.length) {
    return res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.INVALID_BAR_CODE });
  }

  if (!checkBookingsDate(bookings)) {
    const firstBooking = bookings[0];
    return res.status(200).json({
      resultCode: POS_API_RESULT_CODE.E00000400,
      error: POS_API_ERROR_MESSAGE.INVALID_DATE_BAR_CODE,
      date: moment(firstBooking.date).format(SHORT_DATE),
    });
  }

  if (!noCheck && !canCheckIn(bookings)) {
    return res.status(200).json({
      resultCode: POS_API_RESULT_CODE.E00000400,
      error: POS_API_ERROR_MESSAGE.ALREADY_USED_BAR_CODE,
    });
  }

  const results = [];
  const dedupePOSCodesInParentIds = [];
  for (const booking of bookings) {
    const { Ticket, paymentStatus, id, ticketId, tenantCode, date, adultPrice, childPrice, status } = booking;

    const basePeriodPrices = getBasePeriodPrices(Ticket, booking.TicketBookingSchedule);
    let adultTicketCode = Ticket.adultTicketCode;
    let childTicketCode = Ticket.childTicketCode;
    const isGroupTicket = Ticket.type === TicketType.Monthly || isTimesLimitTicket(Ticket.type);
    let isSameTicketBooked = false;
    if (isGroupTicket) {
      const monthlyTicketCodes = await generateMonthlyBookingTicketCodes(booking);
      adultTicketCode = monthlyTicketCodes.adultTicketCode;
      childTicketCode = monthlyTicketCodes.childTicketCode;
      // Deduplicate childCode for the first time using ticket by parentBookingId
      if (childTicketCode == Ticket.childTicketCode) {
        if (dedupePOSCodesInParentIds.includes(booking.parentBookingId)) {
          childTicketCode += 1;
          isSameTicketBooked = true;
        } else {
          dedupePOSCodesInParentIds.push(booking.parentBookingId);
        }
      }
    }

    let adultQuantity = booking.adultQuantity;
    let childQuantity = booking.childQuantity;
    let parentMonthlyBooking = null;
    let isFirstTimeUsingTicket = false;
    if (isGroupTicket) {
      isFirstTimeUsingTicket = await checkIsFirstTimeUsingMonthlyTicket(booking);
      if (isFirstTimeUsingTicket && Ticket.type === TicketType.Monthly) {
        parentMonthlyBooking = await prisma.booking.findUnique({
          where: { id: booking.parentBookingId },
          include: {
            TicketBookingSchedule: true,
            Ticket: {
              include: {
                TicketDetail: true,
                TicketDiscountSetting: true,
                TicketBookingSchedule: { where: { deleted: false } },
              },
            },
          },
        });
        adultQuantity = parentMonthlyBooking.adultQuantity;
        childQuantity = parentMonthlyBooking.childQuantity;
      }
    }

    const sameTicketBookings = bookings.filter(b => b.ticketId === booking.ticketId);
    let { adultDiscountAmount, childDiscountAmount } = calculateDiscountAmounts(parentMonthlyBooking || booking, sameTicketBookings);
    let finalAdultPrice = +adultPrice;
    let finalChildPrice = +childPrice;
    if (isHourlyTimesLimitTicket(Ticket) || !Ticket.canBookInAdvance) {
      finalAdultPrice = basePeriodPrices ? basePeriodPrices.baseAdultPeriodPrice : null;
      finalChildPrice = basePeriodPrices ? basePeriodPrices.baseChildPeriodPrice : null;
    } else if (isDailyTimesLimitTicket(Ticket)) {
      finalAdultPrice = +Ticket.TicketDetail.adultPrice;
      finalChildPrice = +Ticket.TicketDetail.childPrice;
    }

    // Calculate child discount amount for times limit ticket
    if (
      isTimesLimitTicket(Ticket.type) &&
      !isSameTicketBooked &&
      isFirstTimeUsingTicket &&
      childQuantity > DEAFAULT_CHILD_QUANTITY_FIRST_TIME 
    ) {
      childDiscountAmount = (childQuantity - DEAFAULT_CHILD_QUANTITY_FIRST_TIME) * finalChildPrice;
    }
    const bookingItem = {
      id,
      ticketId,
      ticketName: Ticket.name,
      tenantCode,
      date: moment(date).format(SHORT_DATE),

      adultQuantity,
      adultTicketCode: adultTicketCode.toString().padStart(MAX_LENGTH_TICKET_CODE, "0"),
      adultTicketName: Ticket.name,
      adultPrice: finalAdultPrice,
      adultDiscountAmount,
      adultPaymentStatus: paymentStatus,

      childQuantity,
      childTicketCode: childTicketCode.toString().padStart(MAX_LENGTH_TICKET_CODE, "0"),
      childTicketName: Ticket.name,
      childPrice: finalChildPrice,
      childDiscountAmount,
      childPaymentStatus: paymentStatus,
      status,
      can_check_in: canCheckIn([booking]),
    };
    results.push(bookingItem);
  }

  res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000000, bookings: results });
});

export default withLogging(handler);

const getBasePeriodPrices = (ticket: Ticket, ticketBookingSchedule: TicketBookingSchedule) => {
  let baseAdultPeriodPrice = 0;
  let baseChildPeriodPrice = 0;

  if (([TicketType.Daily, TicketType.Hourly, TicketType.HourlyTimesLimit] as string[]).includes(ticket.type)) {
    const bookingSchedule = ticketBookingSchedule || getTicketBookingSchedule(moment().toISOString(), ticket);
    if (bookingSchedule) {
      baseAdultPeriodPrice = +bookingSchedule.baseAdultPeriodPrice;
      baseChildPeriodPrice = +bookingSchedule.baseChildPeriodPrice;
    }
  } else {
    baseAdultPeriodPrice = +ticket.TicketDetail.adultPrice;
    baseChildPeriodPrice = +ticket.TicketDetail.childPrice;
  }

  return { baseAdultPeriodPrice, baseChildPeriodPrice };
};

const generateMonthlyBookingTicketCodes = async (booking: Booking) => {
  const checkedOutBookingTimes = await prisma.booking.count({
    where: {
      AND: [
        { parentBookingId: booking.parentBookingId, },
        {
          OR: [
            { status: BookingStatus.CheckedOut },
            { status: { in: [BookingStatus.Calling, BookingStatus.Waiting, BookingStatus.CheckedIn, BookingStatus.Successful] }, checkedOutAt: { not: null } }
          ]
        }
      ]
    },
  });

  const isCheckedInAtLeastSecondTimes = checkedOutBookingTimes > 0 || (checkedOutBookingTimes === 0 && booking.checkedInAt && booking.firstCheckedInAt);

  const increaseNumber = isCheckedInAtLeastSecondTimes ? 1 : 0;
  return { childTicketCode: booking.Ticket.childTicketCode + increaseNumber, adultTicketCode: booking.Ticket.adultTicketCode };
};

