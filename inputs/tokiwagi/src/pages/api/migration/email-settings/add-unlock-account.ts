import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const EMAIL_SETTING_SEED = {
    emailKey: "unlock-account",
    name: "運営管理側アカウントのロック解除",
    title: "運営管理側アカウントのロック解除",
    content: `
      <p>{{%=data.name%}}様</p>
      <p>アカウントのロックを解除させる場合は<a href="{{%=data.link%}}" rel="noopener noreferrer" target="_blank">こちらをクリック</a>してください。</p>
    `,
  };

  const emailSetting = await prisma.emailSetting.create({
    data: EMAIL_SETTING_SEED,
  });

  res.status(200).json({
    data: emailSetting,
  });
});

export default handler;
