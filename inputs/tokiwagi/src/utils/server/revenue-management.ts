import { BookingStatus, PaymentStatus, Prisma, TicketType } from "@prisma/client";
import { isEmpty } from "lodash";

import { RevenueStatus } from "models/enums";
import prisma from "utils/db";
import { toEndOfDayStr, toStartOfDayStr } from "utils/date-time";
import { splitArrayIntoChunks } from "utils/array";
import { MAX_LENGTH_OF_SUB_ITEM_TO_QUERY } from "constants/common";
import { augmentFirstTimeUsingMonthlyTicketPropForBookings } from "utils/server/booking";
import { populateTimesLimitBookingsUsageInfo } from "utils/booking";

export interface GetRevenueBookingsParams {
  tenantCode?: string;
  ticketId?: number;
  revenueStatus?: RevenueStatus;
  fromDate?: string;
  toDate?: string | Date;
  limit?: number;
  skip?: number;
}

export const getRevenueBookings = async (params: GetRevenueBookingsParams) => {
  const { tenantCode, ticketId, revenueStatus, fromDate, toDate, limit, skip } = params;

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
        AND "t"."payment_type" = 'Online'
        AND b.parent_booking_id IS NULL
        AND ( 
          (t.ticket_type IN ('${TicketType.Monthly}') AND usc.used_count IS NULL) 
          OR 
          (t.ticket_type NOT IN ('${TicketType.Monthly}') AND b.checked_in_at IS NULL) 
        )
      `;
    }
  }

  const paginationClause = limit !== undefined && skip !== undefined ? `LIMIT ${limit} OFFSET ${skip}` : "";

  // If payment_type is Online, get booking with "date" between fromDate and toDate.
  // If payment_type is Offline, get booking with "checked_out_at" between fromDate and toDate.
  const selectBookingSQL = Prisma.sql([
    `
      SELECT "b"."id" FROM "bookings" as "b" 
        INNER JOIN "tickets" as "t" ON "b"."ticket_id" = "t"."id"
        ${additionalJoinClause}
      WHERE  
        "b"."payment_status" IN ('${PaymentStatus.Completed}', '${PaymentStatus.Refunded}')
        ${tenantCode ? `AND "b"."tenant_code" = '${tenantCode}'` : ""}
        ${ticketId ? `AND "b"."ticket_id" = '${ticketId}'` : ""}
        ${queryRevenueStatusClause}
        ${fromDate ? `AND CASE WHEN "t"."payment_type" = 'Online' THEN "b"."date" ELSE "b"."checked_out_at" END >= '${toStartOfDayStr(fromDate)}'` : ""}
        ${toDate ? `AND CASE WHEN "t"."payment_type" = 'Online' THEN "b"."date" ELSE "b"."checked_out_at" END <= '${toEndOfDayStr(toDate)}'` : ""}
        ORDER BY "b"."id" DESC ${paginationClause}`,
  ]);

  const bookingsToSelect = (await prisma.$queryRaw(selectBookingSQL)) as { id: number }[];
  const bookingIds = bookingsToSelect.map((booking) => booking.id);

  let bookings = [] as any[];
  const listSubBookingIds = splitArrayIntoChunks(bookingIds, MAX_LENGTH_OF_SUB_ITEM_TO_QUERY);

  for (const subBookingIds of listSubBookingIds) {
    const subBookings = await prisma.booking.findMany({
      where: {
        id: {
          in: subBookingIds,
        },
      },
      include: {
        Ticket: {
          include: {
            TicketDetail: true,
          }
        },
        User: true,
        BookingChildAgeInfo: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    bookings.push(...subBookings);
  }

  await augmentFirstTimeUsingMonthlyTicketPropForBookings(bookings);
  bookings = await populateTimesLimitBookingsUsageInfo(prisma, bookings);

  return bookings;
};
