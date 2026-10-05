import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { EMAIL_SETTING_KEY } from "constants/settings";
import { serverConfig } from "config";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import emailService from "services/email.service";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { ERROR_MESSAGES } from "constants/errors";
import { withLogging } from "libs/middleware/withLogging";

const handler = nc({ onError, onNoMatch });

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { email, token } = req.body;

  if (!email) {
    return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_IS_REQUIRED });
  }

  const filters = token ? { token } : { email };

  const user = await prisma.user.findUnique({
    where: filters,
  });

  const { name } = user;
  const {
    external: { url },
  } = serverConfig;
  const link = `${url}/verify/${user.token}?email=${email}`;

  emailService.sendEmail(email, EMAIL_SETTING_KEY.VERIFY_ACCOUNT, {
    name,
    link,
  });

  res.status(200).json({ data: { message: "Email send successful" } });
});

export default withLogging(handler);
