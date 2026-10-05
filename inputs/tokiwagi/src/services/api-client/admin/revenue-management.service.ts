import { TicketType } from "@prisma/client";
import axios from "axios";
import qs from "qs";

import { IResponse } from "models/Response";
import { ActivityType, RevenueStatus } from "models/enums";

const APIs = {
  REVENUES_INFORMATION: "/api/admin/revenue-management",
  COUNT_RECORD: "/api/admin/revenue-management/count",
  TICKETS: "/api/admin/tickets",
};

export type GetBookingParams = {
  tenantCode?: string;
  ticketId?: number;
  revenueStatus?: RevenueStatus;
  fromDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  fromAction?: ActivityType;
  userOrStaffId?: string | number;
};

export const fetchBookings = async (params?: GetBookingParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.REVENUES_INFORMATION, { params });
  return data.data;
};

export const fetchRecordCount = async (params?) => {
  const { data }: { data: IResponse } = await axios.get(APIs.COUNT_RECORD, { params });
  return data.data;
};

export const fetchTickets = async (params?: { tenantCode?: string; ticketTypes?: TicketType[] }) => {
  const { data }: { data: IResponse } = await axios.get(APIs.TICKETS, {
    params,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
  });
  return data.data;
};
