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
import { checkIfAlreadyUsedMonthlyTicket, getSupportedTenantMonthlyBookings } from "utils/server/booking";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  let result = false;
  const { user } = req;
  const tenantCode = req.query.tenantCode as string;
  const acceptStatusList = [BookingStatus.Successful];
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
        },
      }
    }
  });

  // Only get bookings which it's ticket associated to a master ticket
  userMonthlyBookings = userMonthlyBookings.filter(booking => {
    return !!booking.Ticket.masterTicketId;
  });

  userMonthlyBookings = userMonthlyBookings.filter(booking => {
    const deadlineDate = calculateDeadlineMonthlyTicket(booking.date, booking.Ticket);
    return isSameOrBeforeDay(moment(), deadlineDate);
  });

  for (let userMonthlyBooking of userMonthlyBookings) {
    const alreadyUsedMonthlyTicket = await checkIfAlreadyUsedMonthlyTicket(userMonthlyBooking.id);
    if (!alreadyUsedMonthlyTicket) {
      result = true;
      break;
    }
  }

  if (!result) {
    const supportedTenantMonthlyBookings = await getSupportedTenantMonthlyBookings(user.id, tenantCode, true, false);
    for (let userMonthlyBooking of supportedTenantMonthlyBookings) {
      const alreadyUsedMonthlyTicket = await checkIfAlreadyUsedMonthlyTicket(userMonthlyBooking.id);
      if (!alreadyUsedMonthlyTicket) {
        result = true;
        break;
      }
    }
  }

  res.status(200).json({
    data: result,
  });
});

export default handler;
