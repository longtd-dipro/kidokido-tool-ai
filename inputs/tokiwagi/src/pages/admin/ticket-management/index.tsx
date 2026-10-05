import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { IconButton, TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Ticket as PrismaTicket } from "@prisma/client";
import moment from "moment";
import Image from "next/legacy/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import AdminLayout from "components/common/AdminLayout";
import AdminButton from "components/common/Buttons/AdminButton";
import ConfirmationDialog from "components/common/ConfirmationDialog";
import DataGridPagination from "components/common/DataGridPagination";
import Error from "components/common/Error";
import RequiredPermission from "components/common/RequiredPermission";
import { CalendarIcon } from "statics/images/components/CalendarIcon";
import { MAX_LENGTH_TICKET_CODE, PAGE_SIZE, ROLE, ROWS_PER_PAGE_OPTIONS } from "constants/common";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { deleteTicketById, fetchTickets, fetchTicketsCount } from "services/api-client/admin/ticket.service";
import EyeIconImage from "statics/images/eye.svg";
import PencilIconImage from "statics/images/pencil.svg";
import TrashIconImage from "statics/images/trash.svg";
import AddItemIconImage from "statics/images/icon-duplicate-outline.svg";
import { confirmPassword } from "utils/ui";
import { getAgeLabel, getTicketTypeLabel } from "utils/ticket";
import { PAYMENT_TYPE_OPTIONS, VISIBILITY_OPTIONS } from "constants/ticket";
import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import { buildQueryString, changeRouterQuery, getUrlQueryValue } from "utils/url";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import { Tenant } from "models/Entity";
import { fetchTenants } from "services/api-client/admin/tenant.service";
import { getMessageFromError } from "utils/common";
import { isMasterMonthlyTicket } from "utils/booking";
import TicketParentIconImage from "statics/images/ticket-parent-icon.svg";
import TicketChildIconImage from "statics/images/ticket-child-icon.svg";
import SeparatorHeaderIconImage from "statics/images/separator-column-header-icon.svg";

import styles from "./index.module.scss";

type FormData = {
  tenantCode: string;
  page: number;
  limit: number;
}

enum ROW_COLOR {
  PRIMARY,
  SECONDARY,
}

type Ticket = PrismaTicket & {
  rowColor: ROW_COLOR;
}

function TicketManagement() {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const isInitialRender = useRef(true);
  const initFiltersRaw = getUrlQueryValue("filters");
  const initFilters = initFiltersRaw ? JSON.parse(initFiltersRaw) : null;
  const [page, setPage] = useState<number>(+getUrlQueryValue("page") || 1);
  const startRowColor = useRef(ROW_COLOR.PRIMARY);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsCount, setTicketsCount] = useState<number>(0);
  const [errMsg, setErrMsg] = useState<string>();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>();
  const [isShowDeleteConfirmation, setIsShowDeleteConfirmation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<FormData>(initFilters);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const isSuperAdmin = session?.user?.role === ROLE.SUPER_ADMIN;
  const HEAD_COLUMNS = isSuperAdmin ? [GROUP_TICKET_COLUMN] : [];

  const { handleSubmit, control, watch } = useForm<FormData>({
    defaultValues: initFilters,
  });

  const currentTenantCode = watch("tenantCode");

  const [obicSelectedDate, setObicSelectedDate] = useState<Date>(moment().toDate());

  useEffect(() => {
    fetchDataCount();
    fetchData();
  }, [filters]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return; // Skip the initial execution
    }
    fetchData();
  }, [page]);

  useEffect(() => {
    isSuperAdmin && fetchTenantList();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      let tickets = await fetchTickets({ ...filters, page, limit: PAGE_SIZE });
      tickets = augmentRowColorForTickets(tickets);

      setTickets(tickets);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataCount = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const count = await fetchTicketsCount({ ...filters });
      setTicketsCount(count);
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

  const onPageChange = (pageNumber: number) => {
    // Get last row color of current page for first row color of next page
    startRowColor.current = tickets[tickets.length - 1].rowColor;
    setPage(pageNumber + 1);
  };

  const showDeleteConfirmationDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsShowDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    try {
      setErrMsg("");
      await deleteTicketById(selectedTicket.id);
      setSelectedTicket(undefined);
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
      router.push(ROUTE.CREATE_TICKET);
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickAddDuplicate = async (ticketId: number | string) => {
    try {
      await confirmPassword(dispatch);
      router.push({ pathname: `${ROUTE.CREATE_TICKET}`, query: { ticketId, page, filters: JSON.stringify(filters) } });
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickView = async (ticketId: number | string) => {
    try {
      await confirmPassword(dispatch);
      router.push({ pathname: `${ROUTE.VIEW_TICKET}/${ticketId}`, query: { page, filters: JSON.stringify(filters) } });
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickEdit = async (ticketId: number | string) => {
    try {
      await confirmPassword(dispatch);
      router.push({ pathname: `${ROUTE.EDIT_TICKET}/${ticketId}`, query: { page, filters: JSON.stringify(filters) } });
    } catch (e) {
      // Nothing here
    }
  };

  const handleClickDelete = async (ticket: Ticket) => {
    try {
      await confirmPassword(dispatch);
      showDeleteConfirmationDialog(ticket);
    } catch (e) {
      // Nothing here
    }
  };

  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "アクション",
    sortable: false,
    width: 200,
    align: "center",
    headerAlign: "center",
    renderCell: function (params) {
      return (
        <div>
          {/*Add Duplicate*/}
          <RequiredPermission roles={[ROLE.SUPER_ADMIN]}>
            <IconButton aria-label="add" onClick={() => handleClickAddDuplicate(params.id)}>
              <Image src={AddItemIconImage} alt="add-duplicate" />
            </IconButton>
          </RequiredPermission>

          {/*View*/}
          <IconButton aria-label="view" onClick={() => handleClickView(params.id)}>
            <Image src={EyeIconImage} alt="view" />
          </IconButton>

          {/*Update*/}
          <IconButton aria-label="update" onClick={() => handleClickEdit(params.id)}>
            <Image src={PencilIconImage} alt="update" />
          </IconButton>

          <RequiredPermission roles={[ROLE.SUPER_ADMIN]}>
            {/*Delete*/}
            <IconButton aria-label="delete" onClick={() => handleClickDelete(params.row)}>
              <Image src={TrashIconImage} alt="delete" />
            </IconButton>
          </RequiredPermission>
        </div>
      );
    },
  };

  const getRowId = (ticket: Ticket) => {
    return ticket.id;
  };

  const handleObicExport = () => {
    const startDate = moment(obicSelectedDate).startOf("day").toISOString();
    const endDate = moment(obicSelectedDate).endOf("day").toISOString();
    const queryString = buildQueryString({ startDate, endDate, tenantCode: isSuperAdmin ? currentTenantCode : session?.user?.tenantCode });
    const url = `/api/admin/tickets/obic-codes/export?${queryString}`;
    window.open(url, "_blank");
  };

  const onSubmit = (values: FormData) => {
    const filters = values;
    changeRouterQuery("filters", JSON.stringify(filters), router);
    changeRouterQuery("page", "1", router);
    setFilters(filters);
  };

  const augmentRowColorForTickets = (tickets: Ticket[]) => {
    const getGroupId = (ticket: Ticket) => ticket.groupId?.split("_")[0];
    const groupIds = Array.from(new Set(tickets.map(getGroupId)));
    const startColor = startRowColor.current;
    const nextColor = startRowColor.current === ROW_COLOR.PRIMARY ? ROW_COLOR.SECONDARY : ROW_COLOR.PRIMARY;

    const groupIdsColors = groupIds.reduce((acc, groupId, index) => {
      acc[groupId] = index % 2 === 0 ? startColor : nextColor;
      return acc;
    }, {});

    tickets.forEach(ticket => {
      ticket.rowColor = groupIdsColors[getGroupId(ticket)];
    });

    return tickets;
  };

  return (
    <AdminLayout>
      <section className="flex flex-col justify-center">
        {/*Error*/}
        <Error message={errMsg} />

        <div className="flex items-start gap-[74px] mb-8">
          <div className="flex items-center gap-8 w-full">
            <div className="grow flex flex-col gap-4 w-full md:w-3/4">
              {isSuperAdmin && (
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Search tenant  */}
                  <div className="flex items-center gap-8 w-full">
                    <div className="relative flex items-center w-2/3">
                      <label className="block label min-w-[100px]">施設名</label>
                      <AutocompleteField
                        name="tenantCode"
                        className="block w-full !border-0 ad-input-field "
                        control={control}
                        options={tenants?.map((item) => item.code)}
                        getOptionLabel={(option) => tenants?.find((item) => item.code === option)?.name || ""}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="あ"
                            className="block w-full ad-input-field !bg-white"
                            inputProps={{ ...params.inputProps, readOnly: true }}
                          />
                        )}
                      />
                    </div>
                    <AdminButton type="submit" variant="outlined" className="w-[200px] h-[36px] !p-[12px] !font-bold">
                      検索する
                    </AdminButton>
                  </div>
                </form>
              )}
              {/* Obic CSV Export */}
              <div className="flex items-center gap-8 w-full">
                <div className="relative flex items-center w-2/3">
                  <label className="block label min-w-[100px]">日付選択</label>
                  <DesktopDatePicker
                    value={obicSelectedDate}
                    onChange={(val) => val && setObicSelectedDate(moment(val).toDate())}
                    mask="____/__/__"
                    PopperProps={{ disablePortal: true }}
                    components={{ OpenPickerIcon: CalendarIcon }}
                    renderInput={(params) => <TextField {...params} className="flex justify-between w-full ad-input-field !bg-white" />}
                  />
                </div>
                <AdminButton
                  variant="outlined"
                  className="w-[200px] h-[36px] !p-0 !font-bold flex items-center justify-center gap-2"
                  onClick={handleObicExport}
                  sx={{ textTransform: "none" }}
                >
                  OBIC用Excel出力
                </AdminButton>
              </div>
            </div>
          </div>

          {/*Toolbar*/}
          <div className="max-w-30">
            <RequiredPermission roles={[ROLE.SUPER_ADMIN]}>
              <AdminButton
                startIcon={<AddCircleOutlineRoundedIcon />}
                type="button"
                variant="contained"
                className="w-[200px] h-[56px] !font-bold"
                onClick={handleClickAdd}
              >
                新規商品追加
              </AdminButton>
            </RequiredPermission>
          </div>
        </div>

        {/*Note*/}
        {isSuperAdmin &&
          <div className="flex mb-2">
            <div>
              <Image src={TicketParentIconImage} alt="master ticket icon" />
            </div>
            <span className="ml-2">マスター商品</span>
            <div className="mx-4">
              <Image src={SeparatorHeaderIconImage} alt="separator icon" />
            </div>

            <div>
              <Image src={TicketChildIconImage} alt="slave ticket icon" />
            </div>
            <span className="ml-2">マスターと繋がっている商品</span>
          </div>
        }

        {/*Data */}
        <div className="ad-table-wrapper">
          <DataGrid
            components={{ LoadingOverlay: LoadingSpinner, Pagination: DataGridPagination }}
            componentsProps={{ pagination: { needToSetQueryString: true } }}
            loading={loading}
            hideFooterSelectedRowCount
            disableColumnFilter
            disableColumnMenu
            autoHeight
            rows={tickets}
            rowCount={ticketsCount}
            getRowId={getRowId}
            columns={[...HEAD_COLUMNS, actionColumn, ...COLUMNS]}
            getRowClassName={(params) => {
              const rowClassName = params.row.rowColor === ROW_COLOR.PRIMARY ? styles.rowPrimary : styles.rowSecondary;
              return rowClassName;
            }}
            pageSize={PAGE_SIZE}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            page={page - 1}
            paginationMode="server"
            onPageChange={onPageChange}
          />
        </div>

        {/*Delete Dialog*/}
        {isShowDeleteConfirmation && (
          <ConfirmationDialog
            title="商品の削除"
            message="操作を進めるために、パスワード入力が必要です。"
            onAccept={handleDelete}
            onDismiss={() => setIsShowDeleteConfirmation(false)}
          />
        )}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(TicketManagement, [ROLE.SUPER_ADMIN, ROLE.ADMIN]);

const COLUMNS: GridColDef[] = [
  {
    field: "no",
    headerName: "No",
    sortable: false,
    width: 74,
    valueGetter: (params) => params.api.getRowIndex(params.id) + 1,
  },
  {
    field: "tenantName",
    headerName: "施設名",
    cellClassName: "wrap-cell",
    sortable: false,
    width: 220,
    valueGetter: (params) => params.row.Tenant?.name,
  },
  {
    field: "name",
    headerName: "商品名",
    width: 250,
    sortable: false,
    cellClassName: "wrap-cell",
  },
  {
    field: "hasBookingSchedule",
    headerName: "予約枠",
    width: 250,
    sortable: false,
    cellClassName: "wrap-cell",
    valueGetter: (params) => {
      if (isMasterMonthlyTicket(params.row)) {
        return "";
      } else {
        return params.row.TicketBookingSchedule?.length > 0 ? "設定済み" : "未設定";
      }
    }
  },
  {
    field: "adultTicketCode",
    headerName: "おとな商品コード",
    sortable: false,
    width: 192,
    valueFormatter: ({ value }) => {
      return value.toString().padStart(MAX_LENGTH_TICKET_CODE, "0");
    },
  },
  {
    field: "childTicketCode",
    headerName: "子ども商品コード",
    sortable: false,
    width: 192,
    valueFormatter: ({ value }) => {
      return value.toString().padStart(MAX_LENGTH_TICKET_CODE, "0");
    },
  },
  {
    field: "type",
    headerName: "商品のタイプ",
    sortable: false,
    width: 192,
    valueGetter: (params) => getTicketTypeLabel(params.row),
  },
  {
    field: "visibility",
    headerName: "公開ステータス",
    sortable: false,
    width: 192,
    valueGetter: (params) => VISIBILITY_OPTIONS.find((item) => item.value === params.row.visibility).label,
  },
  {
    field: "child-age-range",
    headerName: "対象年齢",
    sortable: false,
    width: 192,
    valueGetter: (params) => `${getAgeLabel(params.row.childAgeLimitFrom)}~${getAgeLabel(params.row.childAgeLimitTo)}`,
  },
  {
    field: "maxChildPerAdult",
    headerName: "1組の予約構成",
    sortable: false,
    width: 192,
    valueGetter: (params) => `1おとな、${params.row.maxChildPerAdult}子ども`,
  },
  {
    field: "paymentType",
    headerName: "精算タイプ",
    sortable: false,
    width: 192,
    valueGetter: (params) => PAYMENT_TYPE_OPTIONS.find((item) => item.value === params.row.paymentType).label,
  },
];

const GROUP_TICKET_COLUMN: GridColDef = {
  field: "group",
  headerName: "",
  align: "center",
  headerAlign: "center",
  sortable: false,
  width: 60,
  renderCell: function (params) {
    const ticket = params.row;
    const groupImageIcon = isMasterMonthlyTicket(ticket) ? TicketParentIconImage : (ticket.masterTicketId ? TicketChildIconImage : null);
    return (
      <div className="flex justify-center items-center">
        {groupImageIcon && <Image src={groupImageIcon} alt="group" />}
      </div>
    );
  }
};
