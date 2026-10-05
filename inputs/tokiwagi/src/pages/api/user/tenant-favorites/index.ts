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

  const { page, limit, includeTenant } = req.query;
  const includeTenantBoolean = includeTenant ? includeTenant === "true" : true;

  const tenantFavorites = await prisma.userTenantFavorite.findMany({
    where: {
      userId: user.id,
      Tenant: { active: true },
    },
    include: {
      Tenant: includeTenantBoolean,
    },
    orderBy: { createdAt: "asc" },
    take: limit ? Number(limit) : undefined,
    skip: page && limit ? (Number(page) - 1) * Number(limit) : undefined,
  });

  res.status(200).json({ data: tenantFavorites });
});

export default handler;
