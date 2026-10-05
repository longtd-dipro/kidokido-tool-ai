import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import prisma from "utils/db";
import { IResponse } from "models/Response";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";
import { getAppSettingByKey } from "utils/app-setting";

const handler = nc({ onError, onNoMatch }).use(checkAuth).use(roleAuth([ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const settingKey = req.query.settingKey as string;

  const appSetting = await getAppSettingByKey(settingKey);

  res.status(200).json({ data: appSetting });
});

handler.put(
  async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
    const appSetting = await prisma.appSetting.update({
      where: {
        settingKey: req.body.settingKey,
      },
      data: req.body,
    });
    res.status(200).json({ data: appSetting });
  }
);

handler.delete(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const settingKey = req.query.settingKey as string;
  const appSetting = await prisma.appSetting.delete({
    where: {
      settingKey
    }
  });
  res.status(200).json({ data: appSetting });
});

export default handler;
