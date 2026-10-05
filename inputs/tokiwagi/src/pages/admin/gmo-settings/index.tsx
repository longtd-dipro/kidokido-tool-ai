import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { GMOSetting } from "@prisma/client";
import moment from "moment";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import AdminLayout from "components/common/AdminLayout";
import AdminButton from "components/common/Buttons/AdminButton";
import ConfirmationDialog from "components/common/ConfirmationDialog";
import DataGridPagination from "components/common/DataGridPagination";
import Error from "components/common/Error";
import ErrorDialog from "components/common/ErrorDialog";
import { PAGE_SIZE, ROLE, ROWS_PER_PAGE_OPTIONS, SHORT_DATE_SLASH } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { deleteGMOSetting, fetchGMOSettings } from "services/api-client/admin/gmo-setting.service";
import EyeIconImage from "statics/images/eye.svg";
import PencilIconImage from "statics/images/pencil.svg";
import TrashIconImage from "statics/images/trash.svg";
import { confirmPassword } from "utils/ui";
import { getUrlQueryValue } from "utils/url";

function GMOSettingsManagement() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [gmoSettings, setGMOSettings] = useState<GMOSetting[]>([]);
  const [errMsg, setErrMsg] = useState<string>();
  const [selectedGMOSetting, setSelectedGMOSetting] = useState<GMOSetting | undefined>();
  const [isShowDeleteConfirmation, setIsShowDeleteConfirmation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const [dialogErrMsg, setDialogErrMsg] = useState<string>();

  const page = +getUrlQueryValue("page") || 1;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const gmoSettings = await fetchGMOSettings();
      setGMOSettings(gmoSettings);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const showErrorDialog = () => setIsShowErrorDialog(true);
  const hideErrorDialog = () => setIsShowErrorDialog(false);

  const showDeleteConfirmationDialog = (gmoSetting: GMOSetting) => {
    setSelectedGMOSetting(gmoSetting);
    setIsShowDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    try {
      setErrMsg("");
      await deleteGMOSetting(selectedGMOSetting.id);
      setSelectedGMOSetting(undefined);
      await fetchData();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      if (message === ERROR_MESSAGES.CANNOT_DELETE_GMO_SETTING) {
        setDialogErrMsg(message);
        showErrorDialog();
        return;
      }
      setErrMsg(message);
    } finally {
      setIsShowDeleteConfirmation(false);
    }
  };

  const handleClickAdd = async () => {
    try {
      await confirmPassword(dispatch);
      router.push(ROUTE.GMO_SETTINGS_CREATE);
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickEdit = async (id: number | string) => {
    try {
      await confirmPassword(dispatch);
      router.push({ pathname: `${ROUTE.GMO_SETTINGS_EDIT}/${id}`, query: { page } });
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickDelete = async (gmoSetting: GMOSetting) => {
    try {
      await confirmPassword(dispatch);
      showDeleteConfirmationDialog(gmoSetting);
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickView = (gmoSetting: GMOSetting) => {
    router.push({ pathname: `${ROUTE.GMO_SETTINGS_VIEW}/${gmoSetting.id}`, query: { page } });
  };

  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "アクション",
    sortable: false,
    width: 174,
    align: "center",
    headerAlign: "center",
    renderCell: function (params) {
      return (
        <div className="flex gap-1">
          {/*View*/}
          <IconButton aria-label="details" onClick={() => handleClickView(params.row)}>
            <Image src={EyeIconImage} alt="details" />
          </IconButton>

          {/*Update*/}
          <IconButton aria-label="update" onClick={() => handleClickEdit(params.id)}>
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

  const getRowId = (gmoSetting: GMOSetting) => {
    return gmoSetting.id;
  };

  return (
    <AdminLayout>
      <section className="flex flex-col justify-center">
        {/*Error*/}
        <Error message={errMsg} />

        {/*Toolbar*/}
        <div className="flex justify-end mb-5 w-30">
          <AdminButton
            startIcon={<AddCircleOutlineRoundedIcon />}
            type="button"
            variant="contained"
            className="w-[220px] h-[56px] !font-bold !p-0"
            onClick={handleClickAdd}
          >
            新規登録
          </AdminButton>
        </div>

        {/*Data */}
        <div className="ad-table-wrapper">
          <DataGrid
            components={{ LoadingOverlay: LoadingSpinner, Pagination: DataGridPagination }}
            componentsProps={{ pagination: { needToSetQueryString: true } }}
            loading={loading}
            hideFooterSelectedRowCount
            autoHeight
            rows={gmoSettings}
            getRowId={getRowId}
            columns={[actionColumn, ...COLUMNS]}
            pageSize={PAGE_SIZE}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            disableColumnFilter
            disableColumnMenu
            localeText={{
              noRowsLabel: "データーがありません",
            }}
            page={page - 1}
          />
        </div>

        {/*Delete Dialog*/}
        {isShowDeleteConfirmation && (
          <ConfirmationDialog
            title="GMOアカウントの削除"
            message="こちらのGMOアカウントを削除しますがよろしいでしょうか？"
            onAccept={handleDelete}
            onDismiss={() => setIsShowDeleteConfirmation(false)}
          />
        )}

        {/*Error Dialog*/}
        {isShowErrorDialog && <ErrorDialog message={dialogErrMsg} text="OK" onDismiss={hideErrorDialog} />}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(GMOSettingsManagement, [ROLE.SUPER_ADMIN]);

const COLUMNS: GridColDef[] = [
  {
    field: "name",
    headerName: "アカウント名",
    cellClassName: "wrap-cell",
    sortable: false,
    width: 205,
  },
  {
    field: "shopId",
    headerName: "ショップID",
    width: 305,
    sortable: false,
    cellClassName: "wrap-cell",
  },
  {
    field: "shopPass",
    headerName: "ショップパスワード",
    sortable: false,
    flex: 1,
    renderCell: () => <span className="truncate-cell">＊＊＊＊＊＊＊</span>,
  },
  {
    field: "createdAt",
    headerName: "登録日",
    cellClassName: "wrap-cell",
    sortable: false,
    width: 192,
    valueGetter: (params) => moment(params.row.createdAt).format(SHORT_DATE_SLASH),
  },
];
