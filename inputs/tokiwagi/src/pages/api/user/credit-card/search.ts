import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import { searchCard } from "services/gmo.service";
import roleAuth from "libs/middleware/roleAuth";
import checkAuth from "libs/middleware/checkAuth";
import { ROLE } from "constants/common";
import { parseGMOResponse } from "utils/gmo";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;

  const data = await searchCard(user.id);
  const results = parseGMOResponse(data);

  res.status(200).json({ data: results });
});

export default handler;
