import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import randomString from "randomstring";

import { ROLE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { tenantSchema } from "libs/validation/schemas";
import { IResponse } from "models/Response";
import { checkExistingEmailIncludeDeleted, hashPassword } from "utils/auth";
import prisma from "utils/db";
import { checkHasOnlineBookingFromTenant } from "utils/server/booking";

const validate = withValidation({
  schema: tenantSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch });

handler.delete(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const code = req.query.code as string;
  const tenant = await prisma.tenant.delete({
    where: {
      code,
    },
  });

  res.status(200).json({ data: tenant });
});

handler.put(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { code, guide, User, gmoId } = req.body;
  const trimGuide = guide.trim();
  const currentTenant = await prisma.tenant.findUnique({
    where: { code },
    include: {
      AdminTenant: {
        select: {
          User: true,
        },
      },
    },
  });

  let updateAdminTenant: any = {
    update: {
      User: {
        update: User,
      },
    },
  };

  // Check if change Admin user
  if (User.email !== currentTenant.AdminTenant?.User?.email) {
    if (await checkExistingEmailIncludeDeleted(User.email)) {
      return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_TAKEN });
    }
    // Remove Old Admin
    await prisma.adminTenant.deleteMany({ where: { tenantCode: code } });
    // Create then assign new Admin
    updateAdminTenant = {
      create: {
        User: {
          create: User,
        },
      },
    };
    User.role = ROLE.ADMIN;
    User.token = randomString.generate();
    User.emailVerified = new Date();
  }

  if (User.password !== currentTenant.AdminTenant?.User?.password) {
    User.password = await hashPassword(User.password);
  }

  delete req.body.email;
  delete req.body.password;
  delete req.body.confirmationPassword;
  delete req.body.User;
  delete req.body.AdminTenant;

  const doesChangeGMOSettingId = gmoId !== currentTenant.gmoId;

  if (doesChangeGMOSettingId) {
    const hasBooking = await checkHasOnlineBookingFromTenant(currentTenant.code);
    if (hasBooking) {
      return res.status(400).json({ error: ERROR_MESSAGES.CANNOT_EDIT_GMO_SETTING });
    }
  }

  const tenant = await prisma.tenant.update({
    where: {
      code: code,
    },
    data: {
      ...req.body,
      guide: trimGuide,
      AdminTenant: updateAdminTenant,
    },
  });

  res.status(200).json({ data: tenant });
});

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const code = req.query.code as string;
  const tenant = await prisma.tenant.findUnique({
    where: { code },
    include: {
      AdminTenant: {
        select: {
          User: true,
        },
      },
      GMOSetting: true,
    },
  });
  res.status(200).json({ data: tenant });
});

handler.patch(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const code = req.query.code as string;
  const { imageUrl } = req.body;

  const updateTenant = await prisma.tenant.update({
    where: {
      code,
    },
    data: {
      imageUrl,
    },
  });

  res.status(200).json({ data: { tenant: updateTenant } });
});

export default handler;
