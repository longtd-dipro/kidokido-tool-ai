import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { MAXIMUM_ALLOWED_LOGIN_ATTEMPTS, ROLE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { signInSchema } from "libs/validation/schemas";
import { IResponse } from "models/Response";
import { getAdminTenantByUserId, getUserByEmail, increaseLoginAttempts, resetLoginAttempts, verifyPassword } from "utils/auth";
import { isSuperAdmin, isSuperAdminOrAdmin } from "utils/user";
import { formatMessage } from "utils/common";

const validate = withValidation({
  schema: signInSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch });

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);

  if (!user || !user?.password) {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CREDENTIAL });
  }

  if (!isSuperAdminOrAdmin(user)) {
    return res.status(400).json({ error: ERROR_MESSAGES.REQUIRED_ADMIN_PERMISSION });
  }

  if (user.locked) {
    const errMsg = isSuperAdmin(user) ? ERROR_MESSAGES.LOCKED_SUPER_ADMIN : ERROR_MESSAGES.LOCKED_ADMIN;
    return res.status(400).json({ error: errMsg });
  }

  if (!(await verifyPassword(password, user.password))) {
    let message = ERROR_MESSAGES.INVALID_CREDENTIAL;
    if (isSuperAdminOrAdmin(user)) {
      const updatedUser = await increaseLoginAttempts(user);
      message = formatMessage(
        ERROR_MESSAGES.INVALID_CREDENTIAL_WITH_LOGGED_ATTEMPTS,
        updatedUser.loginAttempts,
        `${MAXIMUM_ALLOWED_LOGIN_ATTEMPTS - updatedUser.loginAttempts}`
      );

      if (updatedUser.locked) {
        message = isSuperAdmin(user) ? ERROR_MESSAGES.LOCKED_SUPER_ADMIN : ERROR_MESSAGES.LOCKED_ADMIN;
      }
    }

    return res.status(400).json({ error: message });
  }

  if (user.role === ROLE.ADMIN) {
    const adminTenant = await getAdminTenantByUserId(user.id);
    if (!adminTenant) {
      return res.status(400).json({ error: ERROR_MESSAGES.ADMIN_NOT_BELONG_ANY_TENANTS });
    }
  }

  await resetLoginAttempts(user.id);

  res.status(200).json({ data: user });
});

export default handler;
