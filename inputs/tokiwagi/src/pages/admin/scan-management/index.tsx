import { IconButton, TextField, Tooltip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { BookingStatus, Tenant } from "@prisma/client";
import moment from "moment";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import AdminDeleteBookingDialog from "components/AdminCancelBookingDialog";
import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import AdminLayout from "components/common/AdminLayout";
import AdminButton from "components/common/Buttons/AdminButton";
import IndependencePagination from "components/common/DataGridPagination/IndependencePagination";
import Error from "components/common/Error";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import DatePickerField from "components/common/Fields/DatePickerField";
import TextInputField from "components/common/Fields/TextInputField";
import WarningDialog from "components/common/WarningDialog";
import {
  BOOKING_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "constants/booking";
import {
  JP_SHORT_DATE,
  LONG_DATE_WITHOUT_SECOND,
  ROLE,
  SHORT_DATE,
} from "constants/common";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { useCachedPagination } from "libs/hooks/useCachedPagination";
import { Booking, Ticket } from "models/Entity";
import {
  countBookings,
  fetchBookings,
} from "services/api-client/admin/booking.service";
import { fetchTenants } from "services/api-client/admin/tenant.service";
import { fetchTickets } from "services/api-client/ticket.service";
import EyeIconImage from "statics/images/eye.svg";
import { formatStayDurationTime } from "utils/date-time";
import { getBookingStayDuration } from "utils/booking";
import { getMessageFromError } from "utils/common";
import AdminChangePaymentStatusDialog from "components/AdminChangePaymentStatusDialog";
import { formatCurrency } from "utils/number";
import { Coupon } from "models/Booking";
import { withEnabledSmaregi } from "libs/hoc/withEnabledSmaregi";
import { getTotalPosBookingAmount } from "utils/client/booking";

type FormData = {
  tenantCode?: string;
  ticketId?: string;
  status?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  shortBarCode?: string;
};

const FILTERED_BOOKING_STATUS_OPTIONS = BOOKING_STATUS_OPTIONS.filter(
  (o) =>
    o.value !== BookingStatus.Cancelled &&
    o.value !== BookingStatus.SystemCancelled,
);

function ScanManagement() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const isSuperAdmin = session?.user?.role === ROLE.SUPER_ADMIN;

  const pagination = useCachedPagination({ onPageChange: () => fetchData() });

  const today = moment().utc(true).format(SHORT_DATE);

  const { handleSubmit, control, reset, watch } = useForm<FormData>({
    defaultValues: { startDate: today, endDate: today },
  });

  const [startDate, endDate, tenantCode] = watch([
    "startDate",
    "endDate",
    "tenantCode",
  ]);
  const isDisableTicketSelector = isSuperAdmin && !tenantCode;

  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>();
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();
  const [filters, setFilters] = useState<FormData>({
    startDate: today,
    endDate: today,
  });

  const [deletingBooking, setDeletingBooking] = useState<Booking>();
  const [isShowRequireReloadErrorDialog, setIsShowRequireReloadErrorDialog] =
    useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] =
    useState<Booking>();
  // Effects
  useEffect(() => {
    fetchTicketList(session?.user?.tenantCode);
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated" && isSuperAdmin) fetchTenantList();
  }, [authStatus]);

  useEffect(() => {
    fetchTotalDataCount();
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.itemsPerPage, filters]);

  // API calls
  const fetchTenantList = async () => {
    try {
      setTenants(await fetchTenants());
    } catch (e) {
      setErrMsg(getMessageFromError(e));
    }
  };

  const fetchTicketList = async (tenantCode?: string) => {
    try {
      setTickets(await fetchTickets({ tenantCode }));
    } catch (e) {
      setErrMsg(getMessageFromError(e));
    }
  };

  const fetchTotalDataCount = async () => {
    try {
      setLoading(true);
      const count = await countBookings({
        ...filters,
        status: filters?.status
          ? ([filters.status] as BookingStatus[])
          : undefined,
      });
      setTotalBookings(count);
    } catch (e) {
      setErrMsg(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);
      const params = buildParams();
      const data = await fetchBookings(params);
      setBookings(data.bookings);
    } catch (e) {
      setErrMsg(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const buildParams = () => ({
    limit: pagination.itemsPerPage,
    page: pagination.page,
    ...filters,
    status: filters?.status
      ? ([filters.status] as BookingStatus[])
      : FILTERED_BOOKING_STATUS_OPTIONS.map((o) => o.value),
  });

  // Handlers
  const onSubmit = (values: FormData) => {
    const nextFilters = {
      ...values,
      startDate: values.startDate
        ? moment(values.startDate).utc(true).format(SHORT_DATE)
        : null,
      endDate: values.endDate
        ? moment(values.endDate).utc(true).format(SHORT_DATE)
        : null,
    };
    setFilters(nextFilters);
    pagination.setPage(1);
  };

  const handleReset = () => {
    reset({
      startDate: today,
      endDate: today,
      ticketId: null,
      tenantCode: null,
      status: null,
      shortBarCode: "",
    });
    setFilters({ startDate: today, endDate: today });
    pagination.setPage(1);
  };

  const redirectDetail = (booking: Booking) =>
    router.push(`${ROUTE.BOOKING_MANAGEMENT_DETAILS}/${booking.id}`);

  const onButtonChangePaymentStatusClicked = (booking: Booking) => {
    setSelectedBookingForPayment(booking);
  };
  // ─── Column Definitions ──────────────────────────────────────────────

  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "アクション",
    width: 220,
    align: "center",
    headerAlign: "center",
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const booking = params.row as Booking;
      return (
        <div className="flex items-center gap-1">
          <IconButton size="small" onClick={() => redirectDetail(booking)}>
            <Image src={EyeIconImage} alt="detail" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => onButtonChangePaymentStatusClicked(booking)}
            disabled={booking.status !== BookingStatus.CheckedOut}
            className={
              booking.status !== BookingStatus.CheckedOut ? "opacity-30" : ""
            }
          >
            <span className="text-[12px] ad-text-color">支払状況変更</span>
          </IconButton>
        </div>
      );
    },
  };

  const indexColumn: GridColDef = {
    field: "index",
    headerName: "No",
    headerAlign: "center",
    align: "center",
    width: 64,
    sortable: false,
    filterable: false,
    valueGetter: (params) =>
      params.api.getRowIndex(params.id) +
      1 +
      (pagination.page - 1) * pagination.itemsPerPage,
  };

  const bookingIdColumn: GridColDef = {
    field: "bookingId",
    headerName: "予約ID",
    width: 100,
    sortable: false,
    filterable: false,
    valueGetter: (params) => params.row.id,
  };

  const ticketNameColumn: GridColDef = {
    field: "ticketName",
    headerName: "商品名",
    width: 260,
    sortable: false,
    filterable: false,
    valueGetter: (params) => params.row.Ticket?.name,
  };

  const tenantNameColumn: GridColDef = {
    field: "tenantName",
    headerName: "施設名",
    width: 150,
    sortable: false,
    filterable: false,
    valueGetter: (params) =>
      tenants?.find((t) => t.code === params.row.tenantCode)?.name,
  };

  const statusColumn: GridColDef = {
    field: "status",
    headerName: "予約状態",
    width: 240,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const booking = params.row as Booking;
      return BOOKING_STATUS_OPTIONS.find(
        (option) => option.value === booking.status,
      )?.label;
    },
  };

  const totalAmountColumn: GridColDef = {
    field: "totalAmount",
    headerName: "システムの合計金額",
    width: 200,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const booking = params.row as Booking;
      return formatCurrency(Number(booking.totalAmount) || 0);
    },
  };

  const posTotalAmountColumn: GridColDef = {
    field: "posTotalAmount",
    headerName: "POS側の最終精算金額",
    width: 200,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const booking = params.row as Booking & {Ticket: Ticket};
      return getTotalPosBookingAmount(booking);
    },
  };

  const couponsColumn: GridColDef = {
    field: "coupons",
    headerName: "クーポン名", // coupon name
    sortable: false,
    width: 200,
    valueGetter: (params) => {
      if (!params.row.coupons) {
        return [];
      }

      const coupons = Object.values(params.row.coupons) as Coupon[];
      return coupons
        .filter((coupon) => Boolean(Number(coupon.discountAmount)))
        .map((coupon) => coupon.name || coupon.code);
    },
    renderCell: function (params) {
      const couponCodes = params.value;
      const couponNames = couponCodes?.length
        ? couponCodes.map((couponCode, index) =>
          index !== 0 ? `, ${couponCode}` : couponCode,
        )
        : " ";

      return (
        <Tooltip title={couponNames}>
          <span className="truncate-cell">{couponNames}</span>
        </Tooltip>
      );
    },
  };

  const couponDiscountAmountColumn: GridColDef = {
    field: "couponDiscountAmount",
    headerName: "クーポン金額",
    width: 120,
    sortable: false,
    filterable: false,
    valueGetter: (params) => {
      if (!params.row.coupons) {
        return 0;
      }

      const coupons = Object.values(params.row.coupons) as Coupon[];
      return coupons
        .filter((coupon) => Boolean(Number(coupon.discountAmount)))
        .reduce((acc, coupon) => acc + Number(coupon.discountAmount), 0);
    },
    renderCell: (params) => {
      const couponValue = params.value;
      return couponValue ? formatCurrency(Number(couponValue)) : "";
    },
  };

  const paymentStatusColumn: GridColDef = {
    field: "paymentStatus",
    headerName: "支払状況",
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const booking = params.row as Booking;
      return PAYMENT_STATUS_OPTIONS.find(
        (option) => option.value === booking.paymentStatus,
      )?.label;
    },
  };

  const checkedInAtColumn: GridColDef = {
    field: "checkedInAt",
    headerName: "入場時間",
    width: 180,
    sortable: false,
    filterable: false,
    valueGetter: (params) => {
      const t = params.row.firstCheckedInAt || params.row.checkedInAt;
      return t ? moment(t).format(LONG_DATE_WITHOUT_SECOND) : null;
    },
  };

  const checkedOutAtColumn: GridColDef = {
    field: "checkedOutAt",
    headerName: "退場時間",
    width: 180,
    sortable: false,
    filterable: false,
    valueGetter: (params) => {
      const t = params.row.partialCheckedOutAt || params.row.checkedOutAt;
      return t ? moment(t).format(LONG_DATE_WITHOUT_SECOND) : null;
    },
  };

  const stayDurationColumn: GridColDef = {
    field: "stayDuration",
    headerName: "滞在時間",
    width: 240,
    sortable: false,
    filterable: false,
    valueGetter: (params) => {
      const booking = params.row as Booking;
      if (booking.status === BookingStatus.CheckedIn) return null;
      return booking.stayDuration
        ? formatStayDurationTime(booking.stayDuration)
        : getBookingStayDuration(booking);
    },
  };

  const columns: GridColDef[] = [
    actionColumn,
    indexColumn,
    bookingIdColumn,
    ticketNameColumn,
    ...(isSuperAdmin ? [tenantNameColumn] : []),
    statusColumn,
    totalAmountColumn,
    posTotalAmountColumn,
    couponsColumn,
    couponDiscountAmountColumn,
    paymentStatusColumn,
    checkedInAtColumn,
    checkedOutAtColumn,
    stayDurationColumn,
  ];

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <section className="relative text-gray-600 body-font">
        <Error message={errMsg} />

        {/* Filters */}
        <div className="py-6 my-6 ad-section-container">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              className={`grid gap-8 px-24 md:px-8 ${isSuperAdmin ? "grid-cols-4" : "grid-cols-3"}`}
            >
              {isSuperAdmin && (
                <div className="relative mb-4">
                  <label className="block mb-2 label">施設名</label>
                  <AutocompleteField
                    name="tenantCode"
                    defaultValue={null}
                    className="block w-full !border-0 ad-input-field"
                    control={control}
                    options={tenants?.map((t) => t.code) || []}
                    getOptionLabel={(code) =>
                      tenants?.find((t) => t.code === code)?.name || ""
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="施設を選択"
                        className="block w-full ad-input-field"
                        inputProps={{ ...params.inputProps, readOnly: true }}
                      />
                    )}
                    handleChange={(code) => {
                      fetchTicketList(code);
                    }}
                  />
                </div>
              )}

              {/* 商品名 */}
              <div className="relative mb-4">
                <label className="block mb-2 label">商品名</label>
                <AutocompleteField
                  disablePortal
                  name="ticketId"
                  defaultValue={null}
                  control={control}
                  options={tickets?.map((t) => t.id) || []}
                  getOptionLabel={(id) =>
                    tickets?.find((t) => t.id === id)?.name || `${id}`
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      className="ad-input-field"
                      placeholder="ワンデーパス"
                      inputProps={{ ...params.inputProps, readOnly: true }}
                    />
                  )}
                  disabled={isDisableTicketSelector}
                />
              </div>

              {/* ステータス */}
              <div className="relative mb-4">
                <label className="block mb-2 label">ステータス</label>
                <AutocompleteField
                  name="status"
                  defaultValue={null}
                  control={control}
                  options={FILTERED_BOOKING_STATUS_OPTIONS.map((o) => o.value)}
                  getOptionLabel={(v) =>
                    BOOKING_STATUS_OPTIONS.find((o) => o.value === v)?.label ||
                    v
                  }
                  disablePortal
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      className="ad-input-field"
                      placeholder="入場中"
                      inputProps={{ ...params.inputProps, readOnly: true }}
                    />
                  )}
                />
              </div>

              {/* バーコード下4桁 */}
              <div className="relative mb-4">
                <label className="block mb-2 label">バーコード下4桁</label>
                <TextInputField
                  name="shortBarCode"
                  control={control}
                  className="w-full px-3 py-1 ad-input-field"
                  placeholder="0123"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 px-24 md:px-8">
              {/* 開始期間 */}
              <div className="relative mb-4">
                <label className="block mb-2 label">開始期間</label>
                <DatePickerField
                  name="startDate"
                  control={control}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      className="flex justify-between block w-full ad-input-field"
                    />
                  )}
                  maxDate={endDate ? moment(endDate) : undefined}
                />
              </div>

              {/* 終了期間 */}
              <div className="relative mb-4">
                <label className="block mb-2 label">終了期間</label>
                <DatePickerField
                  name="endDate"
                  control={control}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      className="flex justify-between block w-full ad-input-field"
                    />
                  )}
                  minDate={startDate ? moment(startDate) : undefined}
                />
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <div className="flex gap-8 md:gap-[22px]">
                <AdminButton
                  variant="outlined"
                  onClick={handleReset}
                  className="w-[230px] h-[56px] md:h-[36px] md:w-[150px]"
                >
                  <span className="font-bold">リセット</span>
                </AdminButton>
                <AdminButton
                  variant="contained"
                  type="submit"
                  className="w-[230px] h-[56px] md:h-[36px] md:w-[150px]"
                >
                  <span className="font-bold">検索する</span>
                </AdminButton>
              </div>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="mb-12 ad-section-container ad-table-wrapper md:mb-0">
          <p className="px-6 py-6">{moment().format(JP_SHORT_DATE)}</p>
          <DataGrid
            components={{
              LoadingOverlay: LoadingSpinner,
              NoRowsOverlay: () => null,
            }}
            loading={loading}
            hideFooterSelectedRowCount
            autoHeight
            rows={bookings}
            getRowId={(row) => row.id}
            columns={columns}
            scrollbarSize={5}
            hideFooterPagination
            hideFooter
            disableColumnFilter
            disableColumnMenu
          />
        </div>

        <div className="md:p-[10px] md:bg-white">
          <IndependencePagination
            page={pagination.page}
            defaultPageSize={pagination.itemsPerPage}
            rowCount={totalBookings}
            onChange={(newPage, pageSize) => {
              if (newPage !== pagination.page) pagination.setPage(newPage);
              if (pageSize !== pagination.itemsPerPage)
                pagination.setItemsPerPage(pageSize);
            }}
          />
        </div>

        {/* Delete Dialog */}
        {deletingBooking && (
          <AdminDeleteBookingDialog
            booking={deletingBooking}
            onDismiss={() => setDeletingBooking(null)}
            onSuccess={() => fetchData()}
            onError={(err) => setErrMsg(err)}
          />
        )}

        {/* Require Reload Error */}
        {isShowRequireReloadErrorDialog && (
          <WarningDialog
            hideDismissButton
            text="OK"
            message="すでにシステムによる自動キャンセルされたため変更ができません。新規予約にてご利用ください。"
            onAccept={() => router.reload()}
            onDismiss={() => setIsShowRequireReloadErrorDialog(false)}
          />
        )}

        {/* Change Payment Status Dialog */}
        {selectedBookingForPayment && (
          <AdminChangePaymentStatusDialog
            booking={selectedBookingForPayment}
            onDismiss={() => setSelectedBookingForPayment(undefined)}
            onSuccess={() => {
              setSelectedBookingForPayment(undefined);
              fetchData();
            }}
          />
        )}
      </section>
    </AdminLayout>
  );
}

export default withEnabledSmaregi(
  withAuthentication(ScanManagement, [
    ROLE.ADMIN,
    ROLE.SUPER_ADMIN,
    ROLE.STAFF,
  ]),
);
