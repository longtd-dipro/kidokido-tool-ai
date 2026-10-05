import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { EMAIL_SETTING_KEY } from "constants/settings";
import { serverConfig } from "config";
import { ERROR_MESSAGES } from "constants/errors";
import { ROLE } from "constants/common";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { forgotPasswordSchema } from "libs/validation/schemas";
import emailService from "services/email.service";
import { getUserByEmail } from "utils/auth";
import { IResponse } from "models/Response";
import { withLogging } from "libs/middleware/withLogging";

const validate = withValidation({
  schema: forgotPasswordSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch });

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);

  if (!user) {
    return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_NOT_FOUND });
  }

  const link = `${serverConfig.external.url}${user.role === ROLE.USER ? "/reset-password" : "/admin/reset-password"}/${user.token}`;

  emailService.sendEmail(email, EMAIL_SETTING_KEY.RESET_PASSWORD, {
    name: user.name,
    link,
  });

  res.status(200).json({ data: user.token });
});

export default validate(withLogging(handler));
