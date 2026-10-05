import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IpWhitelist, getIpWhitelist } from "utils/server/ipWhitelist";

const handler = nc({ onError, onNoMatch });

handler.get(async (_req: NextApiRequest, res: NextApiResponse<{ data: IpWhitelist }>) => {
  const data = await getIpWhitelist();
  res.status(200).json({ data });
});

export default handler;
