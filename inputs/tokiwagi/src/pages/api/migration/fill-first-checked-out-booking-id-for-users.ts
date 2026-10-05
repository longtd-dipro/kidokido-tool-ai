import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, Role } from "@prisma/client";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  let filledCount = 0;
  const unfilledUsers = await prisma.user.findMany({
    where: {
      role: Role.User,
      firstCheckedOutBookingId: null
    }
  });

  for (const unfilledUser of unfilledUsers) {
    const checkedOutBookings = await prisma.booking.findMany({
      where: {
        userId: unfilledUser.id,
        firstCheckedInAt: {
          not: null
        },
        status: {
          notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled]
        }
      },
      orderBy: [
        {
          createdAt: "asc",
        },
      ]
    });

    if (checkedOutBookings.length) {
      const firstCheckedOutBooking = checkedOutBookings[0];
      await prisma.user.update({
        where: { id: unfilledUser.id },
        data: {
          firstCheckedOutBookingId: firstCheckedOutBooking.id
        },
      });

      filledCount++;
    }
  }

  res.status(200).json({
    data: {
      unfilledUsers: unfilledUsers.length,
      filledCount,
    },
  });
});

export default handler;
