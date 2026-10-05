import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import moment from "moment";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import AdminLayout from "components/common/AdminLayout";
import AdminButton from "components/common/Buttons/AdminButton";
import ManageVacanciesDialog from "components/BookingVacancies/ManageVacanciesDialog";
import IndependencePagination from "components/common/DataGridPagination/IndependencePagination";
import Error from "components/common/Error";
import { JP_SHORT_DATE_WITH_DAYS, ROLE, ROWS_PER_PAGE_OPTIONS, SHORT_DATE_SLASH } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { fetchBookingVacancies } from "services/api-client/admin/booking-vacancies.service";
import PencilIconImage from "statics/images/pencil.svg";
import { BookingVacancy, TicketVacancies } from "models/Booking";
import { MESSAGES } from "constants/messages";
import { updateTicketBookingScheduleById } from "services/api-client/admin/booking.service";
import { NotificationType, showNotification } from "stores/reducers/notification";
import LoadingSpinner from "components/common/Admin/LoadingSpinner";

import styles from "./index.module.scss";

function BookingVacancies() {
  const [bookingVacancies, setBookingVacancies] = useState<BookingVacancy[]>([]);
  const [bookingVacancySelected, setBookingVacancySelected] = useState<BookingVacancy>(undefined);
  const [isShowUpdateVacancies, setIsShowUpdateVacancies] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [currentDate] = useState<Date>(new Date());
  const dispatch = useDispatch();

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const refreshData = async () => {
    await fetchData();
  };

  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const data = await fetchBookingVacancies();
      setBookingVacancies(data);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const showManageVacanciesDialog = (row: BookingVacancy) => {
    setBookingVacancySelected(row);
    setIsShowUpdateVacancies(true);
  };

  const hideManageVacanciesDialog = () => {
    setIsShowUpdateVacancies(false);
  };

  const updateMaxBookingPeopleForTickets = async (ticketVacancies: TicketVacancies[]) => {
    try {
      setErrMsg("");
      setLoading(true);

      for (let i = 0; i < ticketVacancies.length; i++) {
        const ticketVacancy = ticketVacancies[i];
        await updateTicketBookingScheduleById(ticketVacancy.ticketBookingScheduleId, { maxBookingPeople: ticketVacancy.maxBookingPeople });
      }

      hideManageVacanciesDialog();
      dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.UPDATE_VACANCIES_SUCCESSFUL }));

      refreshData();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const getRowId = (bookingVacancy: BookingVacancy) => {
    return bookingVacancy.date;
  };

  const generateTicketColumns = (bookingVacancies: BookingVacancy[]): GridColDef[] => {
    const tickets = bookingVacancies[0]?.tickets || [];
    return tickets.map((ticket, index): GridColDef => {
      return {
        field: `tickets_${index}`,
        headerName: ticket.name,
        cellClassName: "ticket-cell",
        width: 220,
        sortable: false,
        filterable: false,
        renderCell: function (params) {
          const rowIndex = params.api.getRowIndex(params.id);
          const rowData = bookingVacancies[rowIndex].tickets[index];
          return (
            <div className={`w-full h-full px-[10px] flex items-center ${rowData.ticketBookingScheduleId ? "" : "bg-[#CBCBCF]"}`}>
              <div className="flex text-base leading-[20px] font-medium">
                <p className="text-[#FF0000]">{rowData.waitingPeople}/</p>
                <p>{rowData.checkedInPeople}/</p>
                <p>{rowData.accessiblePeople}/</p>
                <p>{isNil(rowData.maxBookingPeople) ? "-" : rowData.maxBookingPeople}</p>
              </div>
            </div>
          );
        },
      };
    });
  };

  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "アクション",
    sortable: false,
    align: "center",
    headerAlign: "center",
    width: 173,
    renderCell: function (params) {
      return (
        <div>
          {/*Update*/}
          <IconButton aria-label="update" onClick={() => showManageVacanciesDialog(params.row)}>
            <Image src={PencilIconImage} alt="update" />
          </IconButton>
        </div>
      );
    },
  };
  return (
    <AdminLayout heading="在庫調整" breadcrumb={[{ title: "I順番待ち・受付管理" }, { title: "在庫調整" }]}>
      <section className="flex flex-col justify-center">
        {/*Error*/}
        <Error message={errMsg} />

        {/*Data*/}
        <div className={`ad-section-container ad-table-wrapper ${styles.bookingVacancies}`}>
          <div className="relative flex-col min-h-[75px] w-30 flex justify-between mt-[20px] mb-[10px] mx-[10px] xs:text-[14px] xs:leading-[16px]">
            <div className="flex justify-center mx-auto items-center w-64 h-12 text-base leading-5 md:text-sm md:leading-4 border border-[#006DC6] rounded-md">
              {moment(currentDate).format(JP_SHORT_DATE_WITH_DAYS)}
            </div>
            <div className="flex justify-between text-lg leading-6 md:text-sm md:leading-4">
              <div className="flex justify-start items-center">
                <p className="text-[#FF0000]">(順番待ち人数、</p>
                <p>入場者数、</p>
                <p>予約者数、</p>
                <p>割り当て在庫数）</p>
              </div>
              <div className="flex justify-end items-end">
                <AdminButton
                  type="button"
                  variant="outlined"
                  className="w-[170px] h-10 md:w-[125px] md:h-9 md:!text-sm md:!p-0 !rounded-[4px]"
                  onClick={refreshData}
                >
                  リフレッシュ
                </AdminButton>
              </div>
            </div>
          </div>
          <DataGrid
            components={{
              LoadingOverlay: LoadingSpinner,
            }}
            loading={loading}
            hideFooterSelectedRowCount
            autoHeight
            rows={bookingVacancies}
            getRowId={getRowId}
            columns={[actionColumn, ...COLUMNS, ...generateTicketColumns(bookingVacancies)]}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            rowCount={bookingVacancies.length}
            hideFooter={true}
            disableColumnFilter
            disableColumnMenu
          />
        </div>
        <div className="p-4">
          <IndependencePagination
            page={page}
            defaultPageSize={limit}
            rowCount={bookingVacancies.length}
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

        {/*Update Max Booking People*/}
        {isShowUpdateVacancies && bookingVacancies && (
          <ManageVacanciesDialog bookingVacancy={bookingVacancySelected} onDismiss={hideManageVacanciesDialog} onSubmit={updateMaxBookingPeopleForTickets} />
        )}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(BookingVacancies, [ROLE.ADMIN]);

const COLUMNS: GridColDef[] = [
  {
    field: "date",
    headerName: "日付",
    width: 192,
    sortable: false,
    filterable: false,
    valueGetter: (params) => moment(params.row?.date).format(SHORT_DATE_SLASH),
  },
  {
    field: "totalMaxBookingPeople",
    headerName: "総在庫数",
    width: 192,
    sortable: false,
    filterable: false,
    renderCell: function (params) {
      return (
        <div>
          <div className="flex text-base leading-[20px] font-medium">
            <p className="text-[#FF0000]">{params.row.waitingPeople}/</p>
            <p>{params.row.checkedInPeople}/</p>
            <p>{params.row.totalAccessiblePeople}/</p>
            <p>{params.row.totalMaxBookingPeople}</p>
          </div>
        </div>
      );
    },
  },
];
