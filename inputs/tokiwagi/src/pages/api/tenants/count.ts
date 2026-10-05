import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const search = req.query.search as string;
  const totalTenants = await prisma.tenant.count({
    where: {
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
      ],
    }
  });

  res.status(200).json({ data: totalTenants });
});

export default handler;
