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
  const code = req.query.code as string;

  const totalCount = await prisma.tenant.count({
    where: {
      AND: [
        {
          code: {
            contains: code,
            mode: "insensitive",
          },
        },
        {
          deleted: false,
        },
      ],
    },
  });
  res.status(200).json({ data: totalCount });
});

export default handler;
