import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus, TicketType } from "@prisma/client";
import moment from "moment";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import { calculateDeadlineMonthlyTicket } from "utils/booking";
import { isSameOrBeforeDay } from "utils/date-time";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;
  const { ticketId, date } = req.query;

  const ticket = await prisma.ticket.findUnique({
    where: { id: +ticketId },
    include: {
      TicketDetail: true,
      TicketBookingSchedule: { where: { deleted: false } },
    },
  });
  if (!ticket) {
    return res.status(200).json({
      data: false,
    });
  }

  if (ticket.type === TicketType.Monthly) {
    const monthlyBookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        ticketId: ticket.id,
        parentBookingId: null,
        status: { in: [BookingStatus.Successful] },
        paymentStatus: { in: [PaymentStatus.Completed] },
      },
    });

    const hasValidTicket = monthlyBookings.some((booking) =>
      isSameOrBeforeDay(moment(), calculateDeadlineMonthlyTicket(booking.date, ticket))
    );

    return res.status(200).json({
      data: hasValidTicket,
    });
  }

  const sameDayBookingCount = await prisma.booking.count({
    where: {
      userId: user.id,
      ticketId: ticket.id,
      parentBookingId: null,
      status: { in: [BookingStatus.Successful] },
      paymentStatus: { in: [PaymentStatus.Completed, PaymentStatus.Refunded] },
      date: date as string,
      ...(ticket.type === TicketType.Daily && {
        createdAt: {
          gte: moment().subtract(7, "days").toDate(),
        },
      })
    },
  });

  res.status(200).json({
    data: Boolean(sameDayBookingCount),
  });
});

export default handler;
