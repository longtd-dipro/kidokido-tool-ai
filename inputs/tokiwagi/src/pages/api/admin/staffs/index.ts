import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { Role } from "@prisma/client";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { staffSchema } from "libs/validation/staffSchema";
import { IResponse } from "models/Response";
import { hashPassword } from "utils/auth";
import prisma from "utils/db";
import { ERROR_MESSAGES } from "constants/errors";

const validateCreate = withValidation({
  schema: staffSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const name = req.query.name as string;
  const tenantCode = req.user.tenantCode || (req.query.tenantCode as string);
  const { limit, page } = req.query;

  const staffs = await prisma.staff.findMany({
    where: {
      AND: [
        {
          name: {
            contains: name || undefined,
            mode: "insensitive",
          },
          tenantCode: {
            contains: tenantCode || undefined,
            mode: "insensitive",
          },
        },
      ],
      Tenant: {
        deleted: false,
      },
    },
    skip: page ? (Number(page) - 1) * Number(limit) : undefined,
    take: limit ? Number(limit) : undefined,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({ data: staffs });
});

handler.post(validateCreate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { password, firstName, lastName, id } = req.body;

  const existingStaff = await prisma.staff.findUnique({ where: { id } });
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: id,
      role: {
        in: [Role.Admin, Role.SuperAdmin],
      },
    },
  });

  if (existingStaff || existingAdmin) {
    return res.status(400).json({ error: ERROR_MESSAGES.STAFF_ID_ALREADY_TAKEN });
  }

  const staff = await prisma.staff.create({
    data: {
      ...req.body,
      password: await hashPassword(password),
      name: `${lastName} ${firstName}`,
    },
  });

  res.status(200).json({ data: staff });
});

export default handler;
