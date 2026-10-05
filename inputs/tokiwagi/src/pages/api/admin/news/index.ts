import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import withValidation from "libs/middleware/withValidation";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";
import { newsSchema } from "libs/validation/schemas";

const validate = withValidation({
  schema: newsSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const news = await prisma.news.findMany();
  res.status(200).json({ data: news });
});

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const news = await prisma.news.create({ data: req.body });
  return res.status(200).json({ data: news });
});

export default handler;
