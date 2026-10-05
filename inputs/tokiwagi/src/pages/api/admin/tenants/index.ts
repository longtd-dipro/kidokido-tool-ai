import randomString from "randomstring";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { tenantSchema } from "libs/validation/schemas";
import prisma from "utils/db";
import { IResponse } from "models/Response";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { checkExistingEmailIncludeDeleted, hashPassword } from "utils/auth";
import { ERROR_MESSAGES } from "constants/errors";
import { ROLE } from "constants/common";
import { checkExistingTenantCode } from "utils/server/tenant";

const validate = withValidation({
  schema: tenantSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const code = req.query.code as string;
  const { limit, page } = req.query;

  const tenants = await prisma.tenant.findMany({
    where: {
      code: {
        contains: code,
        mode: "insensitive",
      },
    },
    include: {
      AdminTenant: {
        select: {
          User: true,
        },
      },
    },
    skip: page ? (Number(page) - 1) * Number(limit) : undefined,
    take: limit ? Number(limit) : undefined,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({ data: tenants });
});

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { User, code } = req.body;

  delete req.body.email;
  delete req.body.password;
  delete req.body.confirmationPassword;
  delete req.body.User;
  delete req.body.imageUrl;

  if (await checkExistingEmailIncludeDeleted(User.email)) {
    return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_TAKEN });
  }

  if (await checkExistingTenantCode(code)) {
    return res.status(400).json({ error: ERROR_MESSAGES.TENANT_CODE_ALREADY_EXIST });
  }

  User.password = await hashPassword(User.password);
  User.emailVerified = new Date();
  User.token = randomString.generate();
  User.role = ROLE.ADMIN;

  const tenant = await prisma.tenant.create({
    data: {
      ...req.body,
      AdminTenant: {
        create: {
          User: {
            create: {
              ...User,
              id: undefined,
            },
          },
        },
      },
    },
    include: {
      AdminTenant: {
        select: {
          User: true,
        },
      },
    },
  });

  res.status(200).json({ data: tenant });
});

export default handler;
