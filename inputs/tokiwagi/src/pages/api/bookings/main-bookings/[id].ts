import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus } from "@prisma/client";

import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { getDateOneYearAgo } from "utils/date-time";
import { USER_BOOKING_SELECT_FIELDS, USER_TICKET_WITHIN_INCLUDE_FIELDS } from "utils/server/db-fields-selector";

const handler = nc({ onError, onNoMatch }).use(checkAuth);

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id;

  const mainBooking = await prisma.booking.findUnique({
    where: { id },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      barCode: mainBooking.barCode,
      createdAt: { gte: getDateOneYearAgo(mainBooking.createdAt) },
      status: { notIn: [BookingStatus.CheckedOut, BookingStatus.Cancelled, BookingStatus.SystemCancelled] },
    },
    select: {
      ...USER_BOOKING_SELECT_FIELDS,
      Ticket: {
        select: USER_TICKET_WITHIN_INCLUDE_FIELDS
      },
    },
  });

  res.status(200).json({ data: bookings });
});

export default handler;
