import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { gmoSettingSchema } from "libs/validation/gmoSettingSchema";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { checkExistingGMOSetting } from "utils/server/gmo";

const validate = withValidation({
  schema: gmoSettingSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const gmoSettings = await prisma.gMOSetting.findMany({ orderBy: { createdAt: "desc" } });
  res.status(200).json({ data: gmoSettings });
});

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  if (await checkExistingGMOSetting(req.body.shopId)) {
    return res.status(400).json({ error: ERROR_MESSAGES.SHOP_ID_ALREADY_EXIST });
  }

  const gmoSetting = await prisma.gMOSetting.create({ data: req.body });
  res.status(200).json({ data: gmoSetting });
});

export default handler;
