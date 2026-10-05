import axios from "axios";

import { BookingQuantityFormData } from "models/Booking";
import { Booking } from "models/Entity";
import { IResponse } from "models/Response";
import { UserForm } from "models/UserForm";

import { FetchTicketParams } from "./ticket.service";

type FetchMonthlyTicketsParams = {
  page?: number;
  limit?: number;
  tenantCode?: string;
  isAvailable?: boolean;
  includeCancelledStatus?: boolean;
  includeDeadlineDate?: boolean;
  includeSupportedTenant?: boolean;
  onlyIncludeSupportedTenantIfAlreadyUseTheFirstTime?: boolean;
};

type FetchTotalMonthlyTicketsParams = {
  includeCancelledStatus?: boolean;
};

type FetchTimesLimitTicketsParams = {
  page?: number;
  limit?: number;
  tenantCode?: string;
  isAvailable?: boolean;
  includeCancelledStatus?: boolean;
  includeDeadlineDate?: boolean;
  includeSupportedTenant?: boolean;
  onlyIncludeSupportedTenantIfAlreadyUseTheFirstTime?: boolean;
};

type FetchTotalTimesLimitTicketsParams = {
  includeCancelledStatus?: boolean;
};

type CheckAlreadyUsedMonthlyTicketsParams = {
  tenantCode: string;
};

type RequestReCheckInPayload = {
  barCode: string;
  isMustWaiting: boolean;
  blacklistBookingIds?: number[];
};

type FetchHistoryListParams = {
  date?: string | Date;
  fromDate?: string | Date;
};

const APIs = {
  USER: "/api/user",
  MONTHLY_TICKETS: "/api/user/bookings/monthly-tickets",
  MONTHLY_TICKETS_COUNT: "/api/user/bookings/monthly-tickets/count",
  MONTHLY_TICKET_CHECK_ALREADY_USED: "/api/user/bookings/monthly-tickets/check-already-used-across-tenants",
  TIMES_LIMIT_TICKETS: "/api/user/bookings/times-limit-tickets",
  TIMES_LIMIT_TICKETS_COUNT: "/api/user/bookings/times-limit-tickets/count",
  TENANT_FAVORITES: "/api/user/tenant-favorites",
  COUNT_TENANT_FAVORITES: "/api/user/tenant-favorites/count",
  SEARCH_CREDIT_CARD: "/api/user/credit-card/search",
  SAVE_CREDIT_CARD: "/api/user/credit-card/save",
  DELETE_CREDIT_CARD: "/api/user/credit-card/delete",
  HISTORY_LIST: "/api/user/bookings",
  LAST_BOOKING: "/api/user/bookings/last-booking",
  CANCEL_BOOKING: "/api/user/bookings/cancel",
  CHECK_REQUIRED_INFORMATION: "/api/user/check-required-info",
  MONTHLY_BOOKING_EXTRA_INFO: "/api/user/bookings/monthly-tickets/extra-info",
  EDIT_EMAIL_USER: "/api/user/edit-email",
  REQUEST_RE_CHECK_IN: "/api/user/bookings/request-re-check-in",
  CHECK_EXISTING_EMAIL: "/api/user/check-existing-email",
  PARTIAL_CHECKOUT_BOOKING: "/api/user/bookings/partial-checkout",
};

export const fetchUser = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.USER);
  return data.data;
};

export const updateUser = async (values: UserForm) => {
  const { data }: { data: IResponse } = await axios.put(APIs.USER, values);
  return data.data;
};

export const deleteUser = async () => {
  const { data }: { data: IResponse } = await axios.delete(APIs.USER);
  return data.data;
};

export const fetchHistoryList = async (params: FetchHistoryListParams) => {
  const { date, fromDate } = params;
  const { data }: { data: IResponse<Booking[]> } = await axios.get(APIs.HISTORY_LIST, { params: { date, fromDate } });
  return data.data;
};

export const fetchHistoryDetail = async (id: number) => {
  const { data }: { data: IResponse<Booking> } = await axios.get(`${APIs.HISTORY_LIST}/${id}`);
  return data.data;
};

export const fetchMonthlyTickets = async (params: FetchMonthlyTicketsParams) => {
  const { data }: { data: IResponse<Booking[]> } = await axios.get(APIs.MONTHLY_TICKETS, { params });
  return data.data;
};

export const checkMonthlyTicketCheckAlreadyUsed = async (params: CheckAlreadyUsedMonthlyTicketsParams) => {
  const { data }: { data: IResponse<boolean> } = await axios.get(APIs.MONTHLY_TICKET_CHECK_ALREADY_USED, { params });
  return data.data;
};

export const fetchTotalMonthlyTickets = async (params?: FetchTotalMonthlyTicketsParams) => {
  const { data }: { data: IResponse<number> } = await axios.get(APIs.MONTHLY_TICKETS_COUNT, { params });
  return data;
};

export const fetchTimesLimitTickets = async (params: FetchTimesLimitTicketsParams) => {
  const { data }: { data: IResponse<Booking[]> } = await axios.get(APIs.TIMES_LIMIT_TICKETS, { params });
  return data.data;
};

export const fetchTotalTimesLimitTickets = async (params?: FetchTotalTimesLimitTicketsParams) => {
  const { data }: { data: IResponse<number> } = await axios.get(APIs.TIMES_LIMIT_TICKETS_COUNT, { params });
  return data;
};

export const addFavorite = async (tenantCode: string) => {
  const { data }: { data: IResponse } = await axios.post(`${APIs.TENANT_FAVORITES}/${tenantCode}`);
  return data.data;
};

export const removeFavorite = async (tenantCode: string) => {
  const { data }: { data: IResponse } = await axios.delete(`${APIs.TENANT_FAVORITES}/${tenantCode}`);
  return data.data;
};

export const fetchTenantFavorites = async (params?: { page?: number; limit?: number, includeTenant?: boolean }) => {
  const { data }: { data: IResponse } = await axios.get(APIs.TENANT_FAVORITES, { params });
  return data.data;
};

export const fetchTotalTenantFavorites = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.COUNT_TENANT_FAVORITES);
  return data.data;
};

export const fetchCreditCard = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.SEARCH_CREDIT_CARD);
  return data.data;
};

export const saveCreditCard = async (token: string, cardSeq: string, shouldNotify = false) => {
  const { data }: { data: IResponse } = await axios.post(APIs.SAVE_CREDIT_CARD, { token, cardSeq, shouldNotify });
  return data.data;
};

export const deleteCreditCard = async (cardSeq: string) => {
  const { data }: { data: IResponse } = await axios.post(APIs.DELETE_CREDIT_CARD, { cardSeq });
  return data.data;
};

export const fetchLastBooking = async (params?: FetchTicketParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.LAST_BOOKING, { params });
  return data.data;
};

export const cancelBooking = async (bookingId: number, shouldCancelAllSameBarcodeBookings: boolean) => {
  const { data }: { data: IResponse } = await axios.post(APIs.CANCEL_BOOKING, { bookingId, shouldCancelAllSameBarcodeBookings });
  return data.data;
};

export const checkRequiredInformation = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.CHECK_REQUIRED_INFORMATION);
  return data.data;
};

export const fetchMonthlyBookingExtraInfo = async (params: { monthlyBookingId: number, ticketId: number }) => {
  const { data }: { data: IResponse } = await axios.get(APIs.MONTHLY_BOOKING_EXTRA_INFO, { params });
  return data.data;
};

export const editEmailUser = async (email: string, token: string) => {
  const { data }: { data: IResponse } = await axios.put(APIs.EDIT_EMAIL_USER, { email, token });
  return data.data;
};

export const requestReCheckIn = async (payload: RequestReCheckInPayload) => {
  const { data }: { data: IResponse } = await axios.patch(APIs.REQUEST_RE_CHECK_IN, payload);
  return data.data;
};

export const checkExistingEmail = async (email) => {
  const { data }: { data: IResponse } = await axios.post(APIs.CHECK_EXISTING_EMAIL, { email });
  return data.data;
};

export const requestPartialCheckout = async (bookingId: number, payload: BookingQuantityFormData) => {
  const { data }: { data: IResponse } = await axios.post(`${APIs.PARTIAL_CHECKOUT_BOOKING}/${bookingId}`, payload);
  return data.data;
};
