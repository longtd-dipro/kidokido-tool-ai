import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { TicketType } from "@prisma/client";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { convertToArray } from "utils/array";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN, ROLE.ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const admin = req.user;
  const ticketTypes = convertToArray(req.query.ticketTypes as TicketType[]);
  const tenantCode = req.query.tenantCode as string;

  const count = await prisma.ticket.count({
    where: {
      tenantCode: {
        contains: tenantCode || admin.tenantCode,
        mode: "insensitive",
      },
      type: {
        in: ticketTypes,
      },
    },
  });

  res.status(200).json({ data: count });
});

export default handler;
