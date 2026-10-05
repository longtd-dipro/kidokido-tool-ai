import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import {
  ROLE,
  LONG_DATE_WITHOUT_SECOND,
  SHORT_DATE,
  SHORT_TIME,
} from "constants/common";
import { BOOKING_STATUS_OPTIONS } from "constants/booking";
import { SETTING_BOOKING_IN_ADVANCE_OPTIONS } from "constants/ticket";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import prisma from "utils/db";
import { handleWriteActivityLog } from "utils/server/activity-log";
import { ActivityType } from "models/enums";
import { generateAdminBookingFilters } from "pages/api/admin/bookings/index";
import { CSVHeader, generateCSV } from "utils/server/csv-export";
import {
  isOnlineMonthlyBooking,
  isOnlineTimesLimitBooking,
  isTimesLimitTicket,
  getShortBarCode,
} from "utils/booking";
import { ExportingBookingRole } from "models/common";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.STAFF]));

const SUPER_ADMIN_CSV_HEADERS: CSVHeader[] = [
  { label: "施設名", key: "tenantCode" },
  { label: "予約ID", key: "id" },
  { label: "バーコード下4桁", key: "shortBarCode" },
  { label: "パスの種類", key: "canBookInAdvance" },
  { label: "商品名", key: "ticketName" },
  { label: "お名前", key: "userName" },
  { label: "ステータス", key: "status" },
  { label: "おとな人数", key: "adultQuantity" },
  { label: "子ども人数", key: "childQuantity" },
  // { label: "店舗ID", key: "tenantCode" },
  // { label: "電話番号", key: "userPhone" },
  // { label: "メールアドレス", key: "userEmail" },
  { label: "予約完了時間", key: "createdAt" },
  { label: "利用日", key: "date" },
  { label: "入場時間", key: "checkedInAt" },
  // { label: "決済方法", key: "paymentType" },
  { label: "LINEユーザーID", key: "lineUserId" },
];

const ADMIN_CSV_HEADERS: CSVHeader[] = [
  { label: "お名前", key: "userName" },
  { label: "予約ID", key: "id" },
  { label: "バーコード下4桁", key: "shortBarCode" },
  { label: "パスの種類", key: "canBookInAdvance" },
  { label: "商品名", key: "ticketName" },
  { label: "ステータス", key: "status" },
  { label: "おとな人数", key: "adultQuantity" },
  { label: "子ども人数", key: "childQuantity" },
  // { label: "店舗ID", key: "tenantCode" },
  // { label: "電話番号", key: "userPhone" },
  // { label: "メールアドレス", key: "userEmail" },
  { label: "予約完了時間", key: "createdAt" },
  { label: "利用日", key: "date" },
  { label: "入場時間", key: "checkedInAt" },
  // { label: "決済方法", key: "paymentType" },
];

const STAFF_CSV_HEADERS: CSVHeader[] = [
  { label: "予約ID", key: "id" },
  { label: "バーコード下4桁", key: "shortBarCode" },
  { label: "パスの種類", key: "canBookInAdvance" },
  { label: "商品名", key: "ticketName" },
  { label: "ステータス", key: "status" },
  { label: "おとな人数", key: "adultQuantity" },
  { label: "子ども人数", key: "childQuantity" },
  // { label: "店舗ID", key: "tenantCode" },
  { label: "予約完了時間", key: "createdAt" },
  { label: "利用日", key: "date" },
  { label: "入場時間", key: "checkedInAt" },
  // { label: "決済方法", key: "paymentType" },
];

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { user } = req;
  const filters = generateAdminBookingFilters(req);
  const fromAction = ActivityType.DownloadBooking;
  const exportingRole = req.query.exportingRole as ExportingBookingRole;

  fromAction && (await handleWriteActivityLog(req.query, user, fromAction));

  const bookings = await prisma.booking.findMany({
    where: {
      AND: filters,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      Ticket: true,
      User: {
        select: {
          name: true,
          lineUserId: true,
        },
      },
      Tenant: {
        select: {
          name: true,
        },
      },
    },
  });

  // Determine export role

  // Choose headers based on role
  let headers: CSVHeader[] = [];
  if (exportingRole === ExportingBookingRole.SUPER_ADMIN) {
    headers = SUPER_ADMIN_CSV_HEADERS;
  } else if (exportingRole === ExportingBookingRole.STAFF) {
    headers = STAFF_CSV_HEADERS;
  } else {
    headers = ADMIN_CSV_HEADERS;
  }

  // Transform data for CSV matching defined header keys
  const transformedBookings = bookings.map((row) => {
    const canBookInAdvance =
      row?.Ticket?.canBookInAdvance && !isTimesLimitTicket(row?.Ticket?.type);

    return {
      userName: row?.User?.name || "",
      lineUserId: row?.User?.lineUserId || "",
      id: row.id,
      shortBarCode:
        isOnlineMonthlyBooking(row as any) ||
          isOnlineTimesLimitBooking(row as any)
          ? ""
          : getShortBarCode(row.barCode),
      canBookInAdvance:
        SETTING_BOOKING_IN_ADVANCE_OPTIONS.find(
          ({ value }) => value === canBookInAdvance,
        )?.label || "",
      ticketName: row?.Ticket?.name || "",
      status:
        BOOKING_STATUS_OPTIONS.find((o) => o.value === row?.status)?.label ||
        row?.status ||
        "",
      adultQuantity: row.adultQuantity,
      childQuantity: row.childQuantity,
      tenantCode: row.tenantCode || "",
      // userPhone: row?.User?.phone || "",
      // userEmail: row?.User?.email || "",
      createdAt: moment(row?.createdAt).format(LONG_DATE_WITHOUT_SECOND),
      date: moment(row?.date).format(SHORT_DATE),
      checkedInAt: !row.checkedInAt
        ? ""
        : moment(row?.firstCheckedInAt || row?.checkedInAt).format(SHORT_TIME),
      // paymentType:
      //   row?.Ticket?.paymentType === "Online" ? "カード決済" : "店舗決済",
    };
  });

  const csvContent = generateCSV(transformedBookings, headers);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=\"data.csv\"");
  res.status(200).send(csvContent);
});

export default handler;
