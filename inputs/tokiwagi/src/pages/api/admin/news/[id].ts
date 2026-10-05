import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { newsSchema } from "libs/validation/schemas";

const validate = withValidation({
  schema: newsSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN]));

handler.put(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const news = await prisma.news.update({
    where: {
      id: +req.body.id,
    },
    data: req.body,
  });
  res.status(200).json({ data: news });
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id;
  const news = await prisma.news.delete({
    where: {
      id,
    },
  });
  res.status(200).json({ data: news });
});

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id;

  const news = await prisma.news.findUnique({
    where: { id },
  });

  res.status(200).json({ data: news });
});

export default handler;
