import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { ERROR_MESSAGES } from "constants/errors";
import withValidation from "libs/middleware/withValidation";
import { editEmailSchema } from "libs/validation/schemas";

const handler = nc({ onError, onNoMatch });

const validate = withValidation({
  schema: editEmailSchema,
  mode: "body",
});

handler.put(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { email , token } = req.body;

  try {
    const updateUser = await prisma.user.update({
      where: {
        token
      },
      data: {
        email: email,
      },
    });

    res.status(200).json({ data: updateUser });
  } catch (error) {
    const message = error.message;
    if (message.includes("Unique constraint") && message.includes("email")){
      return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_TAKEN });
    } else {
      throw error;
    }
  }
});
export default handler;
