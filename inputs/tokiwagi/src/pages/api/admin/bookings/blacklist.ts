import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { PaymentStatus } from "@prisma/client";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const blacklistBookings = await prisma.booking.findMany({
    where: {
      paymentStatus: PaymentStatus.Pending,
      checkedInAt: {
        not: null,
      },
      date: {
        lt: new Date(),
      },
    },
    include: {
      User: true,
    },
  });

  res.status(200).json({ data: blacklistBookings });
});

export default handler;
