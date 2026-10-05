import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { AppSetting } from "@prisma/client";
import { Button, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { Add } from "@mui/icons-material";

import Layout from "components/common/Layout";
import { deleteAppSetting, fetchAppSettings } from "services/api-client/admin/app-setting.service";
import Error from "components/common/Error";
import ConfirmationDialog from "components/common/ConfirmationDialog";
import { PAGE_SIZE, ROLE, ROWS_PER_PAGE_OPTIONS } from "constants/common";
import CreateOrUpdateAppSetting from "components/CreateOrUpdateAppSetting";
import { withAuthentication } from "libs/hoc/withAuthentication";
import styles from "styles/app-setting.module.scss";

function AppSettings() {
  const [appSettings, setAppSettings] = useState<AppSetting[]>([]);
  const [selectedAppSetting, setSelectedAppSetting] = useState<AppSetting | undefined>();
  const [isShowDeleteConfirmation, setIsShowDeleteConfirmation] = useState<boolean>(false);
  const [isShowCreateOrUpdateDialog, setIsShowCreateOrUpdateDialog] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setErrMsg("");
      const appSettings = await fetchAppSettings();
      setAppSettings(appSettings);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const showDeleteConfirmationDialog = (appSetting: AppSetting) => {
    setSelectedAppSetting(appSetting);
    setIsShowDeleteConfirmation(true);
  };

  const hideDeleteConfirmationDialog = () => {
    setIsShowDeleteConfirmation(false);
  };

  const showCreateDialog = () => {
    setSelectedAppSetting(undefined);
    setIsShowCreateOrUpdateDialog(true);
  };

  const showUpdateDialog = (appSetting: AppSetting) => {
    setSelectedAppSetting(appSetting);
    setIsShowCreateOrUpdateDialog(true);
  };

  const hideCreateOrUpdateDialog = () => {
    setSelectedAppSetting(undefined);
    setIsShowCreateOrUpdateDialog(false);
  };

  const onSaveSuccess = () => {
    setSelectedAppSetting(undefined);
    setIsShowCreateOrUpdateDialog(false);
    fetchData();
  };

  const handleDelete = async () => {
    try {
      setErrMsg("");
      await deleteAppSetting(selectedAppSetting.settingKey);
      setSelectedAppSetting(undefined);
      await fetchData();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsShowDeleteConfirmation(false);
    }
  };

  const actionColumn: GridColDef = {
    field: "",
    headerName: "Actions",
    width: 160,
    renderCell: function (params) {
      return (
        <div>
          {/*Update*/}
          <IconButton aria-label="update" onClick={() => showUpdateDialog(params.row)}>
            <EditOutlined />
          </IconButton>

          {/*Delete*/}
          <IconButton aria-label="delete" onClick={() => showDeleteConfirmationDialog(params.row)}>
            <DeleteIcon />
          </IconButton>
        </div>
      );
    },
  };

  const getRowId = (appSetting: AppSetting) => {
    return appSetting.settingKey;
  };

  return (
    <Layout>
      <section className="relative text-gray-600 body-font">
        {/*Error*/}
        <Error message={errMsg} />
        {/*Toolbar*/}
        <div className="flex justify-end">
          <Button startIcon={<Add />} onClick={showCreateDialog}>
            {" "}
            Add New
          </Button>
        </div>
        {/*Data */}
        <div className={styles.list}>
          <DataGrid
            rows={appSettings}
            getRowId={getRowId}
            columns={[...COLUMNS, actionColumn]}
            pageSize={PAGE_SIZE}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          />
        </div>
        {/*Delete Dialog*/}
        {isShowDeleteConfirmation && <ConfirmationDialog onAccept={handleDelete} onDismiss={hideDeleteConfirmationDialog} />}
        {/*Create Or Update Dialog*/}
        {isShowCreateOrUpdateDialog && <CreateOrUpdateAppSetting appSetting={selectedAppSetting} onSuccess={onSaveSuccess} onHide={hideCreateOrUpdateDialog} />}
      </section>
    </Layout>
  );
}

export default withAuthentication(AppSettings, [ROLE.SUPER_ADMIN]);

const COLUMNS: GridColDef[] = [
  {
    field: "settingKey",
    headerName: "Setting Key",
    width: 90,
  },
  {
    field: "name",
    headerName: "Name",
    width: 150,
  },
  {
    field: "value",
    headerName: "Value",
    width: 150,
  },
  {
    field: "dataType",
    headerName: "Data Type",
    width: 110,
  },
];
