import { BookingStatus, PaymentStatus, Role, TicketType } from "@prisma/client";
import nc from "next-connect";
import moment from "moment";

import checkAuth from "libs/middleware/checkAuth";
import prisma from "utils/db";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { bookingTicketsPayloadSchema } from "libs/validation/bookingSchema";
import withValidation from "libs/middleware/withValidation";
import { calculateDeadlineMonthlyTicket, isTimesLimitTicket } from "utils/booking";
import { isSameOrBeforeDay } from "utils/date-time";
import { getSupportedTenantMonthlyBookings } from "utils/server/booking";
import { Booking } from "models/Entity";

const handler = nc({ onError, onNoMatch }).use(checkAuth).use(roleAuth([Role.User]));

const validate = withValidation({
  schema: bookingTicketsPayloadSchema,
  mode: "query",
});

handler.get(validate(handler), async (req, res) => {
  const { user } = req;
  const { page, limit, includeCancelledStatus, isAvailable } = req.query;
  const includeDeadlineDate = req.query.includeDeadlineDate === "true";
  const includeSupportedTenant = req.query.includeSupportedTenant === "true";
  const tenantCode = req.query.tenantCode as string;
  const onlyIncludeSupportedTenantIfAlreadyUseTheFirstTime = req.query.onlyIncludeSupportedTenantIfAlreadyUseTheFirstTime === "true";
  const acceptStatusList = includeCancelledStatus
    ? [BookingStatus.Successful, BookingStatus.Cancelled, BookingStatus.SystemCancelled]
    : [BookingStatus.Successful];
  const acceptPaymentStatusList = [PaymentStatus.Completed, PaymentStatus.Refunded];

  const filters = {
    AND: [
      {
        userId: user.id,
      },
      {
        paymentStatus: { in: acceptPaymentStatusList },
        status: { in: acceptStatusList },
        parentBookingId: null,
        tenantCode,
      },
      {
        Ticket: {
          type: {
            in: [TicketType.HourlyTimesLimit, TicketType.DailyTimesLimit],
          },
        },
      }
    ],
  };

  let ticketBookings = await prisma.booking.findMany({
    include: {
      Ticket: {
        include: {
          TicketDetail: true,
          TicketBookingSchedule: {
            where: { deleted: false },
          },
          TicketDiscountSetting: true,
        },
      },
      Tenant: true,
      BookingChildAgeInfo: true,
      TicketBookingSchedule: true,
    },
    where: filters,
    orderBy: {
      createdAt: "desc",
    },
    take: limit ? Number(limit) : undefined,
    skip: page && limit ? (Number(page) - 1) * Number(limit) : undefined,
  });

  const timesLimitTicketUsages = await prisma.booking.findMany({
    select: {
      id: true,
      parentBookingId: true,
      childQuantity: true,
      createdAt: true,
    },
    where: {
      parentBookingId: {
        in: ticketBookings.map(booking => booking.id),
      },
      status: {
        notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled],
      }
    },
    orderBy: {
      createdAt: "asc",
    }
  });

  for (const booking of ticketBookings as Booking[]) {
    if (includeDeadlineDate) {
      const deadlineDate = calculateDeadlineMonthlyTicket(isTimesLimitTicket(booking.Ticket.type) ? booking.createdAt : booking.date, booking.Ticket);
      booking.deadlineDate = deadlineDate;
      // remove unnecessary deleted booking schedule in Ticket
      booking.Ticket.TicketBookingSchedule = booking.Ticket.TicketBookingSchedule?.filter(schedule => !schedule.deleted);
    }
    booking.usageBookings = timesLimitTicketUsages.filter(usage => usage.parentBookingId === booking.id)
      .flatMap(usage => Array.from({ length: usage.childQuantity }).map(() => usage));
    booking.usageTimes = booking.usageBookings.length;
  }

  // Allow to add more or remove if not in paging mode
  if (!page) {
    if (isAvailable) {
      ticketBookings = ticketBookings.filter(booking => {
        const deadlineDate = calculateDeadlineMonthlyTicket(isTimesLimitTicket(booking.Ticket.type) ? booking.createdAt : booking.date, booking.Ticket);
        return isSameOrBeforeDay(moment(), deadlineDate);
      });
    }

    // Augment user's monthly tickets buy at other tenants but supported this tenantCode
    let supportedTenantMonthlyBookings = [];
    if (includeSupportedTenant) {
      supportedTenantMonthlyBookings = await getSupportedTenantMonthlyBookings(user.id, tenantCode as string, includeDeadlineDate,
        onlyIncludeSupportedTenantIfAlreadyUseTheFirstTime as boolean);
    }
    ticketBookings = ticketBookings.concat(supportedTenantMonthlyBookings);
  }

  res.status(200).json({ data: ticketBookings });
});

export default handler;