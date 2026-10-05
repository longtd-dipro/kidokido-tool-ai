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
import { emailSettingScheme } from "libs/validation/schemas";

const validate = withValidation({
  schema: emailSettingScheme,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN]));

handler.put(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const emailSetting = await prisma.emailSetting.update({
    where: {
      emailKey: req.body.emailKey,
    },
    data: req.body,
  });
  res.status(200).json({ data: emailSetting });
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const emailKey = req.query.emailKey as string;
  const emailSetting = await prisma.emailSetting.delete({
    where: {
      emailKey,
    },
  });
  res.status(200).json({ data: emailSetting });
});

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const emailKey = req.query.emailKey as string;

  const emailSetting = await prisma.emailSetting.findUnique({
    where: { emailKey },
  });

  res.status(200).json({ data: emailSetting });
});

export default handler;
