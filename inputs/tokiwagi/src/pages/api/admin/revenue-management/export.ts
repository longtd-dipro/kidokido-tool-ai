import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import {
  BookingStatus,
  PaymentStatus,
  PaymentType,
} from "@prisma/client";

import {
  ROLE,
  LONG_DATE_WITHOUT_SECOND,
  SHORT_DATE,
} from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import {
  isSameDay,
  isSameTime,
  formatStayDurationTime,
} from "utils/date-time";
import { ActivityType, RevenueStatus } from "models/enums";
import { handleWriteActivityLog } from "utils/server/activity-log";
import {
  isOnlineMonthlyBooking,
  isOnlineTimesLimitBooking,
  getShortBarCode,
  getBookingStayDuration,
  isHourlyTimesLimitTicket,
  isTimesLimitTicket,
} from "utils/booking";
import { ExportingRevenueRole, CsvHeader } from "models/common";
import { formatCurrency, formatCurrencyStrictMode } from "utils/number";
import { formatThousands } from "utils/common";
import { CSVHeader, generateCSV } from "utils/server/csv-export";
import { getRevenueBookings } from "utils/server/revenue-management";
import { getChildAgeStatistic } from "utils/booking-child-age-info";
import { getPaymentTypeLabel } from "utils/ticket";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

export const CHILD_AGE_HEADERS = [
  { label: "6ヶ月", key: "6" },
  { label: "7ヶ月", key: "7" },
  { label: "8ヶ月", key: "8" },
  { label: "9ヶ月", key: "9" },
  { label: "10ヶ月", key: "10" },
  { label: "11ヶ月", key: "11" },
  { label: "1歳", key: "12" },
  { label: "2歳", key: "24" },
  { label: "3歳", key: "36" },
  { label: "4歳", key: "48" },
  { label: "5歳", key: "60" },
  { label: "6歳", key: "72" },
  { label: "7歳", key: "84" },
  { label: "8歳", key: "96" },
  { label: "9歳", key: "108" },
  { label: "10歳", key: "120" },
  { label: "11歳", key: "132" },
  { label: "12歳", key: "144" },
];

const GUEST_REVENUE_HEADERS: CsvHeader[] = [{ label: "No", key: "index" }];

const STAFF_REVENUE_HEADERS: CsvHeader[] = [
  ...GUEST_REVENUE_HEADERS,
  { label: "会員番号", key: "userId" },
  { label: "店舗ID", key: "tenantCode" },
  { label: "予約ID", key: "id" },
  { label: "バーコード下4桁", key: "shortBarCode" },
  //   { label: "お名前", key: "name" },
  { label: "おとな利用人数", key: "adultQuantity" },
  { label: "子ども利用人数", key: "childQuantity" },
  // { label: "事前予約", key: "isBooked" },
  // { label: "当日利用", key: "isUseDuringTheDay" },
  { label: "キャンセル返金", key: "refundedAt" },
  { label: "商品名", key: "productName" },
  { label: "支払方法", key: "paymentMethod" },
  { label: "決済金額", key: "totalAmount" },
  //   { label: "決済ID", key: "GMOTransactionId" },
  { label: "POS側の最終精算金額", key: "postPaymentAmount" },
  { label: "クーポン名", key: "coupons" },
  { label: "再入場回数", key: "reCheckInCount" },
  { label: "フリーパス", key: "isFirstTimeUsingMonthlyTicket" },
  { label: "初回利用日", key: "isFirstCheckedOutBooking" },
  { label: "入場時間", key: "checkedInAt" },
  { label: "退場時間", key: "checkedOutAt" },
  { label: "滞在時間", key: "stayDuration" },
  { label: "購入日", key: "purchaseDate" },
  { label: "初回利用予定日", key: "date" },
  { label: "利用回数", key: "usageInfo" },
  ...CHILD_AGE_HEADERS,
];

const ADMIN_REVENUE_HEADERS: CsvHeader[] = [
  ...GUEST_REVENUE_HEADERS,
  { label: "会員番号", key: "userId" },
  { label: "店舗ID", key: "tenantCode" },
  { label: "予約ID", key: "id" },
  { label: "バーコード下4桁", key: "shortBarCode" },
  { label: "お名前", key: "name" },
  { label: "おとな利用人数", key: "adultQuantity" },
  { label: "子ども利用人数", key: "childQuantity" },
  // { label: "事前予約", key: "isBooked" },
  // { label: "当日利用", key: "isUseDuringTheDay" },
  { label: "キャンセル返金", key: "refundedAt" },
  { label: "商品名", key: "productName" },
  { label: "支払方法", key: "paymentMethod" },
  { label: "決済金額", key: "totalAmount" },
  { label: "決済ID", key: "GMOTransactionId" },
  { label: "POS側の最終精算金額", key: "postPaymentAmount" },
  { label: "クーポン名", key: "coupons" },
  { label: "再入場回数", key: "reCheckInCount" },
  { label: "フリーパス", key: "isFirstTimeUsingMonthlyTicket" },
  { label: "初回利用日", key: "isFirstCheckedOutBooking" },
  { label: "入場時間", key: "checkedInAt" },
  { label: "退場時間", key: "checkedOutAt" },
  { label: "滞在時間", key: "stayDuration" },
  { label: "購入日", key: "purchaseDate" },
  { label: "初回利用予定日", key: "date" },
  { label: "利用回数", key: "usageInfo" },
  ...CHILD_AGE_HEADERS,
  { label: "LINEユーザーID", key: "lineUserId" },
];

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const tenantCode = req.query.tenantCode as string;
  if (req.user.tenantCode && tenantCode && req.user.tenantCode !== tenantCode) {
    return res.status(403).json({ error: "ADMIN_NOT_BELONG_TO_THIS_TENANT" });
  }

  const ticketId = req.query.ticketId ? +req.query.ticketId : undefined;
  const revenueStatus = req.query.revenueStatus as RevenueStatus;
  const fromDate = req.query.fromDate as string;
  const toDate = (req.query.endDate as string) || new Date();
  const fromAction =
    (req.query.fromAction as ActivityType) || ActivityType.DownloadRevenue;
  const exportingRole = req.query.exportingRole as ExportingRevenueRole;
  const page = +req.query.page;
  const limit = +req.query.limit || 100000;
  const skip = (page - 1) * limit;
  fromAction && (await handleWriteActivityLog(req.query, req.user, fromAction));

  const bookings = await getRevenueBookings({
    tenantCode,
    ticketId,
    revenueStatus,
    fromDate,
    toDate,
    limit,
    skip,
  });

  // Choose headers
  let headers: CSVHeader[] = ADMIN_REVENUE_HEADERS;
  if (exportingRole === ExportingRevenueRole.GUEST) {
    headers = GUEST_REVENUE_HEADERS;
  } else if (exportingRole === ExportingRevenueRole.STAFF) {
    headers = STAFF_REVENUE_HEADERS;
  } else {
    headers = ADMIN_REVENUE_HEADERS;
  }

  // Transform data
  const transformedData = bookings.map((row, idx) => {
    const ticket = row.Ticket;
    const totalAmountValue = Number(row.totalAmount) || 0;

    // shortBarCode
    const shortBarCode =
      isOnlineMonthlyBooking(row as any) ||
        isOnlineTimesLimitBooking(row as any)
        ? ""
        : getShortBarCode(row.barCode);

    // isBooked
    // const isBooked = isOnlineBooking(row as any);

    // isUseDuringTheDay
    // const isUseDuringTheDay = isInDayBooking(row as any);

    // refundedAt
    const isRefunded = row.paymentStatus === PaymentStatus.Refunded;
    const refundedAt =
      isRefunded && row.cancelledAt
        ? moment(row.cancelledAt).format(LONG_DATE_WITHOUT_SECOND)
        : "";

    // revenue status (hasReCheckInOrNot)
    let hasReCheckInOrNot = "";
    if (row.checkedInAt) {
      const isSameTimeBetweenFirstAndCurrentOfCheckedInTime =
        isSameTime(row.checkedInAt, row.firstCheckedInAt) &&
        isSameDay(row.checkedInAt, row.firstCheckedInAt);
      const isTheFirstCheckedIn =
        !row.firstCheckedInAt ||
        isSameTimeBetweenFirstAndCurrentOfCheckedInTime;
      hasReCheckInOrNot = isTheFirstCheckedIn ? "初回入場" : "再入場";
    }

    // stay duration
    let stayDuration = "";
    if (row.status !== BookingStatus.CheckedIn) {
      stayDuration = row.stayDuration
        ? formatStayDurationTime(row.stayDuration)
        : getBookingStayDuration(row as any);
    }

    // formatted amounts
    let totalAmountLabel = formatCurrency(0);
    if (
      ticket &&
      ticket.paymentType === PaymentType.Online &&
      !row.parentBookingId
    ) {
      totalAmountLabel = formatCurrencyStrictMode(totalAmountValue);
    }

    let postPaymentAmountLabel = formatCurrency(0);
    if (row.parentBookingId) {
      if (isHourlyTimesLimitTicket(ticket as any)) {
        postPaymentAmountLabel = formatCurrencyStrictMode(totalAmountValue);
      }
    } else if (ticket && ticket.paymentType !== PaymentType.Online) {
      if (row?.posTotalAmount) {
        return formatCurrencyStrictMode(Number(row.posTotalAmount));
      }
      postPaymentAmountLabel = formatCurrencyStrictMode(totalAmountValue);
    }

    // coupons
    const couponsArray = row.coupons
      ? (Object.values(row.coupons) as any[])
      : [];
    const couponNames = couponsArray
      .filter((c) => Boolean(Number(c.discountAmount)))
      .map((c) => c.name || c.code)
      .join(", ");
    const totalCouponsDiscountAmount = couponsArray.reduce(
      (total, coupon) => +coupon.discountAmount + total,
      0,
    );

    let transformedBooking = {
      index: idx + 1,
      userId: row.userId || "",
      tenantCode: row.tenantCode || "",
      id: row.id,
      shortBarCode,
      name: row.User?.name || "",
      lineUserId: row.User?.lineUserId || "",
      adultQuantity: row.adultQuantity,
      childQuantity: row.childQuantity,
      // isBooked,
      // isUseDuringTheDay,
      refundedAt,
      productName: ticket?.name || "",
      paymentMethod: getPaymentTypeLabel(ticket),
      totalAmount: totalAmountLabel,
      GMOTransactionId: row.GMOTransactionId || "",
      postPaymentAmount: postPaymentAmountLabel,
      coupons: couponNames,
      totalCouponsDiscountAmount: totalCouponsDiscountAmount
        ? `¥${formatThousands(totalCouponsDiscountAmount)}`
        : "",
      hasReCheckInOrNot,
      reCheckInCount: row.reCheckInCount,
      isFirstTimeUsingMonthlyTicket: (
        row as unknown as { isFirstTimeUsingMonthlyTicket: boolean }
      ).isFirstTimeUsingMonthlyTicket
        ? "初回利用"
        : "",
      isFirstCheckedOutBooking:
        row.id === row.User?.firstCheckedOutBookingId,
      checkedInAt: row.checkedInAt
        ? moment(row.firstCheckedInAt || row.checkedInAt).format(
          LONG_DATE_WITHOUT_SECOND,
        )
        : "",
      checkedOutAt: row.checkedOutAt
        ? moment(row.partialCheckedOutAt || row.checkedOutAt).format(
          LONG_DATE_WITHOUT_SECOND,
        )
        : "",
      stayDuration,
      purchaseDate:
        isOnlineMonthlyBooking(row as any) ||
          isOnlineTimesLimitBooking(row as any)
          ? moment(row.createdAt).format(SHORT_DATE)
          : "",
      date:
        isOnlineMonthlyBooking(row as any) ||
          isOnlineTimesLimitBooking(row as any)
          ? moment(row.date).format(SHORT_DATE)
          : "",
      usageInfo: isTimesLimitTicket(ticket?.type)
        ? `${row.usageTimes || 0}/${(row as unknown as { totalTimes: number }).totalTimes || 0}`
        : "",
    };

    const childAgeStatistic = getChildAgeStatistic(row);
    childAgeStatistic.forEach(({ age, count }) => (transformedBooking[age] = count));

    return transformedBooking;
  });

  const csvContent = generateCSV(transformedData, headers);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=\"revenue_data.csv\"",
  );
  res.status(200).send(csvContent);
});

export default handler;
