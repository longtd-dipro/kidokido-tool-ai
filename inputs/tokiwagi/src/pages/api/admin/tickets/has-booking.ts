import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import { hasBooking } from "utils/server/ticket";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const ticketId = req.query.ticketId ? Number(req.query.ticketId) : undefined;

  const isTicketHasBooking = await hasBooking(ticketId);

  res.status(200).json({ data: { hasBooking: isTicketHasBooking } });
});

export default handler;
