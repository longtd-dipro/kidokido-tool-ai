import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import { searchTransaction } from "services/gmo.service";
import prisma from "utils/db";
import { parseGMOResponse } from "utils/gmo";
import { ERROR_MESSAGES } from "constants/errors";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;
  const isUserRole = user.role === ROLE.USER;

  const bookingId = Number(req.query.id);

  const booking = await prisma.booking.findUnique({
    where: { id: Number(bookingId) },
  });

  if (isUserRole) {
    if (booking.userId !== user.id) {
      return res.status(403).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    }
  }

  const data = await searchTransaction(booking.id, booking.tenantCode);
  const results = parseGMOResponse(data);

  res.status(200).json({ data: results });
});

export default handler;
