import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ERROR_MESSAGES } from "constants/errors";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { tokenSchema } from "libs/validation/schemas";
import { IResponse } from "models/Response";
import { getUserByToken, unlockAccount } from "utils/auth";
import { withLogging } from "libs/middleware/withLogging";

const validate = withValidation({
  schema: tokenSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch });

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { token } = req.body;
  const user = await getUserByToken(token);

  if (!user) {
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_TOKEN,
      data: { isInvalidToken: true },
    });
  }

  await unlockAccount(user.id);

  res.status(204).json({ data: null });
});

export default validate(withLogging(handler));
