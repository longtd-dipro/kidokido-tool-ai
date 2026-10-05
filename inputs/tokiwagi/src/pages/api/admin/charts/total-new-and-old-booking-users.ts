import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus } from "@prisma/client";

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
  const currentTimezone = process.env.TZ || "Asia/Ho_Chi_Minh";
  const results = await prisma.$queryRaw`
    WITH user_first_bookings AS (
      SELECT 
        user_id, 
        MIN(DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE ${currentTimezone})) AS first_booking_date 
      FROM 
        bookings 
      WHERE 
        tenant_code = ${tenantCode} 
        AND status::text NOT IN (${BookingStatus.SystemCancelled}, ${BookingStatus.Cancelled}) 
      GROUP BY 
        user_id
    ), 
    filtered_bookings AS (
      SELECT 
        b.user_id, 
        DATE(b.created_at AT TIME ZONE 'UTC' AT TIME ZONE ${currentTimezone}) AS date, 
        ufb.first_booking_date AS first_booking_date 
      FROM 
        bookings b 
        INNER JOIN user_first_bookings ufb ON ufb.user_id = b.user_id 
      WHERE 
        b.tenant_code = ${tenantCode} 
        AND b.status::text NOT IN (${BookingStatus.SystemCancelled}, ${BookingStatus.Cancelled}) 
        AND DATE(b.created_at AT TIME ZONE 'UTC' AT TIME ZONE ${currentTimezone}) BETWEEN ${newDateKeepLocalTime(dateFrom as string)} 
        AND ${newDateKeepLocalTime(dateTo as string)}
    ) 
    SELECT 
      date, 
      COUNT(*) FILTER (WHERE date = first_booking_date) AS "totalNewUsers", 
      COUNT(*) FILTER (WHERE date != first_booking_date) AS "totalOldUsers" 
    FROM 
      filtered_bookings 
    GROUP BY 
      date 
    ORDER BY 
      date;
  `;

  res.status(200).json({ data: results });
});

export default handler;
