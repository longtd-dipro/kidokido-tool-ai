import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import { checkIfAlreadyUsedMonthlyTicket } from "utils/server/booking";

const handler = nc({ onError, onNoMatch }).use(checkAuth);

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const parentBookingId = +(req.query.parentBookingId as string);
  const alreadyUsed = await checkIfAlreadyUsedMonthlyTicket(parentBookingId);

  res.status(200).json({ data: alreadyUsed });
});

export default handler;
