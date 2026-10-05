import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import emailService from "services/email.service";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { getUserByToken, markAccountAsVerified } from "utils/auth";
import { IResponse } from "models/Response";
import { ERROR_MESSAGES } from "constants/errors";
import { MESSAGES } from "constants/messages";
import { EMAIL_SETTING_KEY } from "constants/settings";
import { serverConfig } from "config";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const token = req.query.token as string;
  const user = await getUserByToken(token);

  if (user) {
    if (!user.emailVerified) {
      await markAccountAsVerified(token);
      emailService.sendEmail(user.email, EMAIL_SETTING_KEY.VERIFY_SUCCESSFUL, { name: user.name, link: serverConfig.external.url });
      return res.status(200).json({ data: MESSAGES.ACCOUNT_VERIFIED });
    }
    return res.status(200).json({ data: { isAlreadyVerified: true } });
  } else {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_TOKEN, data: { isInvalidToken: true } });
  }
});

export default handler;
