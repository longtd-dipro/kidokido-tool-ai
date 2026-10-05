import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { newDateKeepLocalTime } from "utils/date-time";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN, ROLE.ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { dateFrom, dateTo } = req.query;

  const results: any[] = await prisma.$queryRaw`
  with TotalBookingsAndTotalUsersGroup as (with TotalUserBookingsGroup as (select tenant_code, user_id, count(*) as total_bookings from bookings
  where ${newDateKeepLocalTime(dateFrom as string)} <= date and date <= ${newDateKeepLocalTime(dateTo as string)}
  group by tenant_code, user_id)
  select tenant_code, sum(total_bookings) as total_bookings, count(user_id) as total_users from TotalUserBookingsGroup
  group by tenant_code)
  select *, (total_bookings / total_users)::float as ratio from TotalBookingsAndTotalUsersGroup
  `;

  res.status(200).json({ data: results });
});

export default handler;
