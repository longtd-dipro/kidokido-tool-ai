import { GridColDef } from "@mui/x-data-grid";
import moment from "moment";
import { PaymentType } from "@prisma/client";

import { LONG_DATE_WITHOUT_SECOND, SHORT_DATE, SHORT_TIME } from "constants/common";
import { getIncludedProvinceAddress, getUserAllowedNewsletterLabel, getUserGenderLabel } from "utils/user";
import { getShortBarCode, isOnlineMonthlyBooking, isOnlineTimesLimitBooking, isTimesLimitTicket } from "utils/booking";
import { SETTING_BOOKING_IN_ADVANCE_OPTIONS } from "constants/ticket";
import { formatDate } from "utils/date-time";

export const USER_COLUMNS: GridColDef[] = [
  {
    field: "id",
    headerName: "会員番号",
    sortable: false,
    width: 142,
    valueGetter: (params) => params.row?.id,
  },
  {
    field: "name",
    headerName: "お名前",
    sortable: false,
    width: 230,
    valueGetter: (params) => params.row?.name,
  },
  {
    field: "gender",
    headerName: "性別",
    sortable: false,
    width: 142,
    valueGetter: (params) => getUserGenderLabel(params.row.gender),
  },
  {
    field: "email",
    headerName: "メールアドレス",
    sortable: false,
    width: 250,
    valueGetter: (params) => params.row?.email,
  },
  {
    field: "address",
    headerName: "住所",
    sortable: false,
    width: 230,
    valueGetter: (params) => {
      const user = params.row;
      return getIncludedProvinceAddress(user);
    },
  },
  {
    field: "phone",
    headerName: "電話番号",
    sortable: false,
    width: 230,
    valueGetter: (params) => params.row?.phone,
  },
  {
    field: "updatedAt",
    headerName: "ユーザー情報最終更新日",
    sortable: false,
    width: 230,
    valueGetter: (params) => formatDate(params.row?.updatedAt),
  },
  {
    field: "createdAt",
    headerName: "登録日",
    sortable: false,
    width: 230,
    valueGetter: (params) => formatDate(params.row?.createdAt),
  },
  {
    field: "allowedNewsletter",
    headerName: "ボーネルンドからの情報",
    sortable: false,
    width: 200,
    valueGetter: (params) => getUserAllowedNewsletterLabel(params.row.allowedNewsletter),
  },
];

export const USER_COLUMNS_FOR_STAFF = USER_COLUMNS.filter((column) => ["id", "name", "email", "createdAt"].includes(column.field)).map((column) => {
  if (column.field === "name") {
    return { ...column, valueGetter: (params) => params.row?.lastName };
  }
  return column;
});

export const USER_CHECKED_OUT_INFO_CSV_COLUMNS: GridColDef[] = [
  {
    field: "checkedOutCount",
    headerName: "利用回数"
  },
  {
    field: "lastCheckedOut",
    headerName: "最後利用日",
    valueGetter: (params) => formatDate(params.row?.lastCheckedOut),
  },
  {
    field: "lineUserId",
    headerName: "LINEユーザーID",
    valueGetter: (params) => params.row?.lineUserId,
  }
];

export const BOOKING_COLUMNS_PART1: GridColDef[] = [
  {
    field: "id",
    headerName: "予約ID",
    width: 142,
    sortable: false,
    filterable: false,
  },
  {
    field: "shortBarCode",
    headerName: "バーコード下4桁",
    width: 172,
    sortable: false,
    filterable: false,
    valueGetter: (params) => {
      const booking = params.row;
      return isOnlineMonthlyBooking(booking) || isOnlineTimesLimitBooking(booking) ? "" : getShortBarCode(booking.barCode);
    },
  },
  {
    field: "canBookInAdvance",
    headerName: "パスの種類",
    width: 172,
    sortable: false,
    filterable: false,
    valueGetter: (params) => {
      const canBookInAdvance = params.row?.Ticket?.canBookInAdvance && !isTimesLimitTicket(params.row?.Ticket?.type);
      return SETTING_BOOKING_IN_ADVANCE_OPTIONS.find(({ value }) => value === canBookInAdvance).label;
    },
  },
  {
    field: "ticketName",
    headerName: "商品名",
    cellClassName: "wrap-cell",
    width: 250,
    sortable: false,
    filterable: false,
    valueGetter: (params) => params.row?.Ticket?.name,
  },
];

export const BOOKING_COLUMNS_PART2: GridColDef[] = [
  {
    field: "adultQuantity",
    sortable: false,
    headerName: "おとな人数",
    width: 150,
  },
  {
    field: "childQuantity",
    sortable: false,
    headerName: "子ども人数",
    width: 150,
  },
  {
    field: "tenantCode",
    sortable: false,
    headerName: "店舗ID", // Tenant ID
    width: 150,
  },
  {
    field: "userPhone",
    headerName: "電話番号",
    width: 192,
    sortable: false,
    filterable: false,
    valueGetter: (params) => params.row?.User?.phone,
  },
  {
    field: "userEmail",
    headerName: "メールアドレス",
    width: 250,
    sortable: false,
    filterable: false,
    valueGetter: (params) => params.row?.User?.email,
  },
  {
    field: "createdAt",
    headerName: "予約完了時間",
    width: 192,
    sortable: false,
    filterable: false,
    valueGetter: (params) => moment(params.row?.createdAt).format(LONG_DATE_WITHOUT_SECOND),
  },
  {
    field: "date",
    headerName: "利用日",
    width: 150,
    sortable: false,
    filterable: false,
    valueGetter: (params) => moment(params.row?.date).format(SHORT_DATE),
  },
  {
    field: "checkedInAt",
    sortable: false,
    headerName: "入場時間",
    width: 142,
    valueGetter: (params) => {
      if (!params.row.checkedInAt) {
        return null;
      }
      return moment(params.row?.firstCheckedInAt || params.row?.checkedInAt).format(SHORT_TIME);
    },
  },
  {
    field: "paymentType",
    headerName: "決済方法",
    width: 192,
    sortable: false,
    filterable: false,
    valueGetter: (params) => (params.row?.Ticket.paymentType === PaymentType.Online ? "カード決済" : "店舗決済"),
  },
];

export const BOOKING_COLUMNS_PART2_FOR_STAFF = BOOKING_COLUMNS_PART2.filter((column) => !["userPhone", "userEmail"].includes(column.field));
