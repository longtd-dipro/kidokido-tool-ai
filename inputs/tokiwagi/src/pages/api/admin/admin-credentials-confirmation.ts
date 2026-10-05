import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { signInSchema } from "libs/validation/schemas";
import { IResponse } from "models/Response";
import { verifyPassword } from "utils/auth";
import prisma from "utils/db";

const validate = withValidation({
  schema: signInSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { email, password } = req.body;

  const admin = await prisma.user.findUnique({ where: { email } });

  if (!admin) {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CREDENTIAL });
  }

  if (!(await verifyPassword(password, admin.password))) {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CREDENTIAL });
  }

  if (admin.id !== req.user.id) {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CREDENTIAL });
  }

  res.status(200).json({ data: null });
});

export default handler;
