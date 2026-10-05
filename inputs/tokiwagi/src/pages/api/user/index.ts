import randomString from "randomstring";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { User } from "@prisma/client";

import emailService from "services/email.service";
import checkAuth from "libs/middleware/checkAuth";
import prisma from "utils/db";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";
import { updateLineUserSchema } from "libs/validation/schemas";
import withValidation from "libs/middleware/withValidation";
import { ERROR_MESSAGES } from "constants/errors";
import { EMAIL_SETTING_KEY } from "constants/settings";
import { serverConfig } from "config";
import { checkExistingEmailIncludeDeleted } from "utils/auth";
import { deleteUser } from "utils/server/user";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

const validateUpdate = withValidation({
  schema: updateLineUserSchema,
  mode: "body",
});

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;

  const userInfo = await prisma.user.findUnique({
    omit: {
      firstCheckedOutBookingId: true,
      token: true,
      deleted: true,
      deletedAt: true,
      deletedBy: true,
    },
    where: {
      id: user.id,
    },
  });

  res.status(200).json({ data: userInfo });
});

handler.put(validateUpdate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;
  const { email, isLineSignUpMode } = req.body;
  const name = `${req.body.lastName} ${req.body.firstName}`;

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  const updateUser = { ...req.body };
  if (!updateUser.token) {
    updateUser.token = randomString.generate();
  }

  delete updateUser.email;
  delete updateUser.isLineSignUpMode;

  if (email === currentUser.email) {
    delete updateUser.email;
  } else if (await checkExistingEmailIncludeDeleted(email)) {
    return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_TAKEN });
  } else {
    if (isLineSignUpMode) {
      emailService.sendEmail(email, EMAIL_SETTING_KEY.VERIFY_ACCOUNT, { name, link: `${serverConfig.external.url}/verify/${updateUser.token}?email=${email}` });
    } else {
      emailService.sendEmail(email, EMAIL_SETTING_KEY.EDIT_EMAIL_NOTIFICATION, {
        name: name,
        link: `${serverConfig.external.url}/user/my-page/personal-info/update-information/verify-edit-email/${updateUser.token}?email=${email}`,
      });
    }
  }

  try {
    const userInfo = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...updateUser,
        name: name,
      } as User,
    });
    delete userInfo.password;
    res.status(200).json({ data: userInfo });
  } catch (error) {
    const message = error.message;
    if (message.includes("Unique constraint") && message.includes("email")) {
      return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_TAKEN });
    } else {
      throw error;
    }
  }
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;
  const deletedUser = await deleteUser(user.id, user.role);
  res.status(200).json({ data: deletedUser });
});

export default handler;
