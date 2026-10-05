import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { emailSchema } from "libs/validation/schemas";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { withLogging } from "libs/middleware/withLogging";

const validate = withValidation({
  schema: emailSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN]));

handler.put(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { email: req.body.email } });
  res.status(200).json({ data: user });
});

export default validate(withLogging(handler));
