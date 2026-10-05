import { yupResolver } from "@hookform/resolvers/yup";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import {
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { BookingStatus, Tenant } from "@prisma/client";
import moment from "moment";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import AdminDeleteBookingDialog from "components/AdminCancelBookingDialog";
import AdminUpdateBookingStatusToCancelledDialog from "components/AdminUpdateBookingStatusToCancelledDialog";
import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import AdminLayout from "components/common/AdminLayout";
import AdminButton from "components/common/Buttons/AdminButton";
import IndependencePagination from "components/common/DataGridPagination/IndependencePagination";
import Error from "components/common/Error";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import DatePickerField from "components/common/Fields/DatePickerField";
import TextInputField from "components/common/Fields/TextInputField";
import PasswordConfirmationDialog from "components/common/PasswordConfirmationDialog";
import WarningDialog from "components/common/WarningDialog";
import { BOOKING_STATUS_OPTIONS } from "constants/booking";
import { JP_SHORT_DATE, ROLE, SHORT_DATE } from "constants/common";
import { MESSAGES } from "constants/messages";
import { ROUTE } from "constants/route";
import {
  BOOKING_COLUMNS_PART1,
  BOOKING_COLUMNS_PART2,
  BOOKING_COLUMNS_PART2_FOR_STAFF,
} from "constants/table";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { useCachedPagination } from "libs/hooks/useCachedPagination";
import { bookingManagementSchema } from "libs/validation/schemas";
import { Booking, Staff, Ticket, User } from "models/Entity";
import { ActivityType } from "models/enums";
import {
  countBookings,
  fetchBookings,
  updateBookingStatus,
} from "services/api-client/admin/booking.service";
import { fetchTenants } from "services/api-client/admin/tenant.service";
import { fetchBookingStatus } from "services/api-client/booking.service";
import { fetchTickets } from "services/api-client/ticket.service";
import TrashIconImage from "statics/images/close.svg";
import EyeIconImage from "statics/images/eye.svg";
import PencilIconImage from "statics/images/pencil.svg";
import PartialCheckoutIconImage from "statics/images/user-edit.svg";
import {
  NotificationType,
  showNotification,
} from "stores/reducers/notification";
import {
  getBookingModificationStatus,
  isOnlineBooking,
  isOnlineMonthlyBooking,
  isOnlineTimesLimitBooking,
} from "utils/booking";
import { getMessageFromError, scrollToTop } from "utils/common";
import { confirmCredentials, confirmPassword } from "utils/ui";
import {
  buildQueryString,
  changeRouterQuery,
  deleteRouterQuery,
  getUrlQueryValue,
} from "utils/url";
import { isStaff } from "utils/user";
import {
  resetStaffOrAdmin,
  selectStaffManagement,
  updateStaffOrAdmin,
} from "stores/reducers/staff-management";
import { ExportingBookingRole } from "models/common";

import styles from "./index.module.scss";

type FormData = {
  tenantCode: string;
  name: string;
  ticketId: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  shortBarCode: string;
};

function BookingManagementList() {
  // Variable
  const dispatch = useDispatch();
  const initFiltersRaw = getUrlQueryValue("filters");
  const initFilters = initFiltersRaw ? JSON.parse(initFiltersRaw) : null;
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const pagination = useCachedPagination({
    onPageChange: () => {
      fetchData();
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: initFilters,
    resolver: yupResolver(bookingManagementSchema),
  });

  const [startDate, endDate, tenantCode] = watch([
    "startDate",
    "endDate",
    "tenantCode",
  ]);

  const isSuperAdmin = session?.user?.role === ROLE.SUPER_ADMIN;
  const isDisableTicketSelector = isSuperAdmin && !tenantCode;
  const staffOrAdminId = router.query.staffOrAdminId;

  // State
  const { staffOrAdmin: previousStaffOrAdmin } = useSelector(
    selectStaffManagement(),
  );

  const [deletingBooking, setDeletingBooking] = useState<Booking>();
  const [changingStatusBooking, setChangingStatusBooking] = useState<
    Booking & { newStatus: BookingStatus }
  >();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>();
  const [selectedBooking, setSelectedBooking] = useState<Booking>(null);
  const [
    isShowPasswordConfirmationToRedirectDialog,
    setIsShowPasswordConfirmationToRedirectDialog,
  ] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [isShowRequireReloadErrorDialog, setIsShowRequireReloadErrorDialog] =
    useState<boolean>(false);
  const [
    isShowChangeStatusConfirmationDialog,
    setIsShowChangeStatusConfirmationDialog,
  ] = useState<boolean>(false);
  const [
    isShowChangeCancelledStatusDialog,
    setIsShowChangeCancelledStatusDialog,
  ] = useState<boolean>(false);
  const [staffOrAdmin, setStaffOrAdmin] = useState<Staff | User>();
  const [bookingColumns, setBookingColumns] = useState<GridColDef[]>([]);
  const [filters, setFilters] = useState<FormData>(initFilters);
  const [exportingRole, setExportingRole] = useState<string>();
  // Effect
  useEffect(() => {
    const tenantCode = session.user.tenantCode;
    fetchTicketList(tenantCode);
  }, []);

  useEffect(() => {
    if (
      authStatus === "authenticated" &&
      session.user.role === ROLE.SUPER_ADMIN
    ) {
      fetchTenantList();
    }
  }, [authStatus]);

  useEffect(() => {
    fetchTotalDataCount();
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.itemsPerPage, filters]);

  useEffect(() => {
    if (!isSuperAdmin || tenants) {
      const BASE_COLUMNS_FOR_SUPER_ADMIN = [
        ...BOOKING_COLUMNS_PART1,
        userNameColumn,
        statusColumn,
        ...BOOKING_COLUMNS_PART2,
      ];
      const BASE_COLUMNS_FOR_ADMIN = [
        ...BOOKING_COLUMNS_PART1,
        statusColumn,
        ...BOOKING_COLUMNS_PART2,
      ];
      const BASE_COLUMNS_FOR_STAFF = [
        ...BOOKING_COLUMNS_PART1,
        statusColumn,
        ...BOOKING_COLUMNS_PART2_FOR_STAFF,
      ];

      const COLUMNS_FOR_ADMIN = [
        actionDetailBookingColumn,
        indexColumn,
        ...BASE_COLUMNS_FOR_ADMIN,
      ];
      const COLUMNS_FOR_STAFF = [
        actionDetailBookingColumn,
        indexColumn,
        ...BASE_COLUMNS_FOR_STAFF,
      ];
      const COLUMNS_FOR_SUPER_ADMIN = [
        actionDetailBookingColumn,
        indexColumn,
        tenantColumn,
        ...BASE_COLUMNS_FOR_SUPER_ADMIN,
      ];

      if (isSuperAdmin) {
        setBookingColumns(COLUMNS_FOR_SUPER_ADMIN);
        setExportingRole(ExportingBookingRole.SUPER_ADMIN);
        return;
      }

      if (staffOrAdmin) {
        dispatch(updateStaffOrAdmin(staffOrAdmin));
      }

      const currentStaffOrAdmin =
        staffOrAdmin ||
        (staffOrAdminId &&
          previousStaffOrAdmin &&
          previousStaffOrAdmin.id.toString() === staffOrAdminId &&
          previousStaffOrAdmin);

      // not show result for original admin)
      if (currentStaffOrAdmin && currentStaffOrAdmin["email"]) {
        return setBookingColumns([]);
      }

      if (currentStaffOrAdmin) {
        if (isStaff(currentStaffOrAdmin)) {
          setExportingRole(ExportingBookingRole.STAFF);
          setBookingColumns(COLUMNS_FOR_STAFF);
        } else {
          setExportingRole(ExportingBookingRole.ADMIN);
          setBookingColumns(COLUMNS_FOR_ADMIN);
        }
      }
    }
  }, [staffOrAdmin, tenants]);

  // Functions
  const onSubmit = (values) => {
    const { startDate, endDate, ...filters } = values;

    const nextFilters = {
      ...filters,
      startDate: startDate
        ? moment(startDate).utc(true).format(SHORT_DATE)
        : null,
      endDate: endDate ? moment(endDate).utc(true).format(SHORT_DATE) : null,
    };

    changeRouterQuery("filters", JSON.stringify(nextFilters), router);

    nextFilters.fromAction = ActivityType.SearchBooking;

    setFilters(nextFilters);
    pagination.setPage(1);
  };

  const prepareDeleteBooking = async (booking: Booking) => {
    try {
      await handleShowConfirmationPopup();
    } catch (error) {
      return;
    }

    setDeletingBooking(booking);
  };

  const fetchTotalDataCount = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const response = await countBookings({
        ...filters,
        status: filters?.status
          ? ([filters.status] as BookingStatus[])
          : undefined,
      });
      setTotalBookings(response);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantList = async () => {
    try {
      const response = await fetchTenants();
      setTenants(response);
    } catch (error) {
      const message = getMessageFromError(error);
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

  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const params = prepareParamsToFetchBookings();
      const data = await fetchBookings(params);

      setBookings(data.bookings);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const prepareParamsToFetchBookings = (
    skipPagination = false,
    staffOrAdminId?: string | number,
  ) => {
    const status = filters?.status
      ? ([filters.status] as BookingStatus[])
      : undefined;

    const params = {
      limit: skipPagination ? undefined : pagination.itemsPerPage,
      page: skipPagination ? undefined : pagination.page,
      ...filters,
      status,
      userOrStaffId: staffOrAdminId || staffOrAdmin?.id,
    };

    return params;
  };

  const hidePasswordConfirmationToRedirectDialog = () => {
    setSelectedBooking(undefined);
    setIsShowPasswordConfirmationToRedirectDialog(false);
  };

  const handleAfterUpdateCancelledStatusSuccess = async () => {
    await fetchData();
    setIsShowChangeCancelledStatusDialog(false);
    dispatch(
      showNotification({
        type: NotificationType.SUCCESS,
        message: MESSAGES.CHANGE_STATUS_SUCCESSFUL,
      }),
    );
  };

  const redirectBookingDetail = (booking: Booking) => {
    filters && delete filters["fromAction"];
    router.push({
      pathname: `${ROUTE.BOOKING_MANAGEMENT_DETAILS}/${booking.id}`,
      query: {
        filters: JSON.stringify(filters),
        page: pagination.page,
        role: staffOrAdmin?.role,
        ...((staffOrAdminId || staffOrAdmin) && {
          staffOrAdminId: staffOrAdmin?.id || staffOrAdminId,
        }),
      },
    });
  };

  const handleShowConfirmationPopup = async () => {
    const isLoggedOriginalAdmin =
      (staffOrAdmin && staffOrAdmin["email"]) ||
      (!staffOrAdmin && previousStaffOrAdmin && previousStaffOrAdmin["email"]);
    if (isSuperAdmin || isLoggedOriginalAdmin) {
      await confirmPassword(dispatch);
    } else {
      const loggedStaffId = staffOrAdmin?.id || previousStaffOrAdmin?.id;
      await confirmCredentials(dispatch, loggedStaffId as string);
    }
  };

  const redirectBookingEdit = async (booking: Booking) => {
    try {
      await handleShowConfirmationPopup();
    } catch (error) {
      return;
    }

    const isCheckingIn = booking.status === BookingStatus.CheckedIn;
    filters && delete filters["fromAction"];

    router.push({
      pathname: `${ROUTE.BOOKING_MANAGEMENT_UPDATE}/${booking.id}`,
      query: {
        checking_in: isCheckingIn,
        filters: JSON.stringify(filters),
        page: pagination.page,
        ...((staffOrAdminId || staffOrAdmin) && {
          staffOrAdminId: staffOrAdmin?.id || staffOrAdminId,
        }),
      },
    });
  };

  const redirectBookingPartialCheckout = async (booking: Booking) => {
    try {
      await handleShowConfirmationPopup();
    } catch (error) {
      return;
    }

    router.push(`${ROUTE.BOOKING_MANAGEMENT_PARTIAL_CHECKOUT}/${booking.id}`);
  };

  const processUpdateStatus = async (booking: Booking) => {
    try {
      await updateBookingStatus(booking);
      dispatch(
        showNotification({
          type: NotificationType.SUCCESS,
          message: MESSAGES.CHANGE_STATUS_SUCCESSFUL,
        }),
      );
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      dispatch(
        showNotification({
          type: NotificationType.ERROR,
          message: message,
        }),
      );
    }
  };

  const validateBookingStatusToUpdateBooking = async (bookingId: number) => {
    try {
      const status = await fetchBookingStatus(bookingId);
      if (status === BookingStatus.SystemCancelled) {
        setIsShowRequireReloadErrorDialog(true);
        return false;
      }
      return true;
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const getBookingsRowId = (booking: Booking) => {
    return booking.id;
  };

  const handleReset = () => {
    if (staffOrAdmin || previousStaffOrAdmin) {
      setBookingColumns([]);
      dispatch(resetStaffOrAdmin());
    }

    deleteRouterQuery("filters", router);
    deleteRouterQuery("staffOrAdminId", router);

    reset(
      {
        ticketId: null,
        tenantCode: null,
        status: null,
        endDate: undefined,
        name: "",
        startDate: undefined,
      },
      { keepDefaultValues: false },
    );

    setFilters(null);
    pagination.setPage(1);
  };

  const handleClickSearch = async () => {
    try {
      if (!isSuperAdmin) {
        const res = await confirmCredentials(dispatch);
        setStaffOrAdmin(res as any);
      }

      handleSubmit(onSubmit)();
    } catch (e) {
      // Nothing here
    }
  };

  const handleDownloadCsv = async () => {
    try {
      if (isSuperAdmin) {
        await confirmPassword(dispatch);
        handleDownload();
      } else {
        const isOriginalAdmin =
          (staffOrAdmin && staffOrAdmin["email"]) ||
          (previousStaffOrAdmin && previousStaffOrAdmin["email"]);
        const loggedStaffOrAdminId =
          staffOrAdmin?.id || previousStaffOrAdmin?.id;

        const res = isOriginalAdmin
          ? await confirmPassword(dispatch)
          : await confirmCredentials(dispatch, loggedStaffOrAdminId as string);

        setStaffOrAdmin(res);
        handleDownload(res.id);
      }
    } catch (e) {
      // Nothing here
    }
  };

  const handleDownload = async (staffOrAdminId?: string | number) => {
    try {
      setErrMsg("");
      setLoading(true);

      const params = prepareParamsToFetchBookings(true, staffOrAdminId);
      const url = `/api/admin/bookings/export?${buildQueryString({
        ...params,
        fromAction: ActivityType.DownloadBooking,
        exportingRole: exportingRole,
      })}`;
      window.open(url, "_blank");
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTenant = (tenantCode: string) => {
    setValue("ticketId", "");
    fetchTicketList(tenantCode);
  };

  const handleAcceptChangeStatusConfirmation = async () => {
    const { newStatus, ...booking } = changingStatusBooking;
    const currentStatus = booking.status;
    try {
      setIsShowChangeStatusConfirmationDialog(false);
      await confirmPassword(dispatch);

      if (
        (
          [BookingStatus.SystemCancelled, BookingStatus.Cancelled] as string[]
        ).includes(newStatus)
      ) {
        setIsShowChangeCancelledStatusDialog(true);
        return;
      }

      booking.status = BookingStatus[newStatus];
      await processUpdateStatus(booking);
      await fetchData();
    } catch (e) {
      booking.status = currentStatus;
      return;
    }
  };

  const actionDetailBookingColumn: GridColDef = {
    field: "actions",
    headerName: "アクション",
    width: 172,
    align: "center",
    headerAlign: "center",
    sortable: false,
    filterable: false,
    renderCell: function (params) {
      const booking = params.row as Booking;

      const { canCancel, canEdit, canPartialCheckout } =
        getBookingModificationStatus(booking);

      return (
        <div className="flex">
          {/*Booking Detail*/}
          <IconButton
            aria-label="update"
            onClick={() => redirectBookingDetail(booking)}
          >
            <Image src={EyeIconImage} alt="detail" />
          </IconButton>
          {/*Update*/}
          <IconButton
            aria-label="update"
            onClick={() => redirectBookingEdit(booking)}
            disabled={!canEdit}
            className={!canEdit ? "opacity-[0.3]" : ""}
          >
            <Image src={PencilIconImage} alt="update" />
          </IconButton>
          {/*Delete*/}
          <IconButton
            aria-label="delete"
            onClick={() => prepareDeleteBooking(booking)}
            disabled={!canCancel}
            className={!canCancel ? "opacity-[0.3]" : ""}
          >
            {isOnlineBooking(booking) ? (
              <span className="text-[12px] ad-text-color">返金</span>
            ) : (
              <Image src={TrashIconImage} alt="delete" />
            )}
          </IconButton>
          {/*Partial Checkout*/}
          <IconButton
            aria-label="delete"
            onClick={() => redirectBookingPartialCheckout(booking)}
            disabled={!canPartialCheckout}
            className={!canPartialCheckout ? "opacity-[0.3]" : ""}
          >
            <Image src={PartialCheckoutIconImage} alt="delete" />
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
      return (
        params.api.getRowIndex(params.id) +
        1 +
        (pagination.page - 1) * pagination.itemsPerPage
      );
    },
  };

  const tenantColumn: GridColDef = {
    field: "tenantName",
    headerName: "施設名",
    width: 220,
    cellClassName: "wrap-cell",
    sortable: false,
    filterable: false,
    valueGetter: (params) => {
      const tenant = tenants?.find(
        (tenant) => tenant.code === params.row.tenantCode,
      );
      return tenant?.name;
    },
  };

  const statusColumn: GridColDef = {
    field: "status",
    headerName: "ステータス",
    width: 250,
    sortable: false,
    filterable: false,
    valueGetter: (params) =>
      BOOKING_STATUS_OPTIONS.find((o) => o.value === params.row?.status)
        ?.label || params.row?.status,
    renderCell: (params) => {
      const booking = params.row;

      let statusOptions = BOOKING_STATUS_OPTIONS;
      if (
        isOnlineMonthlyBooking(booking) ||
        isOnlineTimesLimitBooking(booking)
      ) {
        statusOptions = BOOKING_STATUS_OPTIONS.filter((option) =>
          (
            [
              BookingStatus.Successful,
              BookingStatus.SystemCancelled,
            ] as string[]
          ).includes(option.value),
        );
      }

      const handleChangeStatus = async (
        event: SelectChangeEvent,
        booking: Booking,
      ) => {
        const newStatus = event.target.value as BookingStatus;
        if (!(await validateBookingStatusToUpdateBooking(booking.id))) return;

        setIsShowChangeStatusConfirmationDialog(true);
        setChangingStatusBooking({ ...booking, newStatus });
      };

      const shouldDisable = booking.status === BookingStatus.SystemCancelled;

      return (
        <div>
          <Select
            id="status"
            value={booking?.status}
            size="small"
            className={styles["ad-select-field"]}
            sx={{
              ".MuiSelect-select": {
                border: "1px solid #92E4CD",
              },
            }}
            onChange={(event) => handleChangeStatus(event, booking)}
            disabled={shouldDisable}
          >
            {statusOptions.map((item, index) => (
              <MenuItem key={index} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </div>
      );
    },
  };

  const userNameColumn: GridColDef = {
    field: "userName",
    headerName: "お名前",
    width: 192,
    sortable: false,
    filterable: false,
    valueGetter: (params) => params.row?.User?.name,
  };

  // Render
  return (
    <AdminLayout>
      <section className="relative text-gray-600 body-font">
        {/*Error*/}
        <Error message={errMsg} />

        {/* Filters Section */}
        <div className="py-6 my-6 ad-section-container">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-3 gap-8 px-24 md:px-8 ">
              {/*Name*/}
              <div className="relative mb-4">
                <label htmlFor="name" className="block mb-2 label">
                  氏名
                </label>
                <TextInputField
                  id="name"
                  name="name"
                  control={control}
                  className="w-full px-3 py-1 ad-input-field"
                  placeholder="山田　太郎"
                />
                {errors.name && <Error message={errors.name.message} />}
              </div>

              {/* Tenant */}
              {isSuperAdmin && (
                <div className="relative mb-4">
                  <label className="block mb-2 label">施設名</label>
                  <AutocompleteField
                    defaultValue={filters?.tenantCode ?? null}
                    name="tenantCode"
                    className="block w-full !border-0 ad-input-field "
                    control={control}
                    options={tenants?.map((item) => item.code) || []}
                    getOptionLabel={(option) =>
                      tenants?.find((item) => item.code === option)?.name || ""
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="あ"
                        className="block w-full ad-input-field"
                        inputProps={{ ...params.inputProps, readOnly: true }}
                      />
                    )}
                    handleChange={handleChangeTenant}
                  />
                  {errors.tenantCode && (
                    <Error message={errors.tenantCode.message} />
                  )}
                </div>
              )}

              {/*Ticket*/}
              <div className="relative mb-4">
                <label htmlFor="ticketId" className="block mb-2 label">
                  商品名
                </label>
                <AutocompleteField
                  disablePortal
                  name="ticketId"
                  defaultValue={null}
                  control={control}
                  options={tickets?.map((o) => o.id)}
                  getOptionLabel={(ticketId) =>
                    tickets?.find((t) => t.id === ticketId)?.name ||
                    `${ticketId}`
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
                {errors.ticketId && <Error message={errors.ticketId.message} />}
              </div>

              {/*Booking Status*/}
              {!isSuperAdmin && (
                <div className="relative mb-4">
                  <label htmlFor="status" className="block mb-2 label">
                    ステータス
                  </label>
                  <AutocompleteField
                    id="status"
                    name="status"
                    defaultValue={null}
                    control={control}
                    options={BOOKING_STATUS_OPTIONS.map((o) => o.value)}
                    getOptionLabel={(status) =>
                      BOOKING_STATUS_OPTIONS.find((o) => o.value === status)
                        ?.label || status
                    }
                    className="admin"
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
                  {errors.status && <Error message={errors.status.message} />}
                </div>
              )}
            </div>

            <div className={"grid grid-cols-3 gap-x-8 px-24 md:px-8"}>
              {/*Booking Status*/}
              {isSuperAdmin && (
                <div className="relative mb-4">
                  <label htmlFor="status" className="block mb-2 label">
                    ステータス
                  </label>
                  <AutocompleteField
                    id="status"
                    name="status"
                    defaultValue={null}
                    control={control}
                    options={BOOKING_STATUS_OPTIONS.map((o) => o.value)}
                    getOptionLabel={(status) =>
                      BOOKING_STATUS_OPTIONS.find((o) => o.value === status)
                        ?.label || status
                    }
                    className="admin"
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
                  {errors.status && <Error message={errors.status.message} />}
                </div>
              )}

              {/*Date*/}
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
                {errors.startDate && (
                  <Error message={errors.startDate.message} />
                )}
              </div>

              {/*Date*/}
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
                {errors.endDate && <Error message={errors.endDate.message} />}
              </div>

              {/*Short BarCode*/}
              <div className="relative mb-4">
                <label htmlFor="shortBarCode" className="block mb-2 label">
                  バーコード下4桁
                </label>
                <TextInputField
                  id="shortBarCode"
                  name="shortBarCode"
                  control={control}
                  className="w-full px-3 py-1 ad-input-field"
                  placeholder="0123"
                />
              </div>
            </div>

            {/*Buttons*/}
            <div className="flex justify-center mt-4">
              <div className="flex gap-8  md:gap-[22px] ">
                <AdminButton
                  variant="outlined"
                  onClick={handleReset}
                  className="w-[230px] h-[56px] md:gap-0 md:h-[36px] md:w-[150px]"
                >
                  <span className="font-bold md:text-[14px] md:font-medium">
                    リセット
                  </span>
                </AdminButton>
                <AdminButton
                  variant="contained"
                  className="w-[230px] h-[56px] md:gap-0 md:h-[36px] md:w-[150px]"
                  onClick={handleClickSearch}
                >
                  <span className="font-bold md:text-[14px] md:font-medium">
                    検索する
                  </span>
                </AdminButton>
                <AdminButton
                  variant="outlined"
                  className={`w-[230px] h-[56px] flex items-center gap-3 !p-0 md:gap-0 md:h-[36px] md:w-[150px] 
                  ${!bookingColumns.length ? "ad-disable-button" : ""}`}
                  onClick={handleDownloadCsv}
                  disabled={!bookingColumns.length}
                >
                  <span className="font-bold md:text-[14px] md:font-medium">
                    CSVファイル出力
                  </span>
                  <SaveAltIcon />
                </AdminButton>
              </div>
            </div>
          </form>
        </div>

        {bookingColumns.length ? (
          <>
            <div className="mb-12 ad-section-container ad-table-wrapper md:mb-0">
              <p className="px-6 py-6">{moment().format(JP_SHORT_DATE)}</p>
              {/*Data Bookings*/}
              <DataGrid
                components={{
                  LoadingOverlay: LoadingSpinner,
                  NoRowsOverlay: () => null,
                }}
                loading={loading}
                hideFooterSelectedRowCount
                autoHeight
                rows={bookings}
                getRowId={getBookingsRowId}
                columns={bookingColumns}
                scrollbarSize={5}
                hideFooterPagination={true}
                hideFooter={true}
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
                  if (newPage !== pagination.page) {
                    pagination.setPage(newPage);
                  }
                  if (pageSize !== pagination.itemsPerPage) {
                    pagination.setItemsPerPage(pageSize);
                  }
                }}
              />
            </div>
          </>
        ) : null}

        {/*Password Confirmation Dialog*/}
        {isShowPasswordConfirmationToRedirectDialog && (
          <PasswordConfirmationDialog
            onAccept={() => redirectBookingDetail(selectedBooking)}
            onDismiss={hidePasswordConfirmationToRedirectDialog}
          />
        )}

        {deletingBooking && (
          <AdminDeleteBookingDialog
            booking={deletingBooking}
            onDismiss={() => setDeletingBooking(null)}
            onSuccess={() => fetchData()}
            onError={(err) => {
              setErrMsg(err);
              scrollToTop();
            }}
          />
        )}

        {/*Required Reload Error Popup*/}
        {isShowRequireReloadErrorDialog && (
          <WarningDialog
            hideDismissButton={true}
            text="OK"
            message={
              "すでにシステムによる自動キャンセルされたため変更ができません。新規予約にてご利用ください。"
            }
            onAccept={() => router.reload()}
            onDismiss={() => setIsShowRequireReloadErrorDialog(false)}
          />
        )}

        {/*Change Status Confirmation Popup*/}
        {isShowChangeStatusConfirmationDialog && (
          <WarningDialog
            text="はい"
            dismissText="いいえ"
            message="こちらのステータス変更はレジ締めを行う際や、POSとステータス不一致が起こった際に緊急対応で使用する機能です。変更してよろしいですか？"
            onAccept={handleAcceptChangeStatusConfirmation}
            onDismiss={() => setIsShowChangeStatusConfirmationDialog(false)}
          />
        )}

        {isShowChangeCancelledStatusDialog && (
          <AdminUpdateBookingStatusToCancelledDialog
            booking={changingStatusBooking}
            onDismiss={() => setIsShowChangeCancelledStatusDialog(false)}
            onError={(message) => setErrMsg(message)}
            onSuccess={handleAfterUpdateCancelledStatusSuccess}
          />
        )}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(BookingManagementList, [
  ROLE.ADMIN,
  ROLE.SUPER_ADMIN,
]);
