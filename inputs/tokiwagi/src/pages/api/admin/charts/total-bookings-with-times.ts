import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus } from "@prisma/client";

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
  const { dateFrom, dateTo, tenantCode } = req.query;

  const results = await prisma.$queryRaw`
  with A as (select user_id, count(*) as total_booking from bookings
  where tenant_code = ${tenantCode}
       and ${newDateKeepLocalTime(dateFrom as string)} <= date and date <= ${newDateKeepLocalTime(dateTo as string)}
       and status::text not in (${BookingStatus.SystemCancelled}, ${BookingStatus.Cancelled})
       and payment_status::text = ${PaymentStatus.Completed}
  group by user_id)
  select total_booking as times, count(*) as total_bookings from A
  group by total_booking
  `;

  res.status(200).json({ data: results });
});

export default handler;
