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
import { emailSettingScheme } from "libs/validation/schemas";

const validate = withValidation({
  schema: emailSettingScheme,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const emailSettings = await prisma.emailSetting.findMany({ orderBy: { emailKey: "asc" } });
  res.status(200).json({ data: emailSettings });
});

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const emailSetting = await prisma.emailSetting.create({ data: req.body });
  return res.status(200).json({ data: emailSetting });
});

export default handler;
