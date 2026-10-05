import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { PAGE_SIZE, ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import { ERROR_MESSAGES } from "constants/errors";
import { ActivityType, RevenueStatus } from "models/enums";
import { handleWriteActivityLog } from "utils/server/activity-log";
import { getRevenueBookings } from "utils/server/revenue-management";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const tenantCode = req.query.tenantCode as string;
  if (req.user.tenantCode && tenantCode && req.user.tenantCode !== tenantCode) {
    return res.status(403).json({ error: ERROR_MESSAGES.ADMIN_NOT_BELONG_TO_THIS_TENANT });
  }

  const ticketId = req.query.ticketId ? +req.query.ticketId : undefined;
  const revenueStatus = req.query.revenueStatus as RevenueStatus;
  const fromDate = req.query.fromDate as string;
  const toDate = (req.query.endDate as string) || new Date();
  const fromAction = req.query.fromAction as ActivityType;

  fromAction && (await handleWriteActivityLog(req.query, req.user, fromAction));

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || PAGE_SIZE;
  const skip = (page - 1) * limit;

  const bookings = await getRevenueBookings({
    tenantCode,
    ticketId,
    revenueStatus,
    fromDate,
    toDate,
    limit,
    skip,
  });

  res.status(200).json({ data: bookings });
});

export default handler;
