import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { News, Ticket } from "@prisma/client";
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
import { PAGE_SIZE, ROLE, ROWS_PER_PAGE_OPTIONS, SHORT_DATE_SLASH } from "constants/common";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { deleteNewsById, fetchNews } from "services/api-client/admin/news.service";
import PencilIconImage from "statics/images/pencil.svg";
import TrashIconImage from "statics/images/trash.svg";
import { confirmPassword } from "utils/ui";
import { getUrlQueryValue } from "utils/url";

function NewsManagement() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [errMsg, setErrMsg] = useState<string>();
  const [selectedNews, setSelectedNews] = useState<News | undefined>();
  const [isShowDeleteConfirmation, setIsShowDeleteConfirmation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const page = +getUrlQueryValue("page") || 1;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const news = await fetchNews();
      setNews(news);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirmationDialog = (news: News) => {
    setSelectedNews(news);
    setIsShowDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    try {
      setErrMsg("");
      await deleteNewsById(selectedNews.id);
      setSelectedNews(undefined);
      await fetchData();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsShowDeleteConfirmation(false);
    }
  };

  const handleClickAdd = async () => {
    try {
      await confirmPassword(dispatch);
      router.push(ROUTE.NEWS_MANAGEMENT_CREATE);
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickEdit = async (newsId: number | string) => {
    try {
      await confirmPassword(dispatch);
      router.push({ pathname: `${ROUTE.NEWS_MANAGEMENT_EDIT}/${newsId}`, query: { page } });
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickDelete = async (news: News) => {
    try {
      await confirmPassword(dispatch);
      showDeleteConfirmationDialog(news);
    } catch (e) {
      // Nothing here
    }
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
        <div className="flex gap-4">
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

  const getRowId = (ticket: Ticket) => {
    return ticket.id;
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
            新しいお知らせ追加
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
            rows={news}
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
            title="お知らせの削除"
            message="お知らせを削除しますがよろしいでしょうか？"
            onAccept={handleDelete}
            onDismiss={() => setIsShowDeleteConfirmation(false)}
          />
        )}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(NewsManagement, [ROLE.SUPER_ADMIN]);

const COLUMNS: GridColDef[] = [
  {
    field: "date",
    headerName: "掲載日時",
    cellClassName: "wrap-cell",
    sortable: false,
    width: 192,
    valueGetter: (params) => moment(params.row.date).format(SHORT_DATE_SLASH),
  },
  {
    field: "title",
    headerName: "タイトル",
    width: 305,
    sortable: false,
    cellClassName: "wrap-cell",
  },
  {
    field: "content",
    headerName: "掲載内容",
    sortable: false,
    flex: 1,
  },
];
