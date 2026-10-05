import { PaymentType, TicketType } from "@prisma/client";
import axios from "axios";

import { IResponse } from "models/Response";
import { TicketPayload } from "models/Ticket";

const APIs = {
  TICKETS: "/api/admin/tickets",
  TICKETS_COUNT: "/api/admin/tickets/count",
  HAS_BOOKING: "/api/admin/tickets/has-booking",
  TICKET_BOOKING_SCHEDULES: "/api/admin/ticket-booking-schedules",
  TICKET_BOOKING_SCHEDULES_HAS_BOOKING: "/api/admin/ticket-booking-schedules/has-booking",
};

export type GetTicketsParams = {
  page?: number;
  limit?: number;
  tenantCode?: string;
  includeSlaveTickets?: boolean;
  includeHasBooking?: boolean;
  canBookInAdvance?: boolean;
  paymentType?: PaymentType;
  ticketTypes?: TicketType[];
  excludeExpiredSchedule?: boolean;
};

export const fetchTickets = async (params?: GetTicketsParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.TICKETS, { params });
  return data.data;
};

export const fetchTicketsCount = async (params?: GetTicketsParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.TICKETS_COUNT, { params });
  return data.data;
};

export const fetchTicketById = async (id: number, params?: GetTicketsParams) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.TICKETS}/${id}`, { params });
  return data.data;
};

export const createTicket = async (ticket: TicketPayload) => {
  const { data }: { data: IResponse } = await axios.post(APIs.TICKETS, ticket);
  return data;
};

export const updateTicket = async (ticketId, payload) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.TICKETS}/${ticketId}`, payload);
  return data;
};

export const updateTicketVideoUrl = async (ticketId, videoUrl: string) => {
  const { data }: { data: IResponse } = await axios.patch(`${APIs.TICKETS}/${ticketId}`, { videoUrl });
  return data;
};

export const deleteTicketById = async (ticketId: number) => {
  const { data }: { data: IResponse } = await axios.delete(`${APIs.TICKETS}/${ticketId}`);
  return data;
};

export const backfillObicCodesForTicket = async (ticketId: number) => {
  const { data }: { data: IResponse } = await axios.post(`${APIs.TICKETS}/${ticketId}/backfill-obic-codes`);
  return data;
};

export const createTicketBookingSchedules = async (payload) => {
  const { data }: { data: IResponse } = await axios.post(APIs.TICKET_BOOKING_SCHEDULES, payload);
  return data;
};

export const updateTicketBookingSchedules = async (payload) => {
  const { data }: { data: IResponse } = await axios.put(APIs.TICKET_BOOKING_SCHEDULES, payload);
  return data;
};

export const checkHasBooking = async (ticketId: number) => {
  const { data }: { data: IResponse } = await axios.get(APIs.HAS_BOOKING, { params: { ticketId } });
  return data.data;
};

export const checkTicketBookingScheduleHasBooking = async (ticketBookingScheduleId: number) => {
  const { data }: { data: IResponse } = await axios.get(APIs.TICKET_BOOKING_SCHEDULES_HAS_BOOKING, { params: { ticketBookingScheduleId } });
  return data.data;
};
