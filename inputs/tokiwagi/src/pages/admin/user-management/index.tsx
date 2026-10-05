import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { IconButton, Switch, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { User } from "@prisma/client";
import { isMatch } from "lodash";
import moment from "moment";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import AdminLayout from "components/common/AdminLayout";
import AdminButton from "components/common/Buttons/AdminButton";
import ConfirmationDialog from "components/common/ConfirmationDialog";
import DataGridPagination from "components/common/DataGridPagination";
import IndependencePagination from "components/common/DataGridPagination/IndependencePagination";
import Error from "components/common/Error";
import DatePickerField from "components/common/Fields/DatePickerField";
import TextInputField from "components/common/Fields/TextInputField";
import RequiredPermission from "components/common/RequiredPermission";
import { ROLE, SHORT_DATE } from "constants/common";
import { MESSAGES } from "constants/messages";
import { ROUTE } from "constants/route";
import { USER_CHECKED_OUT_INFO_CSV_COLUMNS, USER_COLUMNS, USER_COLUMNS_FOR_STAFF } from "constants/table";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { useCachedPagination } from "libs/hooks/useCachedPagination";
import { Staff } from "models/Entity";
import { ActivityType } from "models/enums";
import { countUsers, deleteUserById, fetchUsers, updateUser } from "services/api-client/admin/user.service";
import EyeIconImage from "statics/images/eye.svg";
import PencilIconImage from "statics/images/pencil.svg";
import TrashIconImage from "statics/images/trash.svg";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { trimFields } from "utils/common";
import { confirmCredentials, confirmPassword } from "utils/ui";
import { changeRouterQuery, deleteRouterQuery, getUrlQueryValue } from "utils/url";
import { checkIsLineUser, isStaff } from "utils/user";
import { resetStaffOrAdmin, selectStaffManagement, updateStaffOrAdmin } from "stores/reducers/staff-management";
import { getDiffOfDates } from "utils/date-time";
import { MAX_DOWNLOAD_USER_DAYS } from "constants/csv";
import { ERROR_MESSAGES } from "constants/errors";
import ErrorDialog from "components/common/ErrorDialog";

type FormData = {
  name: string;
  email: string;
  phone: string;
  startDate: Date | string;
  endDate: Date | string;
};

const REGISTRATION_STATUS = {
  VERIFIED: "本登録",
  UN_VERIFIED: "仮登録",
  LINE_MISSING_INFO: "LINEログイン",
};

function UserManagement() {
  // Variable
  const initFiltersRaw = getUrlQueryValue("filters");
  const initFilters = initFiltersRaw ? JSON.parse(initFiltersRaw) : null;
  const csvLink = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === ROLE.SUPER_ADMIN;
  const pagination = useCachedPagination({
    onPageChange: () => {
      fetchData();
    },
  });

  // State
  const staffOrAdminId = router.query.staffOrAdminId;
  const { staffOrAdmin: previousStaffOrAdmin } = useSelector(selectStaffManagement());

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isShowDeleteConfirmation, setIsShowDeleteConfirmation] = useState<boolean>(false);
  const [filters, setFilters] = useState<FormData>(initFilters);
  const [errMsg, setErrMsg] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalUser, setTotalUsers] = useState<number>(0);
  const [staffOrAdmin, setStaffOrAdmin] = useState<Staff | User>();
  const [userColumns, setUserColumns] = useState<GridColDef[]>([]);
  const [usersToDownload, setUsersToDownload] = useState<User[]>([]);
  const [isShowErrMsgDialog, setIsShowErrMsgDialog] = useState<boolean>(false);
  const [errDialogMsg, setErrDialogMsg] = useState<string>("");

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: initFilters,
  });

  // Effect
  useEffect(() => {
    fetchTotalDataCount();
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.itemsPerPage, filters]);

  useEffect(() => {
    const FULL_COLUMNS = [actionColumn, indexColumn, ...USER_COLUMNS, emailVerifiedColumn];
    const LIMITED_COLUMNS = [limitedActionColumn, indexColumn, ...USER_COLUMNS_FOR_STAFF, emailVerifiedColumn];

    if (isSuperAdmin) {
      return setUserColumns(FULL_COLUMNS);
    }

    if (staffOrAdmin) {
      dispatch(updateStaffOrAdmin(staffOrAdmin));
    }

    const currentStaffOrAdmin =
      staffOrAdmin || (staffOrAdminId && previousStaffOrAdmin && previousStaffOrAdmin.id.toString() === staffOrAdminId && previousStaffOrAdmin);

    // not show result for original admin
    if (currentStaffOrAdmin && currentStaffOrAdmin["email"]) {
      return setUserColumns([]);
    }

    if (currentStaffOrAdmin) {
      if (isStaff(currentStaffOrAdmin)) {
        isEmptyFilters() ? setUserColumns([]) : setUserColumns(LIMITED_COLUMNS);
      } else {
        setUserColumns(FULL_COLUMNS);
      }
    }
  }, [staffOrAdmin, staffOrAdminId]);

  const fetchTotalDataCount = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const response = await countUsers({ ...filters });
      setTotalUsers(response);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Function
  const onSubmit = (values: FormData) => {
    const trimValues = trimFields(values, ["name", "email", "phone"]);
    const filters = {
      ...trimValues,
      startDate: values.startDate ? moment(values.startDate).utc(true).format(SHORT_DATE) : null,
      endDate: values.endDate ? moment(values.endDate).utc(true).format(SHORT_DATE) : null,
      fromAction: ActivityType.SearchUser,
    };

    changeRouterQuery("filters", JSON.stringify(filters), router);
    changeRouterQuery("page", "1", router);
    deleteRouterQuery("staffOrAdminId", router);
    pagination.setPage(1);
    setFilters(filters);
  };

  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);
      const data = await fetchUsers({
        limit: pagination.itemsPerPage,
        page: pagination.page,
        userOrStaffId: staffOrAdmin?.id,
        ...filters,
      });
      setUsers(data);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const isEmptyFilters = () => {
    const EMPTY_FILTERS = {
      email: "",
      name: "",
      phone: "",
      endDate: null,
      startDate: null,
    };

    return !filters || isMatch(filters, EMPTY_FILTERS);
  };

  // Delete Dialog
  const showDeleteConfirmationDialog = (user: User) => {
    setSelectedUser(user);
    setIsShowDeleteConfirmation(true);
  };

  const hideDeleteConfirmationDialog = () => {
    setIsShowDeleteConfirmation(false);
  };

  const handleDelete = async (id) => {
    try {
      setErrMsg("");
      await deleteUserById(id);
      setSelectedUser(undefined);
      await Promise.all([fetchData(), fetchTotalDataCount()]);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsShowDeleteConfirmation(false);
      dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.DELETE_USER_SUCCESSFUL }));
    }
  };

  const redirectUserCreate = () => {
    router.push(ROUTE.CREATE_USER);
  };

  const redirectUserUpdate = (user: User) => {
    const query = {
      filters: JSON.stringify(filters),
      page: pagination.page,
    };

    (staffOrAdminId || staffOrAdmin) && (query["staffOrAdminId"] = staffOrAdmin?.id || staffOrAdminId);

    router.push({
      pathname: `${ROUTE.EDIT_USER}/${user.id}`,
      query,
    });
  };

  const handleClickCreate = async () => {
    try {
      await confirmPassword(dispatch);
      redirectUserCreate();
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickView = (user: User) => {
    const query = {
      filters: JSON.stringify(filters),
      page: pagination.page,
    };

    (staffOrAdmin || staffOrAdminId) && (query["staffOrAdminId"] = staffOrAdmin?.id || staffOrAdminId);

    router.push({
      pathname: `${ROUTE.VIEW_USER}/${user.id}`,
      query,
    });
  };

  const handleShowConfirmationPopup = async () => {
    const isLoggedOriginalAdmin = (staffOrAdmin && staffOrAdmin["email"]) || (!staffOrAdmin && previousStaffOrAdmin && previousStaffOrAdmin["email"]);
    if (isSuperAdmin || isLoggedOriginalAdmin) {
      await confirmPassword(dispatch);
    } else {
      const loggedStaffId = staffOrAdmin?.id || previousStaffOrAdmin?.id;
      await confirmCredentials(dispatch, loggedStaffId as string);
    }
  };

  const handleClickUpdate = async (user: User) => {
    try {
      await handleShowConfirmationPopup();
      redirectUserUpdate(user);
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickDelete = async (user: User) => {
    try {
      await handleShowConfirmationPopup();
      showDeleteConfirmationDialog(user);
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickDownload = async () => {
    try {
      await confirmPassword(dispatch);
      handleDownload();
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickUpdateForStaff = async (user: User) => {
    try {
      const staff = await confirmCredentials(dispatch, (staffOrAdmin?.id || staffOrAdminId) as string);
      router.push({
        pathname: `${ROUTE.EDIT_USER}/${user.id}`,
        query: {
          filters: JSON.stringify(filters),
          page: pagination.page,
          staffId: staff.id,
          ...((staffOrAdminId || staffOrAdmin) && { staffOrAdminId: staffOrAdmin?.id || staffOrAdminId }),
        },
      });
    } catch (e) {
      // Nothing here
    }
  };

  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "アクション",
    sortable: false,
    width: 172,
    align: "center",
    headerAlign: "center",
    renderCell: function (params) {
      return (
        <div>
          {/*View*/}
          <IconButton aria-label="view" onClick={() => handleClickView(params.row)}>
            <Image src={EyeIconImage} alt="view" />
          </IconButton>

          {/*Update*/}
          <IconButton aria-label="update" onClick={() => handleClickUpdate(params.row)}>
            <Image src={PencilIconImage} alt="update" />
          </IconButton>

          {/*Delete*/}
          <IconButton aria-label="delete" onClick={() => handleClickDelete(params.row)}>
            <Image src={TrashIconImage} alt="delete" />
          </IconButton>
        </div>
      );
    },
  };

  const limitedActionColumn: GridColDef = {
    field: "actions",
    headerName: "アクション",
    sortable: false,
    width: 142,
    align: "center",
    headerAlign: "center",
    renderCell: function (params) {
      return (
        <div>
          {/*Update*/}
          <IconButton aria-label="update" onClick={() => handleClickUpdateForStaff(params.row)}>
            <Image src={PencilIconImage} alt="update" />
          </IconButton>
        </div>
      );
    },
  };

  const getRowId = (user: User) => {
    return user.id;
  };

  const handleReset = () => {
    if (staffOrAdmin || previousStaffOrAdmin) {
      setUserColumns([]);
      dispatch(resetStaffOrAdmin());
    }

    deleteRouterQuery("filters", router);
    deleteRouterQuery("staffOrAdminId", router);
    reset({ name: "", email: "", phone: "", startDate: null, endDate: null });

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

  const fetchUsersToDownload = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const data = await fetchUsers({ ...filters, includeCheckoutInfo: true });
      const transformedUsers = data.map((user, index) => {
        const transformedUser = {};
        const csvColumns = [indexColumn, ...CSV_COLUMNS];
        for (const column of csvColumns) {
          if (column.field === "index") {
            transformedUser[column.field] = index + 1;
            continue;
          }

          transformedUser[column.field] = column.valueGetter ? column.valueGetter({ row: user } as any) : user[column.field];
        }

        return transformedUser;
      });

      setUsersToDownload(transformedUsers);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const isValidDateRangeForDownloadCSV = () => {
    const { startDate, endDate } = filters || {};

    if (!startDate || !endDate) {
      return false;
    }

    const { days } = getDiffOfDates(moment(startDate).toDate(), moment(endDate).toDate());

    return days + 1 <= MAX_DOWNLOAD_USER_DAYS;
  };

  const handleDownload = async () => {
    if (!isValidDateRangeForDownloadCSV()) {
      setErrDialogMsg(ERROR_MESSAGES.INVALID_RANGE_DATE_TO_DOWNLOAD_USER);
      setIsShowErrMsgDialog(true);
      return;
    }

    await fetchUsersToDownload();

    setTimeout(() => {
      csvLink.current.link.click();
    }, 0);
  };

  const updateEmailVerifiedStatus = async (user: User) => {
    try {
      await confirmPassword(dispatch);
    } catch (e) {
      return;
    }

    try {
      setErrMsg("");
      setLoading(true);
      user.emailVerified = user.emailVerified ? null : new Date();
      await updateUser(user.id, user);
      dispatch(
        showNotification({
          type: NotificationType.SUCCESS,
          message: MESSAGES.CHANGE_STATUS_SUCCESSFUL,
        })
      );
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      dispatch(
        showNotification({
          type: NotificationType.ERROR,
          message: message,
        })
      );
    } finally {
      await fetchData();
      setLoading(false);
    }
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
      return params.api.getRowIndex(params.id) + 1 + (pagination.page - 1) * pagination.itemsPerPage;
    },
  };

  const emailVerifiedColumn: GridColDef = {
    field: "emailVerified",
    headerName: "登録のステータス",
    headerAlign: "center",
    align: "center",
    sortable: false,
    filterable: false,
    minWidth: 150,
    valueGetter: (params) => {
      let status;
      if (checkIsLineUser(params.row)) {
        status = REGISTRATION_STATUS.LINE_MISSING_INFO;
      } else {
        status = params.row.emailVerified ? REGISTRATION_STATUS.VERIFIED : REGISTRATION_STATUS.UN_VERIFIED;
      }
      return status;
    },
    renderCell: function (params) {
      return (
        <div className="flex items-center justify-end w-full">
          {params.value != REGISTRATION_STATUS.LINE_MISSING_INFO && (
            <Switch checked={!!params.row.emailVerified} onChange={() => updateEmailVerifiedStatus(params.row)} />
          )}
          <label>{params.value}</label>
        </div>
      );
    },
  };

  const CSV_COLUMNS = [
    ...USER_COLUMNS,
    emailVerifiedColumn,
    ...USER_CHECKED_OUT_INFO_CSV_COLUMNS,
  ];

  const CSV_HEADERS = CSV_COLUMNS.map((item) => ({ label: item.headerName, key: item.field }));

  return (
    <AdminLayout breadcrumb={[{ title: "" }]}>
      <section className="relative text-gray-600 body-font">
        {/*Error*/}
        <Error message={errMsg} />

        {/* Filters Section */}
        <div className="py-6 my-6 ad-section-container">
          <div className="mr-4 text-right">
            <AdminButton startIcon={<AddCircleOutlineRoundedIcon />} onClick={handleClickCreate} variant="contained" className="!px-5 !py-4 !font-bold !mb-4">
              新規ユーザー登録
            </AdminButton>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-3 gap-20 mdup:px-24 mdonly:grid mdonly:grid-cols-1 mdonly:gap-4 mdonly:px-25 mdonly:mr-8 mdonly:ml-8 ">
              {/*Name*/}
              <div className="relative mb-4">
                <label htmlFor="name" className="block mb-2 label">
                  氏名
                </label>
                <TextInputField id="name" name="name" control={control} placeholder="ユーザー名" className="w-full px-3 py-1 ad-input-field" />
                {errors.name && <Error message={errors?.name.message} />}
              </div>

              {/*Email*/}
              <div className="relative mb-4">
                <label htmlFor="email" className="block mb-2 label">
                  メールアドレス
                </label>
                <TextInputField id="email" name="email" control={control} placeholder="aaaa@x.y" className="w-full px-3 py-1 ad-input-field" />
                {errors.email && <Error message={errors.email.message} />}
              </div>

              {/* Phone */}
              <div className="relative mb-4">
                <label htmlFor="phone" className="block mb-2 label">
                  電話番号
                </label>
                <TextInputField id="phone" name="phone" control={control} placeholder="080 1234 5678" className="w-full px-3 py-1 ad-input-field" />
                {errors.phone && <Error message={errors.phone.message} />}
              </div>
            </div>

            <div className="mx-24 mdonly:mx-8">
              <div className="flex items-start gap-16 mdonly:flex-col mdonly:gap-2">
                <p className="mb-2">登録日：</p>

                {/* Date From */}
                <div className="relative mb-4 mdonly:min-w-full grow">
                  <label className="block mb-2 label">期間開始</label>
                  <DatePickerField
                    name="startDate"
                    control={control}
                    disableFuture={true}
                    renderInput={(params) => <TextField {...params} className="flex justify-between w-full ad-input-field" />}
                  />
                </div>

                {/* Date To */}
                <div className="relative mb-4 mdonly:min-w-full grow">
                  <label className="block mb-2 label">期間終了</label>
                  <DatePickerField
                    name="endDate"
                    control={control}
                    disableFuture={true}
                    renderInput={(params) => <TextField {...params} className="flex justify-between w-full ad-input-field" />}
                  />
                </div>
              </div>
            </div>

            {/*Buttons*/}
            <div className="flex justify-center mt-9 mb-8">
              <div className="flex gap-8">
                <AdminButton variant="outlined" onClick={handleReset} className="w-[230px] h-[56px] mdonly:w-[195px] !font-bold">
                  リセット
                </AdminButton>
                <AdminButton onClick={handleClickSearch} variant="contained" className="w-[230px] h-[56px] mdonly:w-[175px] !font-bold">
                  検索する
                </AdminButton>
                <RequiredPermission roles={[ROLE.SUPER_ADMIN]}>
                  <AdminButton
                    variant="outlined"
                    className="w-[250px] h-[56px] mdonly:w-[205px] !font-bold flex items-center gap-6"
                    onClick={handleClickDownload}
                  >
                    <span className="text-xs">CSVファイル出力</span>
                    <SaveAltIcon />
                  </AdminButton>
                </RequiredPermission>
                <CSVLink data={usersToDownload} filename="data.csv" className="hidden" ref={csvLink} target="_blank" headers={CSV_HEADERS} />
              </div>
            </div>

            <RequiredPermission roles={[ROLE.ADMIN]}>
              <p className="text-center text-sm">※ユーザーデータの出力を希望する場合は本部に依頼してください。</p>
            </RequiredPermission>
          </form>
        </div>

        {/*Data */}
        {userColumns.length ? (
          <>
            <div className="mb-12 ad-section-container ad-table-wrapper">
              <DataGrid
                components={{ LoadingOverlay: LoadingSpinner, Pagination: DataGridPagination, NoRowsOverlay: () => null }}
                loading={loading}
                hideFooterSelectedRowCount
                autoHeight
                rows={users}
                getRowId={getRowId}
                columns={userColumns}
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
                rowCount={totalUser}
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

        {/*Delete Confirmation Dialog*/}
        {isShowDeleteConfirmation && (
          <ConfirmationDialog
            fullScreen
            title="ユーザーの削除"
            prefixMessage={`「${selectedUser?.name ? selectedUser.name : "ユーザー名"}」`}
            message="を削除しますがよろしいでしょうか？"
            onAccept={() => handleDelete(selectedUser.id)}
            onDismiss={hideDeleteConfirmationDialog}
          />
        )}

        {isShowErrMsgDialog && <ErrorDialog message={errDialogMsg} text="戻る" onDismiss={() => setIsShowErrMsgDialog(false)} />}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(UserManagement, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
