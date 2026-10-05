import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, TicketType } from "@prisma/client";

import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { getDateOneYearAgo } from "utils/date-time";
import { USER_BOOKING_SELECT_FIELDS } from "utils/server/db-fields-selector";

const handler = nc({ onError, onNoMatch }).use(checkAuth);

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const canBookInAdvance = req.query.canBookInAdvance ? req.query.canBookInAdvance === "true" : undefined;

  // Get the last use in day booking
  const booking = await prisma.booking.findFirst({
    where: {
      userId: req.user.id,
      status: {
        notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled],
      },
      GMOTransactionId: null
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });

  let bookings = [];

  if (booking) {
    // Get the same barcode bookings
    bookings = await prisma.booking.findMany({
      where: {
        barCode: booking.barCode,
        createdAt: { gte: getDateOneYearAgo(booking.createdAt) },
        Ticket: {
          OR: [
            { canBookInAdvance },
            { type: { in: [TicketType.DailyTimesLimit, TicketType.HourlyTimesLimit] } }
          ]
        },
        status: {
          notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled],
        }
      },
      select: {
        ...USER_BOOKING_SELECT_FIELDS,
        Ticket: {
          include: {
            TicketBookingSchedule: { where: { deleted: false } },
            TicketDetail: true,
            TicketDiscountSetting: true,
          },
        },
        BookingChildAgeInfo: true,
      },
    });
  }

  res.status(200).json({ data: bookings });
});

export default handler;
