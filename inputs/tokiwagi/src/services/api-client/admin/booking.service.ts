import { BookingStatus, TicketType } from "@prisma/client";
import axios from "axios";

import { IResponse } from "models/Response";

type FetchMonthlyBookingExtraInfoParams = {
  monthlyBookingId: number;
  includeOneDayBookings?: boolean;
};

type CancelBookingPayload = {
  id: number;
  shouldCancelAllSameBarcodeBookings: boolean;
  specificBookingBarCodeShouldCancelAll?: string[];
};

type ScanBookingBarcodePayload = {
  barCode: string;
  performedAt: Date;
};

type RollbackScanBookingBarcodePayload = {
  barCode: string;
};

type FetchBookingsParams = {
  page?: number;
  limit?: number;
  name?: string;
  tenantCode?: string;
  ticketType?: TicketType;
  ticketId?: number | string;
  status?: BookingStatus[];
  startDate?: Date | string;
  endDate?: Date | string;
  shortBarCode?: string;
  barCode?: string;
  fromAction?: string;
};

const APIs = {
  BOOKINGS: "/api/admin/bookings",
  UPDATE_BOOKINGS: "/api/user/bookings",
  CANCEL_BOOKINGS: "/api/admin/bookings/cancel",
  TICKET_BOOKING_SCHEDULES: "/api/admin/bookings/ticket-booking-schedules",
  BLACKLIST_BOOKINGS: "/api/admin/bookings/blacklist",
  COUNT_BOOKINGS: "/api/admin/bookings/count",
  MONTHLY_BOOKING_EXTRA_INFO: "/api/admin/bookings/monthly-tickets/extra-info",
  UPDATE_BOOKINGS_DECREASE_QUANTITY: "/api/admin/bookings/decrease-quantity",
  UPDATE_BOOKING_STATUS: "/api/admin/bookings/status",
  SCAN_BOOKING_BARCODE: "/api/admin/bookings/scan",
  ROLLBACK_SCAN_BOOKING_BARCODE: "/api/admin/bookings/rollback-scan",
};

export const fetchBookings = async (params?: FetchBookingsParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.BOOKINGS, { params: params });
  return data.data;
};

export const fetchBookingById = async (id: number) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.BOOKINGS}/${id}`);
  return data.data;
};

export const updateBookingById = async (id: number, payload) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.UPDATE_BOOKINGS}/${id}`, payload);
  return data.data;
};

export const cancelBooking = async ({ id, ...payload }: CancelBookingPayload) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.CANCEL_BOOKINGS}/${id}`, payload);
  return data.data;
};

export const updateTicketBookingScheduleById = async (id: number, payload) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.TICKET_BOOKING_SCHEDULES}/${id}`, payload);
  return data.data;
};

export const fetchBlacklistBookings = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.BLACKLIST_BOOKINGS);
  return data.data;
};

export const countBookings = async (params?) => {
  const { data }: { data: IResponse } = await axios.get(APIs.COUNT_BOOKINGS, { params });
  return data.data;
};

export const fetchMonthlyBookingExtraInfo = async (params: FetchMonthlyBookingExtraInfoParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.MONTHLY_BOOKING_EXTRA_INFO, { params });
  return data.data;
};

export const updateDecreaseQuantityBooking = async (id: number, payload) => {
  const { data }: { data: IResponse } = await axios.patch(`${APIs.UPDATE_BOOKINGS_DECREASE_QUANTITY}/${id}`, payload);
  return data.data;
};

export const updateBookingStatus = async (booking) => {
  const { data }: { data: IResponse } = await axios.put(APIs.UPDATE_BOOKING_STATUS, booking);
  return data.data;
};

export const scanBookingBarCode = async (payload: ScanBookingBarcodePayload) => {
  const { data }: { data: IResponse } = await axios.post(APIs.SCAN_BOOKING_BARCODE, payload);
  return data.data;
};

export const rollbackScanBookingBarCode = async (payload: RollbackScanBookingBarcodePayload) => {
  const { data }: { data: IResponse } = await axios.post(APIs.ROLLBACK_SCAN_BOOKING_BARCODE, payload);
  return data.data;
};

export const updateBookingIsolatedPaymentData = async (id: number, payload: { posTotalAmount?: number; coupons?: any[] }) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.BOOKINGS}/${id}/status`, payload);
  return data.data;
};

export const forceRecomputeObicForBooking = async (bookingId: number) => {
  const { data }: { data: IResponse } = await axios.post(`${APIs.BOOKINGS}/${bookingId}/force-recompute-obic`);
  return data;
};
