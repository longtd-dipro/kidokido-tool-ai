import { BookingStatus } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { OneDayBookings } from "models/Booking";
import { getDateOneYearAgo } from "utils/date-time";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.monthlyBookingId;
  const isIncludeOneDayBookings = req.query.includeOneDayBookings;

  const count = await prisma.booking.count({
    where: {
      parentBookingId: id,
      status: { notIn: [BookingStatus.Waiting, BookingStatus.Cancelled, BookingStatus.SystemCancelled, BookingStatus.Successful] },
    },
  });

  let totalOneDayBookings: OneDayBookings = {};
  if (isIncludeOneDayBookings) {
    const oneDayBookings = await prisma.booking.findMany({
      where: {
        parentBookingId: id,
        status: { in: [BookingStatus.Waiting, BookingStatus.Successful, BookingStatus.Calling, BookingStatus.CheckedIn] },
      },
    });

    for (const oneDayBooking of oneDayBookings) {
      const bookings = await prisma.booking.findMany({
        where: {
          barCode: oneDayBooking.barCode,
          createdAt: { gte: getDateOneYearAgo(oneDayBooking.createdAt) },
          status: {
            notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled],
          },
        },

        include: {
          Ticket: true,
        },
      });

      totalOneDayBookings[oneDayBooking.barCode] = { oneDayMonthlyBookingId: oneDayBooking.id, bookings };
    }
  }

  res.status(200).json({
    data: { totalUsingTimes: count, oneDayBookings: totalOneDayBookings },
  });
});

export default handler;
