import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus, Prisma, TicketType } from "@prisma/client";
import { isEmpty } from "lodash";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { ERROR_MESSAGES } from "constants/errors";
import { toEndOfDayStr, toStartOfDayStr } from "utils/date-time";
import { RevenueStatus } from "models/enums";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const tenantCode = req.query.tenantCode as string;
  if (req.user.tenantCode && tenantCode && req.user.tenantCode !== tenantCode) {
    return res.status(403).json({ error: ERROR_MESSAGES.ADMIN_NOT_BELONG_TO_THIS_TENANT });
  }

  const ticketId = +req.query.ticketId;
  const revenueStatus = req.query.revenueStatus as RevenueStatus;
  const fromDate = req.query.fromDate as string;
  const toDate = (req.query.endDate as string) || new Date();

  let queryRevenueStatusClause = "";
  let additionalJoinClause = "";
  if (!isEmpty(revenueStatus)) {
    if (revenueStatus === RevenueStatus.ALREADY_RECHECKIN) {
      queryRevenueStatusClause = `AND "b"."re_check_in_count" >= '${1}'`;
    } else if (revenueStatus === RevenueStatus.NOT_RECHECKIN) {
      queryRevenueStatusClause = `AND "b"."re_check_in_count" = '${0}'`;
    } else if (revenueStatus === RevenueStatus.NOT_USED) {
      additionalJoinClause = `
        LEFT JOIN (
          SELECT b1.parent_booking_id as booking_id, COUNT(*) as used_count
          FROM "bookings" b1
          INNER JOIN "tickets" t1 on t1.id = b1.ticket_id
          WHERE b1.status NOT IN ('${BookingStatus.Cancelled}', '${BookingStatus.SystemCancelled}') 
            AND b1.parent_booking_id IS NOT NULL 
            AND b1.checked_in_at IS NOT NULL
          GROUP BY b1.parent_booking_id
        ) usc ON "b"."id" = usc."booking_id"
      `;
      queryRevenueStatusClause = `
        AND t."payment_type" = 'Online'
        AND b.parent_booking_id IS NULL
        AND ( 
          (t.ticket_type IN ('${TicketType.Monthly}') AND usc.used_count IS NULL) 
          OR 
          (t.ticket_type NOT IN ('${TicketType.Monthly}') AND b.checked_in_at IS NULL) 
        )
      `;
    }
  }

  const selectBookingSQL = Prisma.sql([
    `
      SELECT count("b"."id") FROM "bookings" as "b" 
        INNER JOIN "tickets" as "t" ON "b"."ticket_id" = "t"."id"
        ${additionalJoinClause}
      WHERE  
        "b"."payment_status" IN ('${PaymentStatus.Completed}', '${PaymentStatus.Refunded}')
        ${tenantCode ? `AND "b"."tenant_code" = '${tenantCode}'` : ""}
        ${ticketId ? `AND "b"."ticket_id" = '${ticketId}'` : ""}
        ${queryRevenueStatusClause}
        ${fromDate ? `AND CASE WHEN "t"."payment_type" = 'Online' THEN "b"."date" ELSE "b"."checked_out_at" END >= '${toStartOfDayStr(fromDate)}'` : ""}
        ${toDate ? `AND CASE WHEN "t"."payment_type" = 'Online' THEN "b"."date" ELSE "b"."checked_out_at" END <= '${toEndOfDayStr(toDate)}'` : ""}
    `,
  ]);

  const [{ count }] = (await prisma.$queryRaw(selectBookingSQL)) as { count: number }[];

  res.status(200).json({ data: count });
});

export default handler;
