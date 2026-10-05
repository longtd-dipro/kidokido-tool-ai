import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus, TicketType } from "@prisma/client";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { Booking } from "models/Entity";
import { getDateOneYearAgo } from "utils/date-time";
import { logRequest } from "utils/server/request";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

handler.patch(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  logRequest(req);
  const { barCode, isMustWaiting } = req.body;
  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      barCode,
      createdAt: { gte: getDateOneYearAgo(now) },
      status: { in: [BookingStatus.CheckedOut, BookingStatus.CheckedIn] },
      Ticket: { type: { notIn: [TicketType.Hourly, TicketType.HourlyTimesLimit] } },
    },
  });

  for (const booking of bookings) {
    if (booking.paymentStatus !== PaymentStatus.Completed) {
      return res.status(400).json({ error: "日本語で" });
    }

    const dataToUpdate: Partial<Booking> = { requestedReCheckInAt: now };
    if (booking.status === BookingStatus.CheckedOut) {
      dataToUpdate.status = isMustWaiting ? BookingStatus.Waiting : BookingStatus.Calling;
      if (dataToUpdate.status === BookingStatus.Calling) {
        dataToUpdate.callingAt = now;
      } else if (dataToUpdate.status === BookingStatus.Waiting) {
        dataToUpdate.waitingAt = now;
      }
    }

    await prisma.booking.update({ where: { id: booking.id }, data: dataToUpdate as any });
  }

  res.status(200).json({ data: null });
});

export default handler;
