import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  CHARTS_AVERAGE_STAY_DURATION: "/api/admin/charts/average-stay-duration",
  CHARTS_AVERAGE_BOOKING_TIMES: "/api/admin/charts/average-booking-times",
  CHARTS_TOTAL_BOOKINGS_WITH_TIMES: "/api/admin/charts/total-bookings-with-times",
  CHARTS_TOTAL_BOOKINGS_WITH_TICKET: "/api/admin/charts/total-bookings-with-ticket",
  CHARTS_TOTAL_NEW_AND_OLD_BOOKING_USERS: "/api/admin/charts/total-new-and-old-booking-users",
};

type ChartParams = {
  dateFrom: string;
  dateTo: string;
  tenantCode?: string;
};

export const fetchAverageStayDuration = async (params?: ChartParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.CHARTS_AVERAGE_STAY_DURATION, { params });
  return data.data;
};

export const fetchAverageBookingTimes = async (params?: ChartParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.CHARTS_AVERAGE_BOOKING_TIMES, { params });
  return data.data;
};

export const fetchTotalBookingsWithTimes = async (params?: ChartParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.CHARTS_TOTAL_BOOKINGS_WITH_TIMES, { params });
  return data.data;
};

export const fetchTotalBookingsWithTicket = async (params?: ChartParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.CHARTS_TOTAL_BOOKINGS_WITH_TICKET, { params });
  return data.data;
};

export const fetchTotalNewAndOldBookingUsers = async (params?: ChartParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.CHARTS_TOTAL_NEW_AND_OLD_BOOKING_USERS, { params });
  return data.data;
};
