import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { staffConfirmationSchema } from "libs/validation/schemas";
import { IResponse } from "models/Response";
import { verifyPassword } from "utils/auth";
import prisma from "utils/db";

const validate = withValidation({
  schema: staffConfirmationSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { idOrEmail, password } = req.body;
  const loggedUser = req.user;

  const staff = await prisma.staff.findUnique({ where: { id: idOrEmail } });

  if (staff) {
    if (staff.tenantCode !== loggedUser.tenantCode) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CREDENTIAL });
    }

    if (!(await verifyPassword(password, staff.password))) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CREDENTIAL });
    }

    return res.status(200).json({ data: staff });
  }

  const user = await prisma.user.findUnique({ where: { email: idOrEmail } });

  if (user) {
    if (user.id !== loggedUser.id) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CREDENTIAL });
    }

    if (!(await verifyPassword(password, user.password))) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CREDENTIAL });
    }

    return res.status(200).json({ data: user });
  }

  return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CREDENTIAL });
});

export default handler;
