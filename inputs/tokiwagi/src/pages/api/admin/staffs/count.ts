import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const name = req.query.name as string;
  const tenantCode = req.user.tenantCode || (req.query.tenantCode as string);

  const totalCount = await prisma.staff.count({
    where: {
      AND: [
        {
          name: {
            contains: name || undefined,
            mode: "insensitive",
          },
          tenantCode: {
            contains: tenantCode || undefined,
            mode: "insensitive",
          },
        },
      ],
      Tenant: {
        deleted: false,
      },
    },
  });

  res.status(200).json({ data: totalCount });
});

export default handler;
