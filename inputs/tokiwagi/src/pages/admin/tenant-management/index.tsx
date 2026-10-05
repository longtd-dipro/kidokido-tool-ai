import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import moment from "moment";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import AdminLayout from "components/common/AdminLayout";
import AdminButton from "components/common/Buttons/AdminButton";
import TextInputField from "components/common/Fields/TextInputField";
import ConfirmationDialog from "components/common/ConfirmationDialog";
import IndependencePagination from "components/common/DataGridPagination/IndependencePagination";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import Error from "components/common/Error";
import { ROLE, ROWS_PER_PAGE_OPTIONS, SHORT_TIME, PAGE_SIZE } from "constants/common";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { Tenant } from "models/Entity";
import { deleteTenant, fetchTenants, countTenants } from "services/api-client/admin/tenant.service";
import { confirmPassword } from "utils/ui";
import EyeIconImage from "statics/images/eye.svg";
import SearchIcon from "statics/images/search-icon.svg";
import TrashIconImage from "statics/images/trash.svg";
import PencilIconImage from "statics/images/pencil.svg";
import LockOpenIcon from "statics/images/lock-open.svg";
import LockClosedIcon from "statics/images/lock-closed.svg";
import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import { changeRouterQuery, getUrlQueryValue } from "utils/url";
import { unlockAccount } from "services/api-client/auth.service";

type FormData = {
  code: string;
};

function TenantManagement() {
  const initFiltersRaw = getUrlQueryValue("filters");
  const initFilters = initFiltersRaw ? JSON.parse(initFiltersRaw) : null;
  const initPage = +getUrlQueryValue("page") || 1;

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>();
  const [isShowDeleteConfirmation, setIsShowDeleteConfirmation] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();
  const [filters, setFilters] = useState<FormData>(initFilters);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(initPage);
  const [limit, setLimit] = useState<number>(PAGE_SIZE);
  const [totalTenant, setTotalTenants] = useState<number>(0);
  const router = useRouter();
  const dispatch = useDispatch();

  const { handleSubmit, control } = useForm<FormData>({
    defaultValues: initFilters,
  });

  const onSubmit = (values) => {
    const filters = values;

    changeRouterQuery("filters", JSON.stringify(filters), router);

    setFilters(filters);
  };

  useEffect(() => {
    fetchTotalDataCount();
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [page, limit, filters]);

  const fetchTotalDataCount = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const response = await countTenants({ ...filters });
      setTotalTenants(response);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);
      const data = await fetchTenants({ limit: limit, page: page, ...filters });
      setTenants(data);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirmationDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsShowDeleteConfirmation(true);
  };

  const hideDeleteConfirmationDialog = () => {
    setIsShowDeleteConfirmation(false);
  };

  const handleClickAdd = async () => {
    try {
      await confirmPassword(dispatch);
      router.push(ROUTE.CREATE_TENANT);
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickEdit = async (tenant: Tenant) => {
    try {
      await confirmPassword(dispatch);
      router.push({ pathname: `${ROUTE.EDIT_TENANT}/${tenant.code}`, query: { filters: JSON.stringify(filters), page } });
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickDelete = async (tenant: Tenant) => {
    try {
      await confirmPassword(dispatch);
      showDeleteConfirmationDialog(tenant);
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickUnlock = async (tenant: Tenant) => {
    try {
      await confirmPassword(dispatch);
      handleUnlock(tenant.AdminTenant.User.token);
    } catch (e) {
      // Nothing here
    }
  };

  const handleUnlock = async (userToken: string) => {
    try {
      setErrMsg("");
      await unlockAccount({ token: userToken });
      dispatch(
        showNotification({
          type: NotificationType.SUCCESS,
          message: MESSAGES.UNLOCK_TENANT_ACCOUNT_SUCCESSFUL,
        })
      );
      fetchData();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsShowDeleteConfirmation(false);
    }
  };

  const handleDelete = async () => {
    try {
      setErrMsg("");
      await deleteTenant(selectedTenant.code);
      setSelectedTenant(undefined);
      dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.DELETE_TENANT_SUCCESSFUL }));
      fetchData();
      fetchTotalDataCount();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsShowDeleteConfirmation(false);
    }
  };

  const formatDate = (date: string) => {
    return moment(date).format(SHORT_TIME);
  };

  const getRowId = (tenant: Tenant) => {
    return tenant.code;
  };

  const handleClickView = (tenant: Tenant) => {
    router.push({ pathname: `${ROUTE.VIEW_TENANT}/${tenant.code}`, query: { filters: JSON.stringify(filters), page } });
  };

  const openedAtColumn: GridColDef = {
    field: "open",
    headerName: "開店時間",
    sortable: false,
    width: 142,
    renderCell: function (params) {
      return (
        <div>
          <div>{params.row.openedAt ? formatDate(params.row.openedAt) : ""}</div>
        </div>
      );
    },
  };

  const closedAtColumn: GridColDef = {
    field: "close",
    headerName: "終了時間",
    sortable: false,
    width: 142,
    renderCell: function (params) {
      return (
        <div>
          <div>{params.row.closedAt ? formatDate(params.row.closedAt) : ""}</div>
        </div>
      );
    },
  };

  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "アクション",
    sortable: false,
    align: "center",
    headerAlign: "center",
    width: 250,
    renderCell: function (params) {
      const tenant = params.row as Tenant;
      const isLockedAdmin = tenant.AdminTenant?.User?.locked;
      return (
        <div>
          {/*View*/}
          <IconButton aria-label="details" onClick={() => handleClickView(params.row)}>
            <Image src={EyeIconImage} alt="details" />
          </IconButton>

          {/*Update*/}
          <IconButton aria-label="update" onClick={() => handleClickEdit(params.row)}>
            <Image src={PencilIconImage} alt="update" />
          </IconButton>

          {/*Delete*/}
          <IconButton aria-label="delete" onClick={() => handleClickDelete(params.row)}>
            <Image src={TrashIconImage} alt="delete" />
          </IconButton>

          {/*Unlock*/}
          <IconButton aria-label="delete" onClick={() => handleClickUnlock(params.row)} disabled={!isLockedAdmin}>
            <Image src={isLockedAdmin ? LockClosedIcon : LockOpenIcon} alt="delete" />
          </IconButton>
        </div>
      );
    },
  };

  return (
    <AdminLayout>
      <section className="flex flex-col justify-center">
        {/*Error*/}
        <Error message={errMsg} />
        <div className="flex flex-col mdup:flex-row mdup:gap-[74px] mdup:items-center mb-[24px] mdoly:flex-row">
          <div className="flex flex-col grow justify-between py-[10px] px-[9px] mdonly:mt-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex md:justify-center justify-end">
                <TextInputField
                  id="code"
                  name="code"
                  control={control}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Image src={SearchIcon} alt="search" />
                      </InputAdornment>
                    ),
                    className: "ad-input-field !bg-[#FFFFFF] !px-[16px] min-w-[696px] md:min-w-[568px]",
                    endAdornment: (
                      <InputAdornment position="end">
                        <AdminButton type="submit" variant="outlined" className="w-[140px] h-[36px] !font-bold">
                          検索する
                        </AdminButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            </form>
          </div>
          {/*Toolbar*/}
          <div className="w-30 flex justify-end ">
            <AdminButton
              startIcon={<AddCircleOutlineRoundedIcon />}
              type="button"
              variant="contained"
              className="w-[200px] h-[56px] !font-bold"
              onClick={handleClickAdd}
            >
              新規施設登録
            </AdminButton>
          </div>
        </div>

        {/*Data*/}
        <div className="ad-section-container ad-table-wrapper">
          <DataGrid
            components={{
              LoadingOverlay: LoadingSpinner,
              NoRowsOverlay: () => null,
            }}
            loading={loading}
            autoHeight
            rows={tenants}
            getRowId={getRowId}
            columns={[actionColumn, ...COLUMNS, openedAtColumn, closedAtColumn]}
            pageSize={limit}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            hideFooter={true}
            disableColumnFilter
            disableColumnMenu
          />
        </div>
        <div className="p-4">
          <IndependencePagination
            page={page}
            defaultPageSize={limit}
            rowCount={totalTenant}
            onChange={(newPage, pageSize) => {
              if (newPage !== page) {
                setPage(newPage);
                changeRouterQuery("page", `${newPage}`, router);
              }
              if (pageSize !== limit) {
                setLimit(pageSize);
              }
            }}
          />
        </div>

        {/*Delete Dialog*/}
        {isShowDeleteConfirmation && (
          <ConfirmationDialog
            title="施設の削除"
            message="削除すると戻すことができませんが、<br>よろしいでしょうか？"
            onAccept={handleDelete}
            onDismiss={hideDeleteConfirmationDialog}
          />
        )}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(TenantManagement, [ROLE.SUPER_ADMIN]);

const COLUMNS: GridColDef[] = [
  {
    field: "id",
    headerName: "No",
    width: 74,
    valueGetter: (params) => params.api.getRowIndex(params.id) + 1,
    sortable: false,
  },
  {
    field: "code",
    headerName: "施設コード",
    width: 142,
    sortable: false,
  },
  {
    field: "name",
    headerName: "施設名",
    cellClassName: "wrap-cell",
    width: 220,
    sortable: false,
  },
  {
    field: "phone",
    headerName: "電話番号",
    width: 162,
    sortable: false,
  },
  {
    field: "postCode",
    headerName: "郵便番号",
    width: 142,
    sortable: false,
  },
  {
    field: "address",
    headerName: "住所",
    width: 210,
    sortable: false,
    renderCell: (params: any) => (
      <Tooltip title={params.row.address}>
        <span className="truncate-cell">{params.row.address}</span>
      </Tooltip>
    ),
  },
];
