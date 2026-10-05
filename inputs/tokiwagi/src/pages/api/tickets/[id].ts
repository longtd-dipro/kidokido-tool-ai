import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { USER_TENANT_WITHIN_INCLUDE_FIELDS } from "utils/server/db-fields-selector";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id || undefined;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      TicketDetail: true,
      TicketDiscountSetting: true,
      TicketBookingSchedule: {
        where: { deleted: false },
      },
      Tenant: { select: USER_TENANT_WITHIN_INCLUDE_FIELDS },
    },
  });
  res.status(200).json({ data: ticket });
});

export default handler;
