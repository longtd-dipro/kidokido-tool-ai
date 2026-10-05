import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus } from "@prisma/client";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { LONG_TIME, ROLE } from "constants/common";
import { formatDuration, newDateKeepLocalTime } from "utils/date-time";

const handler = nc({ onError, onNoMatch }).use(checkAuth).use(roleAuth([ROLE.ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;

  const systemCancelledBookings = await prisma.booking.findMany({
    where: {
      tenantCode: user.tenantCode,
      date: newDateKeepLocalTime(),
      status: BookingStatus.SystemCancelled,
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
        }
      },
      Ticket: {
        select: {
          name: true,
        }
      }
    },
    orderBy: [
      {
        updatedAt: "desc",
      }
    ]
  });

  augmentSystemCancelledDuration(systemCancelledBookings);

  res.status(200).json({ data: systemCancelledBookings });
});

const augmentSystemCancelledDuration = (systemCancelledBookings) => {
  const now = new Date();
  systemCancelledBookings.forEach(booking => {
    booking.cancelledDuration = booking.cancelledAt ? formatDuration(now, booking.cancelledAt, LONG_TIME) : "";
  });
};

export default handler;
