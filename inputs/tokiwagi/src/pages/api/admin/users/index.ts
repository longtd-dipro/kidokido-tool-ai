import { Role, User } from "@prisma/client";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import randomString from "randomstring";

import { MAXIMUM_POSTGRES_BIND_VARIABLES_COUNT_FOR_QUERY, ROLE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { createUserSchema } from "libs/validation/schemas";
import { IResponse } from "models/Response";
import { ActivityType } from "models/enums";
import { checkExistingEmailIncludeDeleted, hashPassword } from "utils/auth";
import prisma from "utils/db";
import { sendSuccessfulRegisterUserEmail } from "utils/email";
import { handleWriteActivityLog } from "utils/server/activity-log";
import { splitArrayIntoChunks } from "utils/array";

const validateCreate = withValidation({
  schema: createUserSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const name = req.query.name as string;
  const email = req.query.email as string;
  const phoneNumber = req.query.phone as string;
  const startDate = req.query.startDate && moment(req.query.startDate).toDate();
  const endDate = req.query.endDate && moment(req.query.endDate).endOf("day").toDate();
  const fromAction = req.query.fromAction as ActivityType;
  const includeCheckoutInfo = req.query.includeCheckoutInfo === "true";

  fromAction && (await handleWriteActivityLog(req.query, req.user, fromAction));

  let users: User[];

  const { limit, page } = req.query;

  users = await prisma.user.findMany({
    where: {
      role: Role.User,
      AND: [
        {
          name: {
            contains: name || undefined,
            mode: "insensitive",
          },
          email: {
            contains: email || undefined,
            mode: "insensitive",
          },
          phone: {
            contains: phoneNumber || undefined,
            mode: "insensitive",
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      ],
    },
    skip: page ? (Number(page) - 1) * Number(limit) : undefined,
    take: limit ? Number(limit) : undefined,
    orderBy: {
      createdAt: "desc",
    },
  });

  if (includeCheckoutInfo && users.length) {
    users = await augmentCheckedOutInfo(users);
  }

  res.status(200).json({ data: users });
});

handler.post(validateCreate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { email, password, firstName, lastName } = req.body;

  delete req.body.confirmationPassword;

  if (await checkExistingEmailIncludeDeleted(email)) {
    return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_TAKEN });
  }

  const token = randomString.generate();
  const user = await prisma.user.create({
    data: {
      ...req.body,
      password: await hashPassword(password),
      name: `${lastName} ${firstName}`,
      token,
      emailVerified: new Date(),
    },
  });

  sendSuccessfulRegisterUserEmail(user);

  res.status(200).json({ data: user });
});

export default handler;

const augmentCheckedOutInfo = async (users: User[]) => {
  const userIds = users.map((user) => user.id);
  const userIdsChunks = splitArrayIntoChunks(userIds, MAXIMUM_POSTGRES_BIND_VARIABLES_COUNT_FOR_QUERY);
  const checkedOutInfoByUserMap = {};
  for (const userIdsChunk of userIdsChunks) {
    const placeholders = userIdsChunk.map((_, i) => `$${i + 1}`).join(", ");
    // Using raw query to get checked out info
    const checkedOutInfoByUser: { user_id: number; checked_out_count: number; last_checked_out: string }[] = await prisma.$queryRawUnsafe(
      `SELECT user_id, COUNT(DISTINCT bar_code) AS checked_out_count, MAX(checked_out_at) AS last_checked_out
       FROM bookings
       where first_checked_in_at IS NOT NULL
         AND user_id IN (${placeholders})
       GROUP BY user_id
      `, ...userIdsChunk);

    checkedOutInfoByUser.forEach((item) => {
      checkedOutInfoByUserMap[item.user_id] = {
        checkedOutCount: item.checked_out_count,
        lastCheckedOut: item.last_checked_out,
      };
    });
  }

  users = users.map((user) => {
    const checkedOutInfo = checkedOutInfoByUserMap[user.id];
    return {
      ...user,
      checkedOutCount: checkedOutInfo?.checkedOutCount || 0,
      lastCheckedOut: checkedOutInfo?.lastCheckedOut || null,
    };
  });

  return users;
};
