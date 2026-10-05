import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { encode } from "next-auth/jwt";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { signInSchema } from "libs/validation/schemas";
import { IResponse } from "models/Response";
import { getUserByEmail, verifyPassword } from "utils/auth";
import { ERROR_MESSAGES } from "constants/errors";
import { serverConfig } from "config";

const validate = withValidation({
  schema: signInSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch });

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error(ERROR_MESSAGES.INVALID_CREDENTIAL);
  }

  if (!user.password) {
    throw new Error(ERROR_MESSAGES.INVALID_CREDENTIAL);
  }

  if (!(await verifyPassword(password, user.password))) {
    throw new Error(ERROR_MESSAGES.INVALID_CREDENTIAL);
  }

  const authUser = {
    userId: user.id,
    role: user.role,
    tenantCode: undefined,
    tenantName: undefined,
    rememberMe: false
  };

  const accessToken = await encode({
    token: authUser,
    secret: serverConfig.auth.secret
  });

  res.status(200).json({ data: { accessToken } });
});

export default validate(handler);
