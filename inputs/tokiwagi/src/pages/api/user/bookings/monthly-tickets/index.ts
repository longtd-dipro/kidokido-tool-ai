import { BookingStatus, PaymentStatus, TicketType } from "@prisma/client";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import { isSameOrBeforeDay } from "utils/date-time";
import prisma from "utils/db";
import { calculateDeadlineMonthlyTicket } from "utils/booking";
import { Booking } from "models/Entity";
import { getSupportedTenantMonthlyBookings } from "utils/server/booking";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;
  const { page, limit } = req.query;
  const tenantCode = req.query.tenantCode as string;
  const isAvailable = req.query.isAvailable;
  const includeCancelledStatus = req.query.includeCancelledStatus;
  const includeDeadlineDate = req.query.includeDeadlineDate === "true";
  const includeSupportedTenant = req.query.includeSupportedTenant === "true";
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
        Ticket: {
          type: TicketType.Monthly,
        },
      },
      {
        paymentStatus: { in: acceptPaymentStatusList },
        status: { in: acceptStatusList },
        parentBookingId: null,
        tenantCode,
      },
    ],
  };

  let userMonthlyBookings = await prisma.booking.findMany({
    where: filters,
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
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
    take: limit ? Number(limit) : undefined,
    skip: page && limit ? (Number(page) - 1) * Number(limit) : undefined,
  });

  if (includeDeadlineDate) {
    for (const booking of userMonthlyBookings as Booking[]) {
      // remove unnecessary deleted booking schedule in Ticket
      const deadlineDate = calculateDeadlineMonthlyTicket(booking.date, booking.Ticket);
      booking.deadlineDate = deadlineDate;
    }
  }

  // Allow to add more or remove if not in paging mode
  if (!page) {
    if (isAvailable) {
      userMonthlyBookings = userMonthlyBookings.filter(booking => {
        const deadlineDate = calculateDeadlineMonthlyTicket(booking.date, booking.Ticket);
        return isSameOrBeforeDay(moment(), deadlineDate);
      });
    }

    // Augment user's monthly tickets buy at other tenants but supported this tenantCode
    let supportedTenantMonthlyBookings = [];
    if (includeSupportedTenant) {
      supportedTenantMonthlyBookings = await getSupportedTenantMonthlyBookings(user.id, tenantCode, includeDeadlineDate,
        onlyIncludeSupportedTenantIfAlreadyUseTheFirstTime);
    }
    userMonthlyBookings = userMonthlyBookings.concat(supportedTenantMonthlyBookings);
  }

  res.status(200).json({
    data: userMonthlyBookings,
  });
});

export default handler;
