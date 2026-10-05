import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { gmoSettingSchema } from "libs/validation/gmoSettingSchema";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { checkHasOnlineBookingFromGMO } from "utils/server/booking";
import { ERROR_MESSAGES } from "constants/errors";
import { checkExistingGMOSetting, checkHasAssociatedTenant } from "utils/server/gmo";

const validate = withValidation({
  schema: gmoSettingSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN]));

handler.put(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { id, shopId, shopPass } = req.body;

  const currentGMOSetting = await prisma.gMOSetting.findFirst({
    where: { id: +id },
  });

  const wasChangedShopId = shopId !== currentGMOSetting.shopId;
  const wasChangedShopPass = shopPass !== currentGMOSetting.shopPass;

  const wasChangedShopIdentify = wasChangedShopId || wasChangedShopPass;

  if (wasChangedShopIdentify) {
    const hasBooking = await checkHasOnlineBookingFromGMO(currentGMOSetting.id);
    if (hasBooking) {
      return res.status(400).json({ error: ERROR_MESSAGES.CANNOT_EDIT_GMO_SETTING });
    }
  }

  if (wasChangedShopId) {
    if (await checkExistingGMOSetting(req.body.shopId)) {
      return res.status(400).json({ error: ERROR_MESSAGES.SHOP_ID_ALREADY_EXIST });
    }
  }

  const gmoSetting = await prisma.gMOSetting.update({
    where: {
      id: +id,
    },
    data: req.body,
  });

  res.status(200).json({ data: gmoSetting });
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id;

  const hasTenant = await checkHasAssociatedTenant(id);
  if (hasTenant) {
    return res.status(400).json({ error: ERROR_MESSAGES.CANNOT_DELETE_GMO_SETTING });
  }

  const gmoSetting = await prisma.gMOSetting.delete({
    where: {
      id,
    },
  });

  res.status(200).json({ data: gmoSetting });
});

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id;

  const gmoSetting = await prisma.gMOSetting.findUnique({
    where: { id },
  });

  res.status(200).json({ data: gmoSetting });
});

export default handler;
