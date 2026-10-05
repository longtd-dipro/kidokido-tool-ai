import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import checkAuth from "libs/middleware/checkAuth";
import prisma from "utils/db";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;
  const tenantCode = req.query.tenantCode as string;
  const tenantFavorite = await prisma.userTenantFavorite.create({
    data: {
      userId: user.id,
      tenantCode: tenantCode,
    },
  });

  res.status(200).json({ data: tenantFavorite });
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;
  const tenantCode = req.query.tenantCode as string;
  const tenantFavorite = await prisma.userTenantFavorite.delete({
    where: {
      userId_tenantCode: {
        userId: user.id,
        tenantCode: tenantCode,
      },
    },
  });

  res.status(200).json({ data: tenantFavorite });
});

export default handler;
