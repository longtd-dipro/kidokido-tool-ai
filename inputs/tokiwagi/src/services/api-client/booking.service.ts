import axios from "axios";

import { BookingPayload } from "models/Booking";
import { IResponse } from "models/Response";

export type GetBookingsParams = {
  fromDate?: string;
  date?: string;
  barCode?: string;
  parentBookingId?: number;
  includeBookingSchedule?: boolean;
  tenantCode?: string;
  ticketId?: number;
  limit?: number;
  page?: number;
};

export type FetchBookingVacanciesStatusParams = {
  tenantCodes?: string[];
  includeTodayOneDayOnlineForInDayVacancy?: boolean;
  sortTicketsBy?: string;
  bookingDays?: number;
};

export type CheckSameDateBookingExistsParams = {
  ticketId: number;
  date: string;
}

export type GetUserBookingsParams = {
  date?: string;
  fromDate?: string;
}

const APIs = {
  USER_BOOKINGS: "/api/user/bookings",
  BOOKINGS: "/api/bookings",
  USE_IN_DAY_BOOKING: "/api/bookings/use-in-day",
  BOOKING_VACANCIES_STATUS: "/api/bookings/vacancies/status",
  BOOKING_TRANSACTION: "/api/bookings/transaction/[bookingId]",
  MAIN_BOOKINGS: "/api/bookings/main-bookings",
  BOOKING_STATUS: "/api/bookings/status",
  CHECK_MONTHLY_TICKET_ALREADY_USED: "/api/bookings/check-monthly-ticket-already-used",
  CHECK_SAME_DATE_BOOKING_EXISTS: "/api/bookings/check-same-date-booking-exists",
};

export const fetchUserBookings = async (params?: GetUserBookingsParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.USER_BOOKINGS, { params });
  return data.data;
};

export const fetchBookingById = async (id: number) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.USER_BOOKINGS}/${id}`);
  return data.data;
};

export const updateBookingById = async (values) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.USER_BOOKINGS}/${values.id}`, values);
  return data.data;
};

export const fetchBookings = async (params?: GetBookingsParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.BOOKINGS, { params });
  return data.data;
};

export const createBooking = async (values: BookingPayload) => {
  const { data }: { data: IResponse } = await axios.post(APIs.BOOKINGS, values);
  return data;
};

export const createUseInDayBooking = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.USE_IN_DAY_BOOKING, values);
  return data;
};

export const fetchBookingVacanciesStatus = async (params?: FetchBookingVacanciesStatusParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.BOOKING_VACANCIES_STATUS, { params });
  return data.data;
};

export const fetchBookingTransaction = async (bookingId) => {
  const { data }: { data: IResponse } = await axios.get(APIs.BOOKING_TRANSACTION.replace("[bookingId]", bookingId));
  return data.data;
};

export const fetchMainBookings = async (id: number) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.MAIN_BOOKINGS}/${id}`);
  return data.data;
};

export const fetchBookingStatus = async (id: number) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.BOOKING_STATUS}`, { params: { bookingId: id } });
  return data.data;
};

export const checkMonthlyTicketAlreadyUsed = async (parentBookingId: number) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.CHECK_MONTHLY_TICKET_ALREADY_USED}`, { params: { parentBookingId } });
  return data.data;
};

export const checkSameDateBookingExists = async (params: CheckSameDateBookingExistsParams) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.CHECK_SAME_DATE_BOOKING_EXISTS}`, { params });
  return data.data;
};

export const changePaymentStatus = async (id: number, values) => {
  const { data }: { data: IResponse } = await axios.patch(`${APIs.USER_BOOKINGS}/${id}/payment-status`, values);
  return data.data;
};