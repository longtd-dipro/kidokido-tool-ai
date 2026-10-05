import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import randomString from "randomstring";

import { checkExistingEmailIncludeDeleted, hashPassword } from "utils/auth";
import prisma from "utils/db";
import { createUserSchema } from "libs/validation/schemas";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { IResponse } from "models/Response";
import { ERROR_MESSAGES } from "constants/errors";
import { serverConfig } from "config";
import emailService from "services/email.service";
import { EMAIL_SETTING_KEY } from "constants/settings";
import { withLogging } from "libs/middleware/withLogging";

const validate = withValidation({
  schema: createUserSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch });

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { email, password, lastName, firstName, systemCreated } = req.body;

  delete req.body.confirmationPassword;
  delete req.body.confirmationEmail;
  delete req.body.agreePrivacy;
  delete req.body.systemCreated;

  if (await checkExistingEmailIncludeDeleted(email)) {
    return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_TAKEN });
  }

  const token = randomString.generate();
  const name = `${lastName} ${firstName}`;
  let user;
  try {
    user = await prisma.user.create({
      data: {
        ...req.body,
        id: undefined,
        name,
        password: await hashPassword(password),
        token,
        emailVerified: systemCreated ? new Date() : undefined,
      },
    });
  } catch (e) {
    const message = e.message;
    if (message.includes("Unique constraint") && message.includes("email")) {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.EMAIL_ALREADY_TAKEN });
    } else {
      throw e;
    }
  }

  if (!systemCreated) {
    emailService.sendEmail(email, EMAIL_SETTING_KEY.VERIFY_ACCOUNT, {
      name: name,
      link: `${serverConfig.external.url}/verify/${token}`,
    });
  }

  return res.status(200).json({ data: { id: user.id } });
});

export default validate(withLogging(handler));
