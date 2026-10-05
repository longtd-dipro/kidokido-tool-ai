import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { limit, page, sort_by } = req.query;

  const skip = page && (Number(page) - 1) * Number(limit);
  const take = limit && Number(limit);
  const orderBy = sort_by && (sort_by as string).split(".").reduce((result, item, index, array) => ({ [array[0]]: array[1] }), {});

  const news = await prisma.news.findMany({
    skip,
    take,
    orderBy,
  });

  res.status(200).json({ data: news });
});

export default handler;
