import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { serverConfig } from "config";
import { ROLE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import { EMAIL_SETTING_KEY } from "constants/settings";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { emailSchema } from "libs/validation/schemas";
import { IResponse } from "models/Response";
import emailService from "services/email.service";
import { getUserByEmail } from "utils/auth";

const validate = withValidation({
  schema: emailSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch });

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);

  if (!user) {
    return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_NOT_FOUND });
  }

  if (user.role !== ROLE.SUPER_ADMIN) {
    return res.status(400).json({ error: ERROR_MESSAGES.REQUIRED_SUPER_ADMIN_PERMISSION });
  }

  const link = `${serverConfig.external.url}/admin/unlock-account/${user.token}`;

  const SUPER_ADMIN_NAME = "運営管理者";

  emailService.sendEmail(email, EMAIL_SETTING_KEY.UNLOCK_ACCOUNT, {
    name: SUPER_ADMIN_NAME,
    link,
  });

  res.status(200).json({ data: user.token });
});

export default validate(handler);
