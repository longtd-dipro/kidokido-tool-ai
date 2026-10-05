import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { Role } from "@prisma/client";
import moment from "moment";

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
  const email = req.query.email as string;
  const phoneNumber = req.query.phone as string;
  const startDate = req.query.startDate && moment(req.query.startDate).utc(true).toDate();
  const endDate = req.query.endDate && moment(req.query.endDate).utc(true).toDate();

  const totalCount = await prisma.user.count({
    where: {
      role: Role.User,
      AND: [
        {
          name: {
            contains: name || undefined,
            mode: "insensitive",
          },
          email: {
            contains: email || undefined,
            mode: "insensitive",
          },
          phone: {
            contains: phoneNumber || undefined,
            mode: "insensitive",
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        { deleted: false },
      ],
    },
  });
  res.status(200).json({ data: totalCount });
});

export default handler;
