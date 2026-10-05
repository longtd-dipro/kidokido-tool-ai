import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { IconButton, TextField, Tooltip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { BookingStatus, PaymentStatus, PaymentType, Tenant } from "@prisma/client";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useDispatch } from "react-redux";
import { CircleOutlined } from "@mui/icons-material";
import { isMatch } from "lodash";

import EyeIconImage from "statics/images/eye.svg";
import Error from "components/common/Error";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import ViewRevenueDialog from "components/RevenueManagement/ViewRevenueDialog";
import { LONG_DATE_WITHOUT_SECOND, PAGE_SIZE, REVENUE_STATUS_OPTIONS, ROLE, ROWS_PER_PAGE_OPTIONS, SHORT_DATE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { Booking, Staff, Ticket, User } from "models/Entity";
import { fetchBookings, fetchRecordCount, fetchTickets } from "services/api-client/admin/revenue-management.service";
import { fetchTenants } from "services/api-client/admin/tenant.service";
import AdminLayout from "components/common/AdminLayout";
import AdminButton from "components/common/Buttons/AdminButton";
import DatePickerField from "components/common/Fields/DatePickerField";
import { confirmCredentials, confirmPassword } from "utils/ui";
import { formatCurrency, formatCurrencyStrictMode } from "utils/number";
import {
  getShortBarCode,
  getBookingStayDuration,
  isInDayBooking,
  isOnlineBooking,
  isOnlineMonthlyBooking,
  isOnlineTimesLimitBooking,
  isTimesLimitTicket,
} from "utils/booking";
import { Coupon } from "models/Booking";
import IndependencePagination from "components/common/DataGridPagination/IndependencePagination";
import { formatThousands, getMessageFromError } from "utils/common";
import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import { formatStayDurationTime, getDiffOfDates, isSameDay, isSameTime } from "utils/date-time";
import { MAX_DOWNLOAD_REVENUE_DAYS_FOR_ADMIN, MAX_DOWNLOAD_REVENUE_DAYS_FOR_SUPER_ADMIN, REVENUE_CSV_HEADERS } from "constants/csv";
import { ActionType, ActivityType, RevenueStatus } from "models/enums";
import { isStaff } from "utils/user";
import ErrorDialog from "components/common/ErrorDialog";
import { ERROR_MESSAGES } from "constants/errors";
import { ExportingRevenueRole } from "models/common";
import { buildQueryString } from "utils/url";
import { getTotalPosBookingAmount } from "utils/client/booking";

type FormData = {
  tenantCode?: string;
  ticketId?: number;
  fromDate?: Date;
  endDate?: Date;
  fromAction?: ActivityType;
  revenueStatus?: RevenueStatus;
};

function RevenueManagement() {
  // Variable
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const csvLinkRef = useRef(null);
  const isSuperAdmin = session?.user?.role === ROLE.SUPER_ADMIN;
  const isAdminRole = session?.user?.role === ROLE.ADMIN;

  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [isShowViewDialog, setIsShowViewDialog] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [bookingFilter, setBookingFilter] = useState<FormData>({
    tenantCode: session?.user?.tenantCode as string,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(PAGE_SIZE);
  const [totalRecord, setTotalRecord] = useState<number>(0);
  const [selectedFromDate, setSelectedFromDate] = useState<Date>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [staffOrAdmin, setStaffOrAdmin] = useState<Staff | User>();
  const [revenueColumns, setRevenueColumns] = useState<GridColDef[]>([]);
  const [actionType, setActionType] = useState<ActionType>();
  const [isShowErrMsgDialog, setIsShowErrMsgDialog] = useState<boolean>(false);
  const [errDialogMsg, setErrDialogMsg] = useState<string>("");
  const [exportingRole, setExportingRole] = useState<ExportingRevenueRole>(ExportingRevenueRole.STAFF);

  const {
    handleSubmit,
    control,
    reset: resetForm,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<FormData>();

  const [tenantCode] = watch(["tenantCode"]);
  const isDisableTicketSelector = !isAdminRole && !tenantCode;

  const getFetchBookingParams = useCallback(() => {
    const fromDate = bookingFilter.fromDate ? moment(bookingFilter.fromDate).format(SHORT_DATE) : undefined;
    const endDate = bookingFilter.endDate ? moment(bookingFilter.endDate).format(SHORT_DATE) : undefined;

    return {
      limit,
      page,
      fromDate,
      endDate,
      tenantCode: bookingFilter.tenantCode,
      ticketId: bookingFilter.ticketId,
      revenueStatus: bookingFilter.revenueStatus,
      userOrStaffId: staffOrAdmin?.id,
      fromAction: bookingFilter.fromAction,
    };
  }, [bookingFilter.endDate, bookingFilter.fromDate, bookingFilter.tenantCode, bookingFilter.ticketId, bookingFilter.revenueStatus, limit, page]);

  // Effect
  useEffect(() => {
    const formWatch = watch((values, { name }) => {
      if (name === "fromDate") {
        setSelectedFromDate(values.fromDate);
      }
      if (name === "endDate") {
        setSelectedEndDate(values.endDate);
      }
    });

    return () => formWatch.unsubscribe();
  }, [watch]);

  useEffect(() => {
    const tenantCode = getValues("tenantCode") || session.user.tenantCode;
    fetchTenant();
    fetchTicketList(tenantCode);

    fetchTotalBooking(bookingFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingFilter]);

  // Fetch booking following pagination
  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);

      const bookingParams = getFetchBookingParams();
      const bookings = await fetchBookings(bookingParams);

      if (!active) {
        return;
      }

      const result = bookings.map((item) => ({ ...item, ticketType: item.Ticket.type }));

      setBookings(result);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [page, limit, getFetchBookingParams]);

  useEffect(() => {
    const FULL_COLUMNS = [actionColumn, indexColumn, ...COLUMNS];
    const LIMITED_COLUMNS = [actionColumn, indexColumn, ...COLUMNS_FOR_STAFF];

    if (isSuperAdmin) {
      setExportingRole(ExportingRevenueRole.SUPER_ADMIN);
      return setRevenueColumns(FULL_COLUMNS);
    }

    // not show result for original admin)
    if (staffOrAdmin && staffOrAdmin["email"]) {
      return setRevenueColumns([]);
    }

    if (staffOrAdmin && actionType === ActionType.Search) {
      if (isStaff(staffOrAdmin)) {
        if (isEmptyFilters()) {
          setExportingRole(ExportingRevenueRole.GUEST);
          return setRevenueColumns([]);
        } else {
          setExportingRole(ExportingRevenueRole.STAFF);
          setRevenueColumns(LIMITED_COLUMNS);
        }
      } else {
        setExportingRole(ExportingRevenueRole.ADMIN);
        setRevenueColumns(FULL_COLUMNS);
      }
    }
  }, [staffOrAdmin]);

  // Function
  const onSubmit = async (values: FormData) => {
    const fromDate: any = values.fromDate ? moment(values.fromDate).format(SHORT_DATE) : null;
    const endDate: any = values.endDate ? moment(values.endDate).format(SHORT_DATE) : null;
    const fromAction = ActivityType.SearchRevenue;

    setPage(1);
    setBookingFilter({ ...values, fromDate, endDate, fromAction });
  };

  const fetchTenant = async () => {
    try {
      setErrMsg("");
      setLoading(true);
      const response = await fetchTenants();
      setTenants(response);
      setLoading(false);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const fetchTicketList = async (tenantCode: string) => {
    try {
      const response = await fetchTickets({ tenantCode });
      setTickets(response);
    } catch (error) {
      const message = getMessageFromError(error);
      setErrMsg(message);
    }
  };

  const fetchTotalBooking = async (bookingFilter) => {
    try {
      setErrMsg("");
      const response = await fetchRecordCount({ ...bookingFilter });
      setTotalRecord(response);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const showViewDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsShowViewDialog(true);
  };

  const hideViewDialog = () => {
    setSelectedBooking(undefined);
    setIsShowViewDialog(false);
  };

  const onResetForm = () => {
    if (staffOrAdmin) {
      setRevenueColumns([]);
    }

    resetForm({
      tenantCode: session.user.tenantCode ? session.user.tenantCode : "",
      fromDate: undefined,
      endDate: undefined,
    });

    // Re-submit form after reset
    const submit = handleSubmit(onSubmit);
    setTimeout(submit, 100);
  };

  const handleClickSearch = async () => {
    try {
      if (!isSuperAdmin) {
        const res = await confirmCredentials(dispatch);
        setActionType(ActionType.Search);
        setStaffOrAdmin(res as any);
      }

      handleSubmit(onSubmit)();
    } catch (e) {
      // Nothing here
    }
  };

  const validateValidRangeDateBeforeDownload = () => {
    const bookingParams = getFetchBookingParams();
    const fromDate = bookingParams.fromDate;
    const endDate = bookingParams.endDate;

    if (!fromDate || !endDate) {
      return false;
    }

    const { days } = getDiffOfDates(moment(fromDate).toDate(), moment(endDate).toDate());
    const maxDays = isAdminRole ? MAX_DOWNLOAD_REVENUE_DAYS_FOR_ADMIN : MAX_DOWNLOAD_REVENUE_DAYS_FOR_SUPER_ADMIN;

    return days + 1 <= maxDays;
  };

  const handleDownloadCsv = async () => {
    try {
      if (!validateValidRangeDateBeforeDownload()) {
        const message = isAdminRole
          ? ERROR_MESSAGES.INVALID_RANGE_DATE_TO_DOWNLOAD_REVENUE_FOR_ADMIN
          : ERROR_MESSAGES.INVALID_RANGE_DATE_TO_DOWNLOAD_REVENUE_FOR_SUPER_ADMIN;
        setErrDialogMsg(message);
        setIsShowErrMsgDialog(true);

        return;
      }

      if (isSuperAdmin) {
        await confirmPassword(dispatch);
        handleDownload();
      } else {
        const isOriginalAdmin = staffOrAdmin && staffOrAdmin["email"];
        const loggedStaffOrAdminId = staffOrAdmin?.id;

        const res = isOriginalAdmin ? await confirmPassword(dispatch) : await confirmCredentials(dispatch, loggedStaffOrAdminId as string);

        setActionType(ActionType.Download);
        setStaffOrAdmin(res);
        handleDownload(res.id);
      }
    } catch (e) {
      // Nothing here
    }
  };

  const isEmptyFilters = () => {
    const EMPTY_FILTERS = {
      revenueStatus: null,
      ticketId: null,
      endDate: null,
      fromDate: null,
    };

    return !bookingFilter || isMatch(bookingFilter, EMPTY_FILTERS);
  };

  const fetchCsv = () => {
    setTimeout(() => {
      csvLinkRef.current.link.click();
    }, 0);
  };

  const handleDownload = async (staffOrAdminId?: string | number) => {
    if (!totalRecord) {
      fetchCsv();
      return;
    }

    try {
      setErrMsg("");
      setLoading(true);
      const bookingParams = getFetchBookingParams();

      const url = `/api/admin/revenue-management/export?${buildQueryString({
        page: 1,
        limit: totalRecord,
        tenantCode: bookingParams.tenantCode,
        ticketId: bookingParams.ticketId,
        revenueStatus: bookingParams.revenueStatus,
        fromDate: bookingParams.fromDate,
        endDate: bookingParams.endDate,
        fromAction: ActivityType.DownloadRevenue,
        userOrStaffId: staffOrAdminId,
        exportingRole: exportingRole,
      })}`;
      window.open(url, "_blank");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      setErrMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTenant = (tenantCode: string) => {
    setValue("ticketId", null);
    fetchTicketList(tenantCode);
  };

  const getRowId = (booking: Booking) => {
    return booking.id;
  };

  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "アクション",
    sortable: false,
    headerAlign: "center",
    width: 160,
    align: "center",
    renderCell: function (params) {
      return (
        <div>
          {/*View*/}
          <IconButton aria-label="view" onClick={() => showViewDialog(params.row)}>
            <Image src={EyeIconImage} alt="detail" />
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
    width: 74,
    sortable: false,
    filterable: false,
    valueGetter: (params) => {
      return params.api.getRowIndex(params.id) + 1 + (page - 1) * limit;
    },
  };

  return (
    <AdminLayout>
      {/*Error*/}
      <Error message={errMsg} />

      <section className="relative text-gray-600 body-font">
        {/* Form Filter */}
        <div className="py-6 my-6 ad-section-container">
          <form onSubmit={handleSubmit(onSubmit)} className="m-4">
            <div className="grid grid-cols-3 gap-8 px-24 mdonly:px-25 mdonly:gap-4 ">
              {/* Tenant Selector */}
              <div className="relative mb-4">
                <label htmlFor="code" className="block mb-2 label">
                  施設名
                </label>
                <AutocompleteField
                  disabled={isAdminRole}
                  defaultValue={bookingFilter.tenantCode ?? null}
                  name="tenantCode"
                  className="block w-full !border-0 ad-input-field"
                  control={control}
                  options={tenants?.map((item) => item.code)}
                  getOptionLabel={(option) => tenants?.find((item) => item.code === option)?.name || ""}
                  renderInput={(params) => <TextField {...params} inputProps={{ ...params.inputProps, readOnly: true }} />}
                  handleChange={handleChangeTenant}
                />
                {errors.tenantCode && <Error message={errors.tenantCode.message} />}
              </div>

              {/* Ticket Selector */}
              <div className="relative mb-4">
                <label className="block mb-2 label">商品名</label>
                <AutocompleteField
                  defaultValue={null}
                  name="ticketId"
                  className="block w-full !border-0 ad-input-field"
                  control={control}
                  options={tickets?.map((o) => o.id)}
                  getOptionLabel={(ticketId) => tickets?.find((t) => t.id === ticketId)?.name || ticketId}
                  renderInput={(params) => <TextField {...params} inputProps={{ ...params.inputProps, readOnly: true }} />}
                  disabled={isDisableTicketSelector}
                />
              </div>

              {/* Has Recheck-in Selector */}
              <div className="relative mb-4">
                <label className="block mb-2 label">ステータス</label>
                <AutocompleteField
                  defaultValue={null}
                  name="revenueStatus"
                  className="block w-full !border-0 ad-input-field"
                  control={control}
                  options={REVENUE_STATUS_OPTIONS.map((item) => item.value)}
                  getOptionLabel={(option) => REVENUE_STATUS_OPTIONS.find((item) => item.value === option)?.label || ""}
                  renderInput={(params) => <TextField {...params} inputProps={{ ...params.inputProps, readOnly: true }} />}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mx-24">
              {/* Date From */}
              <div className="relative mb-4">
                <label htmlFor="fromDate" className="block mb-2 label">
                  期間開始
                </label>

                <DatePickerField
                  name="fromDate"
                  control={control}
                  disableFuture={true}
                  maxDate={selectedEndDate ?? undefined}
                  renderInput={(params) => <TextField {...params} className="flex justify-between w-full ad-input-field" />}
                />
              </div>

              {/* Date To */}
              <div className="relative mb-4">
                <label htmlFor="endDate" className="block mb-2 label">
                  期間終了
                </label>

                <DatePickerField
                  name="endDate"
                  control={control}
                  disableFuture={true}
                  minDate={selectedFromDate ?? undefined}
                  renderInput={(params) => <TextField {...params} className="flex justify-between w-full ad-input-field" />}
                />
              </div>
            </div>

            {/*Buttons*/}
            <div className="flex justify-center mt-4">
              <div className="flex gap-8 mdonly:ml-7 mdonly:gap-5">
                <AdminButton onClick={onResetForm} variant="outlined" className="w-[230px] h-[56px] mdonly:w-[194px] !font-bold">
                  リセット
                </AdminButton>

                <AdminButton onClick={handleClickSearch} variant="contained" className="w-[230px] h-[56px] mdonly:w-[175px] !font-bold">
                  検索する
                </AdminButton>

                <AdminButton
                  onClick={handleDownloadCsv}
                  variant="outlined"
                  className={`w-[230px] h-[56px] mdonly:w-[194px] !font-bold flex items-center gap-6 !px-[20px] 
                  ${!revenueColumns.length ? "ad-disable-button" : ""}`}
                  disabled={!revenueColumns.length}
                >
                  <p className="text-xs">CSVファイル出力</p>
                  <SaveAltIcon />
                </AdminButton>
                <CSVLink
                  ref={csvLinkRef}
                  className="hidden"
                  filename="RevenueReport.csv"
                  headers={REVENUE_CSV_HEADERS}
                  target="_blank"
                  data={[]}
                />
              </div>
            </div>
          </form>
        </div>
        {/* Data Table */}
        {revenueColumns.length ? (
          <>
            <div className="mb-12 ad-section-container ad-table-wrapper">
              <DataGrid
                components={{ LoadingOverlay: LoadingSpinner, NoRowsOverlay: () => null }}
                loading={loading}
                hideFooterSelectedRowCount
                autoHeight
                rows={bookings}
                getRowId={getRowId}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                columns={revenueColumns}
                hideFooterPagination={true}
                hideFooter={true}
                disableColumnFilter
                disableColumnMenu
              />
            </div>
            <div>
              <IndependencePagination
                page={page}
                defaultPageSize={limit}
                rowCount={totalRecord}
                onChange={(newPage, pageSize) => {
                  if (newPage !== page) {
                    setPage(newPage);
                  }
                  if (pageSize !== limit) {
                    setLimit(pageSize);
                  }
                }}
              />
            </div>
          </>
        ) : null}

        {/* View Dialog */}
        {isShowViewDialog && <ViewRevenueDialog booking={selectedBooking} onHide={hideViewDialog} role={staffOrAdmin?.role} />}

        {isShowErrMsgDialog && <ErrorDialog message={errDialogMsg} text="戻る" onDismiss={() => setIsShowErrMsgDialog(false)} />}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(RevenueManagement, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);

const COLUMNS: GridColDef[] = [
  {
    field: "userId",
    sortable: false,
    headerName: "会員番号",
    width: 150,
  },
  {
    field: "tenantCode",
    sortable: false,
    headerName: "店舗ID", // Tenant ID
    width: 150,
  },
  {
    field: "id",
    sortable: false,
    headerName: "予約ID", // ID booking
    width: 150,
  },
  {
    field: "shortBarCode",
    sortable: false,
    headerName: "バーコード下4桁",
    width: 150,
    valueGetter: (params) => {
      const booking = params.row as Booking;
      return isOnlineMonthlyBooking(booking) || isOnlineTimesLimitBooking(booking) ? "" : getShortBarCode(booking.barCode);
    },
  },
  {
    field: "name",
    sortable: false,
    headerName: "お名前",
    width: 150,
    valueGetter: (params) => {
      const booking = params.row as Booking;
      return booking.User?.name;
    },
  },
  {
    field: "adultQuantity",
    sortable: false,
    headerName: "おとな利用人数",
    width: 150,
  },
  {
    field: "childQuantity",
    sortable: false,
    headerName: "子ども利用人数",
    width: 150,
  },
  {
    field: "isBooked",
    sortable: false,
    headerName: "事前予約",
    width: 150,
    valueGetter: (params) => {
      const booking = params.row as Booking;

      return isOnlineBooking(booking);
    },
    renderCell: (params) => {
      if (!params.value) {
        return <></>;
      }

      return <CircleOutlined className="text-green-500" />;
    },
  },
  {
    field: "isUseDuringTheDay",
    sortable: false,
    headerName: "当日利用",
    width: 150,
    valueGetter: (params) => {
      const booking = params.row as Booking;
      return isInDayBooking(booking);
    },
    renderCell: (params) => {
      if (!params.value) {
        return <></>;
      }

      return <CircleOutlined className="text-green-500" />;
    },
  },
  {
    field: "refundedAt",
    sortable: false,
    headerName: "キャンセル返金",
    width: 200,
    valueGetter: (params) => {
      const booking = params.row as Booking;
      const isRefunded = booking.paymentStatus === PaymentStatus.Refunded;
      return isRefunded && booking.cancelledAt ? moment(booking.cancelledAt).format(LONG_DATE_WITHOUT_SECOND) : null;
    },
  },
  {
    field: "productName",
    sortable: false,
    headerName: "商品名", // Tên sản phẩm,
    cellClassName: "wrap-cell",
    width: 250,
    valueGetter: (params) => params.row.Ticket?.name,
  },
  {
    field: "totalAmount",
    sortable: false,
    headerName: "事前決済金額",
    width: 150,
    valueGetter: (params) => {
      const booking = params.row as Booking;
      const ticket = booking.Ticket;

      if (!ticket || ticket.paymentType !== PaymentType.Online) {
        return formatCurrency(0);
      }

      if (booking.parentBookingId) {
        return formatCurrency(0);
      }

      return formatCurrencyStrictMode(params.row.totalAmount);
    },
  },
  {
    field: "GMOTransactionId",
    sortable: false,
    headerName: "決済ID",
    width: 230,
    cellClassName: "wrap-cell",
  },
  {
    field: "postPaymentAmount",
    sortable: false,
    headerName: "POS側の最終精算金額",
    width: 200,
    valueGetter: (params) => {
      const booking = params.row as Booking & { Ticket: Ticket };
      return getTotalPosBookingAmount(booking);
    },
  },
  {
    field: "coupons",
    headerName: "クーポン名", // coupon name
    sortable: false,
    width: 200,
    valueGetter: (params) => {
      if (!params.row.coupons) {
        return [];
      }

      const coupons = Object.values(params.row.coupons) as Coupon[];
      return coupons.filter((coupon) => Boolean(Number(coupon.discountAmount))).map((coupon) => coupon.name || coupon.code);
    },
    renderCell: function (params) {
      const couponCodes = params.value;
      const couponNames = couponCodes?.length ? couponCodes.map((couponCode, index) => (index !== 0 ? `, ${couponCode}` : couponCode)) : " ";

      return (
        <Tooltip title={couponNames}>
          <span className="truncate-cell">{couponNames}</span>
        </Tooltip>
      );
    },
  },
  {
    field: "totalCouponsDiscountAmount",
    headerName: "割引金額",
    sortable: false,
    width: 150,
    valueGetter: (params) => {
      if (!params.row.coupons) {
        return null;
      }
      const coupons = Object.values(params.row.coupons) as Coupon[];
      const total = coupons.reduce((total, coupon) => +coupon.discountAmount + total, 0);

      return total;
    },
    renderCell: function (params) {
      const totalCouponsDiscountAmount = params.value;

      return <div>{totalCouponsDiscountAmount ? `¥${formatThousands(totalCouponsDiscountAmount)}` : null}</div>;
    },
  },
  {
    field: "hasReCheckInOrNot",
    sortable: false,
    headerName: "ステータス",
    width: 150,
    valueGetter: (params) => {
      if (!params.row.checkedInAt) {
        return null;
      }
      const booking = params.row;
      const isSameTimeBetweenFirstAndCurrentOfCheckedInTime =
        isSameTime(booking.checkedInAt, booking.firstCheckedInAt) && isSameDay(booking.checkedInAt, booking.firstCheckedInAt);
      const isTheFirstCheckedIn = !booking.firstCheckedInAt || isSameTimeBetweenFirstAndCurrentOfCheckedInTime;
      return isTheFirstCheckedIn ? "初回入場" : "再入場";
    },
  },
  {
    field: "reCheckInCount",
    sortable: false,
    headerName: "再入場回数",
    width: 150,
  },
  {
    field: "isFirstTimeUsingMonthlyTicket",
    sortable: false,
    headerName: "フリーパス",
    width: 150,
    valueGetter: (params) => {
      const booking = params.row as Booking;
      const value = booking["isFirstTimeUsingMonthlyTicket"] ? "初回利用" : "";
      return value;
    },
  },
  {
    field: "isFirstCheckedOutBooking",
    sortable: false,
    headerName: "初回利用日",
    width: 150,
    valueGetter: (params) => {
      const booking = params.row as Booking;
      return booking.id === booking.User.firstCheckedOutBookingId;
    },
    renderCell: (params) => {
      if (!params.value) {
        return <></>;
      }

      return <CircleOutlined className="text-green-500" />;
    },
  },
  {
    field: "checkedInAt",
    sortable: false,
    headerName: "入場時間",
    width: 200,
    valueGetter: (params) => {
      if (!params.row.checkedInAt) {
        return null;
      }

      const firstCheckedInAt = params.row.firstCheckedInAt || params.row?.checkedInAt;
      return moment(firstCheckedInAt).format(LONG_DATE_WITHOUT_SECOND);
    },
  },
  {
    field: "checkedOutAt",
    sortable: false,
    headerName: "退場時間",
    width: 200,
    valueGetter: (params) => {
      if (!params.row?.checkedOutAt) {
        return null;
      }

      return moment(params.row?.partialCheckedOutAt || params.row?.checkedOutAt).format(LONG_DATE_WITHOUT_SECOND);
    },
  },
  {
    field: "stayDuration",
    sortable: false,
    headerName: "滞在時間",
    width: 150,
    valueGetter: (params) => {
      const booking = params.row;
      if (booking.status === BookingStatus.CheckedIn) {
        return null;
      }

      return typeof booking.stayDuration === "number" ? formatStayDurationTime(booking.stayDuration) : getBookingStayDuration(booking);
    },
  },
  {
    field: "purchaseDate",
    sortable: false,
    headerName: "購入日",
    width: 150,
    valueGetter: (params) => {
      return isOnlineMonthlyBooking(params.row) || isOnlineTimesLimitBooking(params.row) ? moment(params.row?.createdAt).format(SHORT_DATE) : undefined;
    },
  },
  {
    field: "date",
    sortable: false,
    headerName: "初回利用予定日",
    width: 150,
    valueGetter: (params) => {
      return isOnlineMonthlyBooking(params.row) || isOnlineTimesLimitBooking(params.row) ? moment(params?.row?.date).format(SHORT_DATE) : undefined;
    },
  },
  {
    field: "usageInfo",
    sortable: false,
    headerName: "利用回数",
    headerAlign: "center",
    align: "center",
    width: 150,
    valueGetter: (params) => {
      return isTimesLimitTicket(params.row.Ticket.type) ? `${params.row.usageTimes}/${params.row.totalTimes}` : undefined;
    },
  },
];

const COLUMNS_FOR_STAFF = COLUMNS.filter((column) => !["name", "GMOTransactionId"].includes(column.field));
