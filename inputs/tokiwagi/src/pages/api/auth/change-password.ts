import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { getToken } from "next-auth/jwt";

import { ERROR_MESSAGES } from "constants/errors";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { changeAdminPasswordSchema } from "libs/validation/schemas";
import {
  verifyPassword,
  getUserByEmail,
  hashPassword,
  updatePassword,
} from "utils/auth";
import { IResponse } from "models/Response";
import { withLogging } from "libs/middleware/withLogging";
import { serverConfig } from "config";

const validate = withValidation({
  schema: changeAdminPasswordSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch });

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const token = await getToken({
    req,
    secret: serverConfig.auth.secret,
  });
  const user = await getUserByEmail(token.email);
  const { currentPassword, newPassword } = req.body;

  if (!user) {
    return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_NOT_FOUND });
  }

  const isMatchCurrentPassword = await verifyPassword(
    currentPassword,
    user.password,
  );

  if (!isMatchCurrentPassword) {
    return res
      .status(400)
      .json({ error: ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT });
  }

  const hashedPassword = await hashPassword(newPassword);

  await updatePassword(user.token, hashedPassword);

  res.status(200).json({ data: "success" });
});

export default validate(withLogging(handler));
