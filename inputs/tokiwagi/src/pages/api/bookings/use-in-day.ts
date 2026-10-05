import { BookingStatus, PaymentStatus } from "@prisma/client";
import { cloneDeep, findLast, isNil, minBy } from "lodash";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { DEFAULT_TRANSACTION_TIMEOUT, SHORT_DATE, VACANCY_STATUS } from "constants/common";
import { BOOKINGS_INFO_TEMPLATE, WAITING_INFO_TEMPLATE } from "constants/email-template";
import { ERROR_MESSAGES } from "constants/errors";
import { BARCODE_IMG_CID, EMAIL_SETTING_KEY } from "constants/settings";
import { PAYMENT_TYPE_OPTIONS } from "constants/ticket";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { useInDayBookingPayloadSchema } from "libs/validation/bookingSchema";
import { Booking } from "models/Entity";
import { IResponse } from "models/Response";
import EmailService from "services/email.service";
import { checkStatusCanNotUpdateBooking, getShortBarCode, getTicketNotAvailableErrorMessage, isTimesLimitTicket } from "utils/booking";
import { validateUseInDayBooking } from "utils/booking-validation";
import { formatEmailTime, newDateKeepLocalTime } from "utils/date-time";
import prisma from "utils/db";
import { compileEmailContent } from "utils/email";
import { generateBase64Barcode, generateBookingBarCode } from "utils/server/barcode";
import { getTenantInDayTicketsVacancy } from "utils/server/vacancy-status";
import { getAgeLabel, getTicketBookingSchedule, getTicketBookingScheduleByTicketId } from "utils/ticket";
import { serverConfig } from "config";
import { withLogging } from "libs/middleware/withLogging";
import { sanitizeBookings } from "utils/server/sanitizer";

const validate = withValidation({
  schema: useInDayBookingPayloadSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch }).use(checkAuth);

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { tenantCode, subEmail, ...body } = req.body;
  const bookingDate = new Date();

  const mainBookingId = +body.bookings[0].mainBookingId;
  let mainBooking;
  let barCode = null;
  if (mainBookingId) {
    mainBooking = await prisma.booking.findUnique({ where: { id: mainBookingId } });
    const { result: canNotUpdate, errorMessage } = checkStatusCanNotUpdateBooking(mainBooking.status);
    if (canNotUpdate) {
      return res.status(400).json({ error: errorMessage });
    }
    barCode = mainBooking.barCode;
  } else {
    barCode = await generateBookingBarCode();
  }

  const sameTenantTickets = await prisma.ticket.findMany({
    where: { tenantCode },
    include: { TicketBookingSchedule: { where: { deleted: false } } },
  });

  const bookings = body.bookings.map(({ mainBookingId, ...item }) => {
    const ticketBookingSchedule = getTicketBookingScheduleByTicketId(bookingDate, item.ticketId, sameTenantTickets);
    const ticketBookingScheduleId = ticketBookingSchedule?.id;
    return {
      ...item,
      userId: req.user.id,
      tenantCode,
      date: moment(bookingDate).utc(true).toISOString(),
      subEmail,
      barCode,
      ticketBookingScheduleId,
      ticketBookingSchedule,
    };
  });

  const { isValid, message } = await validateBookings({ bookingDate, tenantCode, bookings, sameTenantTickets });
  if (!isValid) {
    return res.status(400).json({ error: message });
  }

  const { isGroupMustWait, totalBookingMustWait, totalMinutesMustWait, isGroupNotAvailable, errorMessage } = await getVacancyStatus(bookings);
  if (isGroupNotAvailable) {
    return res.status(400).json({ error: errorMessage });
  }

  const waitingOrder = await getWaitingOrderBookings(bookings);

  const createdBookings = await createBooking({ bookings, mainBooking, isGroupMustWait, waitingOrder });

  const barcodeBase64 = await generateBase64Barcode(barCode);

  const emailKey = getEmailKey(isGroupMustWait, mainBooking);

  const emailBookings = createdBookings.map((booking) => {
    return {
      ...booking,
      date: moment(booking.date).format(SHORT_DATE),
      childAges: booking.childAges.map((item) => getAgeLabel(item)),
      Tenant: {
        ...booking.Tenant,
        openedAt: formatEmailTime(booking.Tenant.openedAt),
        closedAt: formatEmailTime(booking.Tenant.closedAt),
        servedUtil: formatEmailTime(booking.Tenant.servedUtil),
      },
      Ticket: {
        ...booking.Ticket,
        paymentType: PAYMENT_TYPE_OPTIONS.find(({ value }) => value === booking.Ticket.paymentType).label,
      },
    };
  });

  if (req.user.id && !req.user.email) {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.email) {
      req.user.email = user.email;
    }
  }

  const bookingsInfo = compileEmailContent(BOOKINGS_INFO_TEMPLATE, { data: { bookings: emailBookings } });
  const waitingInfo = compileEmailContent(WAITING_INFO_TEMPLATE, {});

  const bookingHistoryLink = `${serverConfig.external.url}/user/my-page/booking-history?userId=${req.user.id}`;

  EmailService.sendEmail([createdBookings[0].User.email, createdBookings[0].subEmail], emailKey, {
    name: createdBookings[0].User.name,
    bookingsInfo,
    waitingInfo,
    bookingHistoryLink: `<a href=${bookingHistoryLink}>確認</a>`,
    bookingHistoryLinkEng: `<a href=${bookingHistoryLink}>Confirmation</a>`,
    bookings: emailBookings,
    totalMustWait: totalBookingMustWait || "-",
    totalMinutesMustWait: totalMinutesMustWait || "-",
    barcodeImgSrc: barcodeBase64,
    barcodeImgTag: `<img src="cid:${BARCODE_IMG_CID}" alt="bar code" />`,
    shortBarCode: getShortBarCode(bookings[0].barCode),
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

  res.status(200).json({ data: sanitizeBookings(createdBookings) });
});

const getWaitingOrderBookings = async (bookings: Booking[]) => {
  // no have monthly ticket in bookings => return null
  const monthlyBooking = bookings.find((booking) => !isNil(booking.parentBookingId));
  if (!monthlyBooking) {
    return null;
  }

  // [maxBookingPeopleAccumulative] of monthly ticket is false => return null
  const parentBooking = await prisma.booking.findUnique({
    where: { id: monthlyBooking.parentBookingId },
    include: { Ticket: { include: { TicketBookingSchedule: { where: { deleted: false } } } } },
  });
  const ticketBookingSchedule = getTicketBookingSchedule(parentBooking.date.toISOString(), parentBooking.Ticket);
  if (!ticketBookingSchedule.maxBookingPeopleAccumulative) {
    return null;
  }

  const waitingBookings = await prisma.booking.findMany({
    where: {
      tenantCode: monthlyBooking.tenantCode,
      status: BookingStatus.Waiting,
      date: newDateKeepLocalTime(),
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
        },
      },
      Ticket: {
        select: {
          name: true,
        },
      },
      TicketBookingSchedule: true,
    },
  });

  // filter waiting bookings that has setting maxBookingPeopleAccumulative and has waiting order value.
  const accumulativeWaitingBookings = waitingBookings.filter((booking) => booking.TicketBookingSchedule.maxBookingPeopleAccumulative);
  const hasWaitingOrderBookings = accumulativeWaitingBookings.filter((booking) => !isNil(booking.waitingOrder));

  // check monthly booking in waiting bookings to identify waiting bookings that need to be updated [waitingOrder] field
  // - has monthly booking => update [waitingOrder + 1] for all waiting bookings that has [waitingOrder] value
  // - not has monthly booking => update [waitingOrder + 1] for waiting bookings that has [waitingOrder] value > [waitingOrder] of last waiting monthly booking
  const waitingMonthlyBooking = findLast(accumulativeWaitingBookings, (booking) => !isNil(booking.parentBookingId));
  const lastWaitingOrder = (waitingMonthlyBooking as Booking)?.waitingOrder;
  let needUpdateWaitingOrderBookings = cloneDeep(hasWaitingOrderBookings);

  if (waitingMonthlyBooking) {
    needUpdateWaitingOrderBookings = hasWaitingOrderBookings.filter((item) => item.waitingOrder > lastWaitingOrder);
  }

  for (const waitingBooking of needUpdateWaitingOrderBookings) {
    await prisma.booking.update({
      where: { id: waitingBooking.id },
      data: {
        waitingOrder: waitingBooking.waitingOrder + 1,
      },
    });
  }

  const result = waitingMonthlyBooking ? lastWaitingOrder + 1 : 1;

  return result;
};

const getVacancyStatus = async (bookings: Booking[]) => {
  const bookingTenantCode = bookings[0].tenantCode;
  const ticketIds = bookings.map((booking) => booking.ticketId);

  const ticketVacancies = await getTenantInDayTicketsVacancy(bookingTenantCode);
  const bookingTicketVacancies = ticketVacancies?.tickets.filter((ticket) => ticketIds.includes(ticket.ticketId));

  const notAvailableTicketVacancy = bookingTicketVacancies.find((vacancy) => vacancy.status === VACANCY_STATUS.NOT_AVAILABLE);
  if (notAvailableTicketVacancy) {
    return {
      isGroupNotAvailable: true,
      errorMessage: getTicketNotAvailableErrorMessage(notAvailableTicketVacancy.reason, notAvailableTicketVacancy.ticketName),
    };
  }

  const isGroupMustWait = bookingTicketVacancies.every((vacancy) => vacancy.status === VACANCY_STATUS.FULL);
  let totalBookingMustWait = null;
  let totalMinutesMustWait = null;
  if (isGroupMustWait) {
    const minimumMinutesMustWaitVacancy = minBy(bookingTicketVacancies, "waitingTimeInMinutes");
    totalMinutesMustWait = minimumMinutesMustWaitVacancy.waitingTimeInMinutes;
    totalBookingMustWait = minimumMinutesMustWaitVacancy.waitingBookingsCount;
  }

  return { isGroupMustWait, totalBookingMustWait, totalMinutesMustWait };
};

const validateBookings = async ({ tenantCode, bookingDate, bookings, sameTenantTickets }) => {
  const existingBookings = await prisma.booking.findMany({
    where: {
      tenantCode,
      date: {
        equals: moment(bookingDate).utc(true).toDate(),
      },
    },
    include: {
      Ticket: { include: { TicketBookingSchedule: { where: { deleted: false } }, TicketDetail: true } },
    },
  });

  const parentTimesLimitBookingIds = bookings
    .filter(booking => {
      const ticket = sameTenantTickets.find(ticket => ticket.id === booking.ticketId);
      return isTimesLimitTicket(ticket.type) && booking.parentBookingId;
    })
    .map(booking => booking.parentBookingId);
  if (parentTimesLimitBookingIds.length) {
    const [ticketsUsageCount, parentTimesLimitBookings] = await Promise.all([
      prisma.booking.groupBy({
        by: ["parentBookingId"],
        where: {
          parentBookingId: {
            in: parentTimesLimitBookingIds,
          },
          status: { notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled] },
        },
        _sum: {
          childQuantity: true,
        },
      }),
      prisma.booking.findMany({
        select: { id: true, Ticket: { select: { TicketDetail: { select: { limitTimes: true, extraTimes: true } } } } },
        where: {
          id: {
            in: parentTimesLimitBookingIds,
          },
        },
      }),
    ]);
    for (const ticketUsageCount of ticketsUsageCount) {
      const sameTicketBookings = bookings.filter(booking => booking.parentBookingId === ticketUsageCount.parentBookingId);
      const parentTimesLimitBooking = parentTimesLimitBookings.find(booking => booking.id === ticketUsageCount.parentBookingId);
      if (sameTicketBookings.length && parentTimesLimitBooking) {
        const totalBookingCount = ticketUsageCount._sum.childQuantity + sameTicketBookings.length;
        const maximumBookingCount = parentTimesLimitBooking.Ticket.TicketDetail.limitTimes + (parentTimesLimitBooking.Ticket.TicketDetail.extraTimes || 0);
        if (totalBookingCount > maximumBookingCount) {
          return { isValid: false, message: ERROR_MESSAGES.MAXIMUM_BOOKING_REACHED };
        }
      }
    }
  }

  for (const booking of bookings) {
    if (!booking.ticketBookingSchedule) {
      return { isValid: false, message: ERROR_MESSAGES.BOOKING_TICKET_INVALID_BOOKING_SCHEDULE };
    }

    const { isValid, message } = validateUseInDayBooking({
      bookingPayload: booking,
      ticketBookingSchedule: booking.ticketBookingSchedule,
      sameDayBookings: existingBookings,
    });

    if (!isValid) {
      return { isValid, message };
    }
  }

  return { isValid: true };
};

const createBooking = async ({ bookings, mainBooking, isGroupMustWait, waitingOrder }) => {
  let createdBookings = [];
  return prisma.$transaction(async (tx) => {
    const now = moment().toISOString();
    for (const booking of bookings) {
      const { childAges, ticketBookingSchedule, ...bookingPayload } = booking;

      const createdBooking = await tx.booking.create({
        data: {
          ...bookingPayload,
          status: mainBooking ? mainBooking.status : isGroupMustWait ? BookingStatus.Waiting : undefined,
          waitingAt: isGroupMustWait ? now : undefined,
          paymentStatus: bookingPayload.parentBookingId ? PaymentStatus.Completed : PaymentStatus.Pending,
          checkedInAt: mainBooking && mainBooking.checkedInAt ? now : undefined,
          waitingOrder,
          callingAt: (mainBooking && mainBooking.status === BookingStatus.Calling && mainBooking.callingAt) || undefined,
        },
        include: {
          Ticket: true,
          Tenant: true,
          User: true,
        },
      });

      const bookingChildAgeInfo = childAges.map((age: number) => ({ bookingId: createdBooking.id, childAgeInMonth: age }));
      await tx.bookingChildAgeInfo.createMany({ data: bookingChildAgeInfo });

      createdBookings.push({ ...createdBooking, childAges });
    }
    return createdBookings;
  }, { timeout: DEFAULT_TRANSACTION_TIMEOUT });
};

const getEmailKey = (isGroupMustWait: boolean, mainBooking: Booking) => {
  if (mainBooking) {
    return mainBooking.status === BookingStatus.Waiting ? EMAIL_SETTING_KEY.BOOKING_WITH_WAITING_SUCCESSFUL : EMAIL_SETTING_KEY.BOOKING_SUCCESSFUL;
  }

  return isGroupMustWait ? EMAIL_SETTING_KEY.BOOKING_WITH_WAITING_SUCCESSFUL : EMAIL_SETTING_KEY.BOOKING_SUCCESSFUL;
};

export default withLogging(handler);
