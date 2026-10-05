import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import moment from "moment";
import { BookingStatus, PaymentStatus } from "@prisma/client";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { bookingPayloadSchema } from "libs/validation/bookingSchema";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { validateBooking } from "utils/booking-validation";
import { executeTransaction, registerTransaction } from "services/gmo.service";
import checkAuth from "libs/middleware/checkAuth";
import { DEFAULT_BOOKINGS_TAKE, TRANSACTION_ERRORS, clampBookingAdvanceDays } from "constants/booking";
import { VACANCY_STATUS } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import { generateBookingBarCode } from "utils/server/barcode";
import { parseGMOResponse } from "utils/gmo";
import { getTicketBookingSchedule } from "utils/ticket";
import { isOnlineOneDayTicket } from "utils/booking";
import { Ticket } from "models/Entity";
import { getNextDaysOneDayOnlineVacancy } from "utils/server/vacancy-status";
import { getDateOneYearAgo, isSameDay } from "utils/date-time";
import { MESSAGES } from "constants/messages";
import { logRequest } from "utils/server/request";
import { sanitizeBooking } from "utils/server/sanitizer";
import { sendOnlineBookingEmail } from "utils/server/booking";

const validate = withValidation({
  schema: bookingPayloadSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch }).use(checkAuth);

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  logRequest(req);
  const { childAges, cardSeq, mainBookingId, bySystem, bookingDays: rawBookingDays, ...bookingPayload } = req.body;
  const bookingDays = clampBookingAdvanceDays(rawBookingDays);

  const tickets = await prisma.ticket.findMany({
    include: {
      TicketBookingSchedule: {
        where: { deleted: false },
      },
    },
  });

  const ticket = await prisma.ticket.findUnique({
    where: { id: bookingPayload.ticketId },
    include: {
      TicketBookingSchedule: { where: { deleted: false } },
      Tenant: true,
    },
  });
  const ticketBookingSchedule = getTicketBookingSchedule(bookingPayload.date, ticket);
  if (!ticketBookingSchedule) {
    return res.status(400).json({ error: ERROR_MESSAGES.BOOKING_TICKET_INVALID_BOOKING_SCHEDULE });
  }

  const sameDayBookings = await prisma.booking.findMany({
    where: {
      date: {
        equals: bookingPayload.date,
      },
      ticketId: ticketBookingSchedule.ticketId,
    },
  });

  const { isValid, message } = validateBooking({ userId: req.user.id, bookingPayload: req.body, ticketBookingSchedule, tickets, sameDayBookings });

  if (!isValid) {
    return res.status(400).json({ error: message });
  }

  if (isOnlineOneDayTicket(ticket) && !bySystem) {
    const ticketVacancyStatus = await getOnlineOneDayTicketVacancyStatus(ticket, bookingPayload.date, bookingDays);
    if (ticketVacancyStatus !== VACANCY_STATUS.AVAILABLE) {
      return res.status(400).json({ error: MESSAGES.TICKET_FULL_AND_NOT_BOOK_MORE.replace("ticketName", ticket.name) });
    }
  }

  const barCode = await generateBookingBarCode();

  const booking = await prisma.booking.create({
    data: {
      ...bookingPayload,
      barCode,
      userId: req.user.id,
      status: BookingStatus.Successful,
      ticketBookingScheduleId: ticketBookingSchedule.id,
    },
    include: {
      Ticket: {
        include: {
          TicketDetail: true,
          TicketBookingSchedule: {
            where: {
              deleted: false,
              dateTo: { gte: new Date() },
            },
          },
        },
      },
      Tenant: true,
      User: true,
      BookingChildAgeInfo: true,
    },
  });

  const bookingChildAgeInfo = childAges.map((age: number) => ({ bookingId: booking.id, childAgeInMonth: age }));
  await prisma.bookingChildAgeInfo.createMany({ data: bookingChildAgeInfo });

  if (cardSeq) {
    const registerResult = await registerTransaction(booking.id, +booking.totalAmount, booking.tenantCode);
    const { ErrInfo: registerErrInfo, AccessID, AccessPass } = parseGMOResponse(registerResult);
    if (registerErrInfo) {
      await prisma.booking.delete({
        where: { id: booking.id },
      });
      return res.status(400).json({ error: TRANSACTION_ERRORS[registerErrInfo] });
    }

    const executeResult = await executeTransaction({ AccessID, AccessPass }, booking.tenantCode, ticket.type, booking.id, req.user.id, cardSeq);
    const { ErrInfo: executeErrInfo, TranID, RedirectUrl, t: txId } = parseGMOResponse(executeResult);
    if (executeErrInfo) {
      await prisma.booking.delete({
        where: { id: booking.id },
      });
      return res.status(400).json({ error: TRANSACTION_ERRORS[executeErrInfo] });
    }

    // if 3DS is supported, redirect to 3DS authentication
    if (RedirectUrl && txId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { GMOTransactionId: txId },
      });
      return res.status(200).json({ data: { RedirectUrl, t: txId } });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: PaymentStatus.Completed, GMOTransactionId: TranID },
    });
  }

  sendOnlineBookingEmail(booking);

  res.status(200).json({ data: sanitizeBooking(booking) });
});

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { fromDate, date, includeBookingSchedule, limit, page } = req.query;
  const barCode = req.query.barCode as string;
  const tenantCode = req.query.tenantCode as string;
  const ticketId = req.query.ticketId ? Number(req.query.ticketId) : undefined;
  const today = new Date();

  const take = limit ? Number(limit) : DEFAULT_BOOKINGS_TAKE;
  const skip = page ? (Number(page) - 1) * take : undefined;

  const bookings = await prisma.booking.findMany({
    where: {
      date: date
        ? { equals: date as string }
        : { gte: fromDate ? moment(fromDate).toDate() : undefined },
      createdAt: { gte: barCode ? getDateOneYearAgo(today) : undefined },
      barCode,
      tenantCode,
      ticketId,
      // ticketId lookups are self-service (same-day booking checks) and must never leak other users' bookings
      userId: ticketId ? req.user.id : undefined,
    },
    skip,
    take,
    include: {
      Ticket: true,
      TicketBookingSchedule: includeBookingSchedule === "true",
      PartialCheckout: { where: { deleted: false } },
    },
  });
  res.status(200).json({ data: bookings });
});

const getOnlineOneDayTicketVacancyStatus = async (ticket: Ticket, bookingDate: string | Date, bookingDays?: number) => {
  const ticketVacancies = await getNextDaysOneDayOnlineVacancy([ticket], bookingDays);
  const sameDayTicketVacancy = ticketVacancies[ticket.tenantCode].find((item) => isSameDay(bookingDate, item.date));

  return sameDayTicketVacancy?.status;
};

export default handler;
