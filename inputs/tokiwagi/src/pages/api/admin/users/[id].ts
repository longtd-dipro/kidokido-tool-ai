import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { updateUserSchemaAdmin, updateUserSchemaForStaff } from "libs/validation/schemas";
import { hashPassword } from "utils/auth";
import { ERROR_MESSAGES } from "constants/errors";
import { deleteUser } from "utils/server/user";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.put(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const fromStaff = req.body.fromStaff;
  try {
    fromStaff ? await updateUserSchemaForStaff.validate(req.body) : await updateUserSchemaAdmin.validate(req.body);
  } catch (error) {
    return res.status(400).send({ error: error.message, data: error });
  }

  const id = Number(req.query.id);
  const { password } = req.body;

  const name = `${req.body.lastName} ${req.body.firstName}`;

  delete req.body.confirmationPassword;
  delete req.body.confirmationEmail;
  delete req.body.fromStaff;

  const userCurrent = await prisma.user.findUnique({
    where: { id },
  });
  const userUpdated = { ...req.body, name };

  if (password === userCurrent.password) {
    delete userUpdated.password;
  } else {
    userUpdated.password = await hashPassword(password);
  }

  try {
    const user = await prisma.user.update({
      where: {
        id: id,
      },

      data: userUpdated,
    });

    res.status(200).json({ data: user });
  } catch (error) {
    const message = error.message;
    if (message.includes("Unique constraint") && message.includes("email")) {
      return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_TAKEN });
    } else {
      throw error;
    }
  }
});

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  res.status(200).json({ data: user });
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id;
  const { user } = req;
  const deletedUser = await deleteUser(id, user.role);
  res.status(200).json({ data: deletedUser });
});
export default handler;
