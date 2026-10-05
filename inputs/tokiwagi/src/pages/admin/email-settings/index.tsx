import { IconButton, Switch } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { EmailSetting } from "@prisma/client";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

import EditIconImage from "statics/images/edit.svg";
import AdminLayout from "components/common/AdminLayout";
import DataGridPagination from "components/common/DataGridPagination";
import Error from "components/common/Error";
import { PAGE_SIZE, ROLE, ROWS_PER_PAGE_OPTIONS } from "constants/common";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { fetchEmailSettings, updateEmailSetting } from "services/api-client/admin/email-setting.service";
import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import { confirmPassword } from "utils/ui";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import { getUrlQueryValue } from "utils/url";

function EmailSettings() {
  const [emailSettings, setEmailSetting] = useState<EmailSetting[]>([]);
  const [errMsg, setErrMsg] = useState<string>("");

  const page = +getUrlQueryValue("page") || 1;
  const router = useRouter();

  const dispatch = useDispatch();

  const fetchData = async () => {
    try {
      setErrMsg("");
      const emailSettings = await fetchEmailSettings();
      setEmailSetting(emailSettings);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const redirectEditEmailSetting = (id: any) => {
    router.push({ pathname: `${ROUTE.EDIT_EMAIL_SETTING}/${id}`, query: { page } });
  };

  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "アクション",
    headerAlign: "center",
    align: "center",
    sortable: false,
    filterable: false,
    minWidth: 150,
    renderCell: function (params) {
      return (
        <div className="flex justify-center items-center">
          {/*Update*/}
          <IconButton aria-label="update" onClick={() => redirectEditEmailSetting(params?.id)}>
            <Image src={EditIconImage} alt="detail" />
          </IconButton>
        </div>
      );
    },
  };

  const switchStatus = async (emailSetting: EmailSetting) => {
    try {
      await confirmPassword(dispatch);
      emailSetting.active = !emailSetting.active;
      await updateEmailSetting(emailSetting);
      dispatch(
        showNotification({
          type: NotificationType.SUCCESS,
          message: MESSAGES.CHANGE_STATUS_SUCCESSFUL,
        })
      );
      await fetchData();
    } catch (e) {
      return;
    }
  };

  const onOffColumn: GridColDef = {
    field: "active",
    headerName: "送信のON/OFF",
    headerAlign: "center",
    align: "center",
    sortable: false,
    filterable: false,
    minWidth: 150,
    renderCell: function (params) {
      return (
        <div className="flex justify-center items-center">
          <Switch checked={params.row.active} onChange={() => switchStatus(params.row)} />
          <label>{params.row.active ? "ON" : "OFF"}</label>
        </div>
      );
    },
  };

  const getRowId = (emailSetting: EmailSetting) => {
    return emailSetting.emailKey;
  };

  return (
    <AdminLayout heading="自動返信メール設定" breadcrumb={[{ title: "" }]}>
      <section className="relative text-gray-600 body-font">
        {/*Error*/}
        <Error message={errMsg} />

        {/*Data */}
        <div className="ad-table-wrapper">
          <DataGrid
            components={{ LoadingOverlay: LoadingSpinner, Pagination: DataGridPagination }}
            componentsProps={{ pagination: { needToSetQueryString: true } }}
            hideFooterSelectedRowCount
            rows={emailSettings}
            getRowId={getRowId}
            autoHeight
            columns={[actionColumn, onOffColumn, ...COLUMNS]}
            pageSize={PAGE_SIZE}
            scrollbarSize={5}
            pagination
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            disableColumnFilter
            disableColumnMenu
            page={page - 1}
          />
        </div>
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(EmailSettings, [ROLE.SUPER_ADMIN]);

const COLUMNS: GridColDef[] = [
  {
    field: "emailKey",
    headerName: "メールID",
    minWidth: 192,
    flex: 1,
    sortable: false,
    filterable: false,
  },
  {
    field: "name",
    headerName: "メール名",
    minWidth: 233,
    sortable: false,
    filterable: false,
    flex: 1,
  },
  {
    field: "title",
    headerName: "タイトル",
    minWidth: 278,
    sortable: false,
    filterable: false,
    flex: 1,
  },
  {
    field: "content",
    headerName: "コンテンツ",
    minWidth: 311,
    flex: 1,
    sortable: false,
    filterable: false,
  },
];
