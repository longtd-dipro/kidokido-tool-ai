import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { IconButton, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Staff, User } from "@prisma/client";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";

import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import AdminButton from "components/common/Buttons/AdminButton";
import ConfirmationDialog from "components/common/ConfirmationDialog";
import DataGridPagination from "components/common/DataGridPagination";
import IndependencePagination from "components/common/DataGridPagination/IndependencePagination";
import Error from "components/common/Error";
import TextInputField from "components/common/Fields/TextInputField";
import { ROLE } from "constants/common";
import { MESSAGES } from "constants/messages";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { useCachedPagination } from "libs/hooks/useCachedPagination";
import { countStaffs, deleteStaffById, fetchStaffs } from "services/api-client/admin/staff.service";
import PencilIconImage from "statics/images/pencil.svg";
import TrashIconImage from "statics/images/trash.svg";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { trimFields } from "utils/common";
import { confirmPassword } from "utils/ui";
import { changeRouterQuery, deleteRouterQuery, getUrlQueryValue } from "utils/url";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import { Tenant } from "models/Entity";
import { fetchTenants } from "services/api-client/admin/tenant.service";
import { enableCredentialsRequired } from "stores/reducers/staff-management";
import { getStaffRoleLabel } from "utils/user";

type FormData = {
  name: string;
  tenantCode: string;
};

function StaffManagement() {
  // Variable
  const csvLink = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const initFiltersRaw = getUrlQueryValue("filters");
  const initFilters = initFiltersRaw ? JSON.parse(initFiltersRaw) : null;
  const isSuperAdmin = session?.user?.role === ROLE.SUPER_ADMIN;

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
  } = useForm<FormData>({
    defaultValues: initFilters,
  });

  // State
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>();
  const [isShowDeleteConfirmation, setIsShowDeleteConfirmation] = useState<boolean>(false);
  const [filters, setFilters] = useState<FormData>(initFilters);
  const [errMsg, setErrMsg] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalStaffs, setTotalStaffs] = useState<number>(0);
  const [staffsToDownload, setStaffsToDownload] = useState<Staff[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Function
  const onSubmit = (values: FormData) => {
    const trimValues = trimFields(values, ["name", "tenantCode"]);
    const filters = {
      ...trimValues,
    };

    changeRouterQuery("filters", JSON.stringify(filters), router);
    changeRouterQuery("page", "1", router);
    pagination.setPage(1);
    setFilters(filters);
  };

  // Effect
  useEffect(() => {
    fetchTotalDataCount();
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.itemsPerPage, filters]);

  useEffect(() => {
    fetchTenantsData();
    dispatch(enableCredentialsRequired());
  }, []);

  const fetchTotalDataCount = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const response = await countStaffs({ ...filters });
      setTotalStaffs(response);
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
      const data = await fetchStaffs({ limit: pagination.itemsPerPage, page: pagination.page, ...filters });
      setStaffs(data);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantsData = async () => {
    try {
      setErrMsg("");
      const data = await fetchTenants();
      setTenants(data);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const showDeleteConfirmationDialog = () => {
    setIsShowDeleteConfirmation(true);
  };

  const hideDeleteConfirmationDialog = () => {
    setIsShowDeleteConfirmation(false);
  };

  const handleDelete = async (staffId: string) => {
    try {
      setErrMsg("");
      setIsDeleting(true);

      await deleteStaffById(staffId);

      dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.DELETE_STAFF_SUCCESSFUL }));

      await Promise.all([fetchData(), fetchTotalDataCount()]);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsShowDeleteConfirmation(false);
      setSelectedStaff(undefined);
      setIsDeleting(false);
    }
  };

  const handleClickCreate = async () => {
    try {
      await confirmPassword(dispatch);
      router.push(ROUTE.STAFF_MANAGEMENT_CREATE);
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickUpdate = async (user: User) => {
    try {
      await confirmPassword(dispatch);
      router.push({
        pathname: `${ROUTE.STAFF_MANAGEMENT_EDIT}/${user.id}`,
        query: {
          filters: JSON.stringify(filters),
          page: pagination.page,
        },
      });
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickDelete = async (staff: Staff) => {
    try {
      await confirmPassword(dispatch);
      setSelectedStaff(staff);
      showDeleteConfirmationDialog();
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

  const getRowId = (user: User) => {
    return user.id;
  };

  const handleReset = () => {
    deleteRouterQuery("filters", router);
    reset({ name: "", tenantCode: "" });

    setFilters(null);
    pagination.setPage(1);
  };

  const fetchStaffsToDownload = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const data = await fetchStaffs({ ...filters });
      const transformedStaffs = data.map((user, index) => {
        const transformedStaff = {};
        const csvColumns = [indexColumn, ...STAFF_COLUMNS];
        for (const column of csvColumns) {
          if (column.field === "index") {
            transformedStaff[column.field] = index + 1;
            continue;
          }

          transformedStaff[column.field] = column.valueGetter ? column.valueGetter({ row: user } as any) : user[column.field];
        }

        return transformedStaff;
      });

      setStaffsToDownload(transformedStaffs);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    await fetchStaffsToDownload();

    setTimeout(() => {
      csvLink?.current?.link.click();
    }, 0);
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

  const CSV_HEADERS = [indexColumn, ...STAFF_COLUMNS].map((item) => ({ label: item.headerName, key: item.field }));

  // Render
  return (
    <section className="relative text-gray-600 body-font">
      {/* Error */}
      <Error message={errMsg} />

      {/* Filters Section */}
      <div className="py-6 my-6 ad-section-container">
        <div className="mr-4 text-right">
          <AdminButton startIcon={<AddCircleOutlineRoundedIcon />} onClick={handleClickCreate} variant="contained" className="!px-5 !py-4 !font-bold !mb-4">
            新規従業員登録
          </AdminButton>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center gap-8 mdup:px-24 mdonly:grid mdonly:grid-cols-1 mdonly:gap-4 mdonly:px-25 mdonly:mr-8 mdonly:ml-8 ">
            {/* Name */}
            <div className={`relative mb-4 ${isSuperAdmin ? "w-[300px]" : "w-[540px]"} `}>
              <label className="block mb-2 label">氏名</label>
              <TextInputField id="name" name="name" control={control} placeholder="従業員名" className="w-full px-3 py-1 ad-input-field" />
              {errors.name && <Error message={errors?.name.message} />}
            </div>

            {/* Tenant */}
            {isSuperAdmin && (
              <div className="relative mb-4 w-[500px]">
                <label className="block mb-2 label">施設名</label>
                <AutocompleteField
                  defaultValue={filters?.tenantCode ?? null}
                  name="tenantCode"
                  className="block w-full !border-0 ad-input-field "
                  control={control}
                  options={tenants?.map((item) => item.code)}
                  getOptionLabel={(option) => tenants?.find((item) => item.code === option)?.name || ""}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="施設名" className="block w-full ad-input-field" inputProps={{ ...params.inputProps, readOnly: true }} />
                  )}
                />
                {errors.tenantCode && <Error message={errors.tenantCode.message} />}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-center mt-9 mb-8">
            <div className="flex gap-8">
              <AdminButton variant="outlined" onClick={handleReset} className="w-[230px] h-[56px] mdonly:w-[195px] !font-bold">
                リセット
              </AdminButton>
              <AdminButton type="submit" variant="contained" className="w-[230px] h-[56px] mdonly:w-[175px] !font-bold">
                検索する
              </AdminButton>
              <AdminButton variant="outlined" className="w-[250px] h-[56px] mdonly:w-[205px] !font-bold flex items-center gap-6" onClick={handleClickDownload}>
                <span className="text-xs">CSVファイル出力</span>
                <SaveAltIcon />
              </AdminButton>
              <CSVLink data={staffsToDownload} filename="data.csv" className="hidden" ref={csvLink} target="_blank" headers={CSV_HEADERS} />
            </div>
          </div>
        </form>
      </div>

      {/* Data */}
      <div className="mb-12 ad-section-container ad-table-wrapper">
        <DataGrid
          components={{ LoadingOverlay: LoadingSpinner, Pagination: DataGridPagination, NoRowsOverlay: () => null }}
          loading={loading}
          hideFooterSelectedRowCount
          autoHeight
          rows={staffs}
          getRowId={getRowId}
          columns={[actionColumn, indexColumn, ...STAFF_COLUMNS]}
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
          rowCount={totalStaffs}
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

      {/* Delete Confirmation Dialog */}
      {isShowDeleteConfirmation && (
        <ConfirmationDialog
          isSubmitting={isDeleting}
          fullScreen
          title="従業員の削除"
          prefixMessage={""}
          message={`<strong>「${selectedStaff?.name}」</strong>を削除しますがよろしいでしょうか？`}
          onAccept={() => handleDelete(selectedStaff.id)}
          onDismiss={hideDeleteConfirmationDialog}
        />
      )}
    </section>
  );
}

export default withAuthentication(StaffManagement, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);

const STAFF_COLUMNS: GridColDef[] = [
  {
    field: "id",
    headerName: "従業員ID",
    sortable: false,
    width: 200,
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
    field: "role",
    headerName: "権限",
    sortable: false,
    width: 200,
    valueGetter: (params) => getStaffRoleLabel(params.row?.role),
  },
  {
    field: "tenantCode",
    headerName: "店舗ID",
    sortable: false,
    width: 230,
    valueGetter: (params) => params.row?.tenantCode,
  },
];
