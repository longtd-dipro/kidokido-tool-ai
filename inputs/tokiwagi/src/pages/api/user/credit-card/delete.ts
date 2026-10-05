import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import { deleteCard } from "services/gmo.service";
import { parseGMOResponse } from "utils/gmo";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;
  const { cardSeq } = req.body;

  const data = await deleteCard(user.id, cardSeq);
  const results = parseGMOResponse(data);

  res.status(200).json({ data: results });
});

export default handler;
