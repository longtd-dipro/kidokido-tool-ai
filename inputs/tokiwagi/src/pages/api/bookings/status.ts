import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch }).use(checkAuth);

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const bookingId = +(req.query.bookingId as string);

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  res.status(200).json({ data: booking.status });
});

export default handler;
