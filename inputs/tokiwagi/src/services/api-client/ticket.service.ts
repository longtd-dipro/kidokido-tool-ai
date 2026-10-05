import { PaymentType, TicketType } from "@prisma/client";
import axios from "axios";
import qs from "qs";

import { IResponse } from "models/Response";
import { SourcePage } from "models/common";

const APIs = {
  TICKETS: "/api/tickets",
  TICKETS_SUPPORTED: "/api/tickets-supported",
};

export type FetchTicketParams = {
  canBookInAdvance?: boolean;
  tenantCode?: string;
  paymentType?: PaymentType;
  ticketTypes?: TicketType[];
  hasBookingSchedule?: boolean;
  sort_by?: string;
  hasSlaveTenants?: boolean;
  sourcePage?: SourcePage;
};

export type FetchSupportedTicketParams = {
  visibility?: boolean;
  includeTenant?: boolean;
  hasBookingSchedule?: boolean;
  hasTodayBookingSchedule?: boolean;
};

export const fetchTickets = async (params?: FetchTicketParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.TICKETS, {
    params,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
  });
  return data.data;
};

export const fetchTicketById = async (id: number) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.TICKETS}/${id}`);
  return data.data;
};

export const fetchSupportedTicketsByMasterTicketId = async (masterTicketId: number, params?: FetchSupportedTicketParams) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.TICKETS_SUPPORTED}/${masterTicketId}`, {
    params,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
  });
  return data.data;
};
