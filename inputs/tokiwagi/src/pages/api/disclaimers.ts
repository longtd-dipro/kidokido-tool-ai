import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import prisma from "utils/db";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const disclaimers = await prisma.disclaimer.findMany({ include: { DisclaimerOption: true } });
  res.status(200).json({ data: disclaimers });
});

export default handler;
