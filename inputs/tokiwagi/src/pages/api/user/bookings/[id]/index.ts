import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus } from "@prisma/client";

import { DEFAULT_TRANSACTION_TIMEOUT, SHORT_DATE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import { BARCODE_IMG_CID, EMAIL_SETTING_KEY } from "constants/settings";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { bookingSchema } from "libs/validation/schemas";
import { IResponse } from "models/Response";
import EmailService from "services/email.service";
import {
  calculateBookingExtendedPrices,
  checkStatusCanNotUpdateBooking,
  getBookingModificationStatus,
  getShortBarCode,
  isHourlyTicket,
  isHourlyTimesLimitTicket,
  isTimesLimitTicket
} from "utils/booking";
import { validateBooking } from "utils/booking-validation";
import { checkIsEqualArrays } from "utils/common";
import prisma from "utils/db";
import { generateBase64Barcode } from "utils/server/barcode";
import { calcTotalAmount, getLatestBarcodeByBookingBarCode, getPaymentInfoAfterUpdate } from "utils/server/booking";
import { getTicketBookingSchedule } from "utils/ticket";
import { USER_BOOKING_SELECT_FIELDS, USER_TENANT_WITHIN_INCLUDE_FIELDS, USER_TICKET_WITHIN_INCLUDE_FIELDS } from "utils/server/db-fields-selector";
import { logRequest } from "utils/server/request";

const validate = withValidation({
  schema: bookingSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch }).use(checkAuth);

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: +req.query.id,
      userId: req.user.id,
    },
    select: {
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
    },
  });

  if (booking) {
    if (isTimesLimitTicket(booking.Ticket.type)) {
      const parentBookingId = booking.parentBookingId || booking.id;
      const timesLimitTicketUsages = await prisma.booking.groupBy({
        by: ["parentBookingId"],
        where: {
          parentBookingId: parentBookingId,
          status: {
            notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled],
          }
        },
        _sum: {
          childQuantity: true,
        }
      });
      (booking as any).usageTimes = timesLimitTicketUsages.find(ticketUsageCount => ticketUsageCount.parentBookingId === parentBookingId)?._sum?.childQuantity;
    }

    if ((isHourlyTicket(booking.Ticket) || isHourlyTimesLimitTicket(booking.Ticket)) && booking.status == BookingStatus.CheckedOut) {
      (booking as any).extendedPrices = calculateBookingExtendedPrices(booking as any);
    }

    // Attach the latest active 仮販売 barcode to each checked-out booking. Bookings checked out
    // together share a group `barCode`; the newest Normal SmaregiTemporaryTransaction per group
    // (createdAt desc) is the one the POS can still scan.
    const latestSmaregiBarcodes = await getLatestBarcodeByBookingBarCode([booking]);
    (booking as any).smaregiTransactionBarcode = latestSmaregiBarcodes.get(booking.barCode);
  }
  res.status(200).json({ data: { ...booking, PartialCheckout: booking.PartialCheckout?.filter((checkout) => !checkout.deleted) } });
});

handler.put(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  logRequest(req);
  const updateBooking = req.body;

  const tenant = await prisma.tenant.findUnique({
    where: { code: updateBooking.tenantCode }
  });

  const originalBooking = await prisma.booking.findFirst({
    where: {
      id: req.body.id,
    },
    include: {
      Ticket: {
        include: {
          TicketBookingSchedule: { where: { deleted: false } },
        },
      },
    },
  });

  if (!originalBooking) {
    res.status(400).json({ error: ERROR_MESSAGES.BOOKING_NOT_FOUND });
    return;
  }

  const { result: canNotUpdate, errorMessage } = checkStatusCanNotUpdateBooking(originalBooking.status);
  if (canNotUpdate) {
    return res.status(400).json({ error: errorMessage });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: originalBooking.ticketId },
    include: {
      TicketBookingSchedule: {
        where: { deleted: false },
      },
      TicketDetail: true,
      TicketDiscountSetting: true,
    },
  });

  const { canEdit } = getBookingModificationStatus(originalBooking);

  if (!canEdit) {
    return res.status(400).json({ error: ERROR_MESSAGES.BOOKING_CANNOT_EDIT });
  }

  const originTicketBookingSchedule = getTicketBookingSchedule(originalBooking.date.toISOString(), ticket);

  const sameDayBookings = await prisma.booking.findMany({
    where: {
      date: {
        equals: updateBooking.date,
      },
      ticketId: updateBooking.ticketId,
    },
  });

  const { isValid, message } = validateBooking({
    userId: req.user.id,
    bookingPayload: req.body,
    ticketBookingSchedule: originTicketBookingSchedule,
    tickets: [ticket],
    tenants: [tenant],
    sameDayBookings,
    type: "update",
    originalBooking: originalBooking,
  });

  if (!isValid) {
    return res.status(400).json({ error: message });
  }

  let newTotalAmount = calcTotalAmount(updateBooking, ticket, originTicketBookingSchedule);
  updateBooking.totalAmount = newTotalAmount;

  const { isChangePaymentAmount, isRefunded, error } = await getPaymentInfoAfterUpdate(originalBooking, newTotalAmount);
  if (error) {
    return res.status(400).json({ error });
  }
  if (originalBooking.partialCheckedOutAdultQuantity && updateBooking.adultQuantity) {
    updateBooking.partialCheckedOutAdultQuantity -= originalBooking.adultQuantity;
  }
  if (originalBooking.partialCheckedOutChildQuantity && updateBooking.childQuantity) {
    updateBooking.partialCheckedOutChildQuantity -= originalBooking.childQuantity;
  }
  const booking = await updateBookingToDB(updateBooking);

  const emailData = {
    ...booking,
    Ticket: ticket,
    date: moment(booking.date).format(SHORT_DATE),
    childAges: updateBooking.childAges.map((item) => {
      const ageValue = item >= 12 ? item / 12 : item;
      const ageUnit = item >= 12 ? "歳" : "ヶ月";
      return ageValue + " " + ageUnit;
    }),
  };

  const barcodeBase64 = await generateBase64Barcode(booking.barCode);
  const emailKey = EMAIL_SETTING_KEY.BOOKING_UPDATE;

  EmailService.sendEmail([booking.User.email, booking.subEmail], emailKey, {
    name: booking.User.name,
    booking: emailData,
    barcodeImgSrc: barcodeBase64,
    barcodeImgTag: `<img src="cid:${BARCODE_IMG_CID}" alt="bar code" />`,
    shortBarCode: getShortBarCode(booking.barCode),
    cid: BARCODE_IMG_CID,
    attachments: [
      {
        content: barcodeBase64.split("base64,")[1],
        encoding: "base64",
        cid: BARCODE_IMG_CID,
        filename: "barcode",
      },
    ],
  });

  res.status(200).json({ data: { booking, isChangePaymentAmount, isRefunded } });
});

const updateBookingToDB = async (updateBooking) => {
  return await prisma.$transaction(async (tx) => {
    const { childAges, cardSeq, Ticket, updatedAt, coupons, ...payload } = updateBooking;

    const isChangeBookingChildAges = await checkIsChangeBookingChildAges(payload.id, childAges);
    if (isChangeBookingChildAges) {
      await tx.bookingChildAgeInfo.deleteMany({ where: { bookingId: payload.id } });
      const bookingChildAgeInfo = childAges.map((age: number) => ({ bookingId: payload.id, childAgeInMonth: age }));
      await tx.bookingChildAgeInfo.createMany({ data: bookingChildAgeInfo });
    }

    const booking = await tx.booking.update({
      where: {
        id: +payload.id,
      },
      data: payload,
      include: { User: true },
    });

    return booking;
  }, { timeout: DEFAULT_TRANSACTION_TIMEOUT });
};

const checkIsChangeBookingChildAges = async (bookingId: number, childAges: number[]) => {
  const bookingChildAges = await prisma.bookingChildAgeInfo.findMany({ where: { bookingId } });
  const originalChildAges = bookingChildAges.map((item) => item.childAgeInMonth);

  return !checkIsEqualArrays(originalChildAges, childAges);
};

export default handler;
