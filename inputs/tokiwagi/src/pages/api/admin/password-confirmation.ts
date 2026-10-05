import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { passwordSchema } from "libs/validation/schemas";
import { IResponse } from "models/Response";
import { verifyPassword } from "utils/auth";
import prisma from "utils/db";

const validate = withValidation({
  schema: passwordSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { password } = req.body;
  const { id } = req.user;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!(await verifyPassword(password, user.password))) {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_PASSWORD });
  }

  res.status(200).json({ data: user });
});

export default handler;
