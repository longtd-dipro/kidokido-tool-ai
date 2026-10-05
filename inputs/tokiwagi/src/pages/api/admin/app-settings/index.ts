import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { appSettingSchema } from "libs/validation/schemas";
import prisma from "utils/db";
import { IResponse } from "models/Response";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";

const validate = withValidation({
  schema: appSettingSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const appSettings = await prisma.appSetting.findMany();
  res.status(200).json({ data: appSettings });
});

handler.post(
  validate(handler),
  async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
    const appSetting = await prisma.appSetting.create({ data: req.body });
    res.status(200).json({ data: appSetting });
  }
);

export default handler;
