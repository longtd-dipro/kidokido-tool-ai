import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import prisma from "utils/db";
import { IResponse } from "models/Response";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const code = req.query.code as string;
  const tenant = await prisma.tenant.findUnique({
    where: {
      code: code
    }
  });

  res.status(200).json({ data: tenant });
});

export default handler;
