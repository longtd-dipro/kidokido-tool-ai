import { BookingStatus, TicketBookingSchedule } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import moment from "moment";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { calculateDeadlineMonthlyTicket } from "utils/booking";
import { isSameOrBeforeDay } from "utils/date-time";
import { getBookingScheduleByDate } from "utils/ticket";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.monthlyBookingId;
  const ticketId = +req.query.ticketId;

  const count = await prisma.booking.count({
    where: {
      parentBookingId: id,
      status: { notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled] },
    },
  });

  const sameDayBooking = await prisma.booking.findFirst({
    where: {
      parentBookingId: id,
      status: { notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled] },
      date: {
        equals: new Date(),
      },
    },
  });

  const parentBooking = await prisma.booking.findUnique({
    where: {
      id,
    },
    include: {
      TicketBookingSchedule: true,

      Ticket: {
        include: { TicketBookingSchedule: { where: { deleted: false } }, TicketDetail: true },
      },
    },
  });

  const today = new Date();
  let bookingSchedules: TicketBookingSchedule[];
  if (parentBooking.ticketId !== ticketId) {
    bookingSchedules = await prisma.ticketBookingSchedule.findMany({
      where: {
        ticketId,
        dateTo: { gte: today },
        deleted: false
      }
    });
  } else {
    bookingSchedules =parentBooking?.Ticket?.TicketBookingSchedule;
  }
  const todayBookingSchedule = getBookingScheduleByDate(today, bookingSchedules);
  const maxBookingTimes = todayBookingSchedule?.maxBookingTimes;

  const deadlineDate = calculateDeadlineMonthlyTicket(parentBooking.date, parentBooking.Ticket);
  const isAvailable = isSameOrBeforeDay(moment(), deadlineDate);

  res.status(200).json({
    data: { totalUsingTimes: count, alreadyUsedInDay: !!sameDayBooking, maxBookingTimes, isAvailable, deadlineDate },
  });
});

export default handler;
