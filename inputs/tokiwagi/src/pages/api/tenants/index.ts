import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const search = req.query.search as string;
  const { page, limit, allowInactiveTenantCode } = req.query;
  
  const tenants = await prisma.tenant.findMany({
    omit: {
      gmoId: true
    },
    where: {
      active: allowInactiveTenantCode === "true" ? undefined : true,
      OR: [
        {
          name: {
            contains: search || "",
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: search || "",
            mode: "insensitive",
          },
        },
        {
          guide: {
            contains: search || "",
            mode: "insensitive",
          },
        },
      ],
    },

    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    take: limit ? Number(limit) : undefined,
    skip: page && limit ? (Number(page) - 1) * Number(limit) : undefined,
  });

  res.status(200).json({ data: tenants });
});

export default handler;
