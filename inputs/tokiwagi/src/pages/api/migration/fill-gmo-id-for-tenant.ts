import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { serverConfig } from "config";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const unfilledTenants = await prisma.tenant.findMany({
    where: { gmoId: null },
  });

  let filledCount = 0;

  const DEFAULT_GMO_SETTING_PAYLOAD = {
    name: "ボネルンド",
    shopId: serverConfig.gmo.shop_id,
    shopPass: serverConfig.gmo.shop_pass,
  };

  const defaultGMOSetting = await prisma.gMOSetting.upsert({
    where: {
      shopId: DEFAULT_GMO_SETTING_PAYLOAD.shopId,
    },
    update: {
      ...DEFAULT_GMO_SETTING_PAYLOAD,
    },
    create: {
      ...DEFAULT_GMO_SETTING_PAYLOAD,
    },
  });

  if (defaultGMOSetting) {
    for (let i = 0; i < unfilledTenants.length; i++) {
      const unfilledTenant = unfilledTenants[i];

      await prisma.tenant.update({
        where: { code: unfilledTenant.code },
        data: {
          gmoId: defaultGMOSetting.id,
        },
      });

      filledCount++;
    }
  }

  res.status(200).json({
    data: {
      unfilledTenants: unfilledTenants.length,
      filledCount,
    },
  });
});

export default handler;
