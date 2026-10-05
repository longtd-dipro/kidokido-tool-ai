import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import { forceRecomputeObicForBooking } from "utils/server/obicCodes";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const bookingId = +req.query.id;

  await forceRecomputeObicForBooking(bookingId);

  res.status(200).json({ data: { bookingId, recomputed: true } });
});

export default handler;
