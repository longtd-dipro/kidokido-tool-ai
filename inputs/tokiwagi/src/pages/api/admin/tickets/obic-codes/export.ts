import ExcelJS from "exceljs";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

const COLUMNS: { header: string; key: string; width: number }[] = [
  { header: "JANコード", key: "janCode", width: 20 },
  { header: "商品コード", key: "obicCode", width: 20 },
  { header: "数量", key: "quantity", width: 10 },
  { header: "商品ランク区分", key: "productRank", width: 20 },
  { header: "備考", key: "remarks", width: 30 },
];

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { startDate, endDate, tenantCode } = req.query as { startDate?: string; endDate?: string; tenantCode?: string };

  const where: Prisma.BookingObicCodeWhereInput = {
    isPending: false,
    deleted: false,
    Booking: {
      paymentStatus: PaymentStatus.Completed,
      status: {
        notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled]
      }
    }
  };

  if (tenantCode) {
    where.Booking = { ...(where.Booking as Prisma.BookingWhereInput), tenantCode };
  }

  if (startDate) {
    where.computedAt = { ...(where.computedAt as Prisma.DateTimeFilter), gte: new Date(startDate) };
  }
  if (endDate) {
    where.computedAt = { ...(where.computedAt as Prisma.DateTimeFilter), lte: new Date(endDate) };
  }

  const rows = await prisma.bookingObicCode.findMany({
    where,
    select: {
      obicCode: true,
      quantity: true,
    },
  });

  const aggregated: Record<string, number> = {};
  for (const row of rows) {
    if (!row.obicCode) continue;
    aggregated[row.obicCode] = (aggregated[row.obicCode] ?? 0) + row.quantity;
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("OBICコード");

  sheet.columns = COLUMNS;

  for (const [obicCode, quantity] of Object.entries(aggregated)) {
    sheet.addRow({ janCode: "", obicCode, quantity, productRank: "", remarks: "" });
  }

  const filename = `obic_codes_${moment(startDate).format("YYYYMMDD")}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(Buffer.from(buffer));
});

export default handler;
