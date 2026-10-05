import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { Role } from "@prisma/client";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { IResponse } from "models/Response";
import { hashPassword } from "utils/auth";
import prisma from "utils/db";
import { staffSchema } from "libs/validation/staffSchema";
import { ERROR_MESSAGES } from "constants/errors";

const validateUpdate = withValidation({
  schema: staffSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = req.query.id as string;

  const staff = await prisma.staff.findUnique({
    where: { id },
    include: { Tenant: true },
  });

  res.status(200).json({ data: staff });
});

handler.put(validateUpdate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = req.query.id as string;
  const { password: enteredPassword, id: enteredId, lastName, firstName } = req.body;

  if (enteredId !== id) {
    const existingStaff = await prisma.staff.findUnique({
      where: {
        id: enteredId,
      },
    });

    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: enteredId,
        role: {
          in: [Role.Admin, Role.SuperAdmin],
        },
      },
    });

    if (existingStaff || existingAdmin) {
      return res.status(400).json({ error: ERROR_MESSAGES.STAFF_ID_ALREADY_TAKEN });
    }
  }

  const staff = await prisma.staff.findUnique({ where: { id } });

  const password = enteredPassword !== staff.password ? await hashPassword(enteredPassword) : undefined;
  const name = `${lastName} ${firstName}`;

  const updatedStaff = await prisma.staff.update({
    where: { id },
    data: { ...req.body, name, password },
  });

  res.status(200).json({ data: updatedStaff });
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = req.query.id as string;
  const staff = await prisma.staff.delete({ where: { id } });
  res.status(200).json({ data: staff });
});

export default handler;
