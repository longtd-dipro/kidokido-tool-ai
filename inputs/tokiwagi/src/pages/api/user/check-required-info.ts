import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import prisma from "utils/db";
import { IResponse } from "models/Response";
import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";

const handler = nc({ onError, onNoMatch }).use(checkAuth).use(roleAuth([ROLE.USER]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;
  const userInfo = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  const isFilledRequiredInfo = !!userInfo.email && !!userInfo.firstName;
  res.status(200).json({ data: isFilledRequiredInfo });
});

export default handler;
