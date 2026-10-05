import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { disclaimerSchema } from "libs/validation/disclaimerSchema";
import withValidation from "libs/middleware/withValidation";

const validate = withValidation({
  schema: disclaimerSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const disclaimers = await prisma.disclaimer.findMany({ include: { DisclaimerOption: true } });
  res.status(200).json({ data: disclaimers });
});

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const disclaimersPayload = req.body.disclaimers;

  await prisma.$transaction([
    prisma.disclaimer.deleteMany(),
    ...disclaimersPayload.map((disclaimerPayload) =>
      prisma.disclaimer.create({
        data: {
          title: disclaimerPayload.title,
          DisclaimerOption: { create: disclaimerPayload.options },
        },
      })
    ),
  ]);

  res.status(201).json({ data: null });
});

export default handler;
