import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const settingKey = req.query.settingKey as string;
  const appSetting = await prisma.appSetting.findUnique({
    where: {
      settingKey,
    },
  });
  res.status(200).json({ data: appSetting });
});

export default handler;
