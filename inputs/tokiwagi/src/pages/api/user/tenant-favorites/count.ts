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

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;

  const totalTenantFavorites = await prisma.userTenantFavorite.count({
    where: {
      userId: user.id,
      Tenant: { active: true },
    },
  });

  res.status(200).json({ data: { total: totalTenantFavorites } });
});

export default handler;
