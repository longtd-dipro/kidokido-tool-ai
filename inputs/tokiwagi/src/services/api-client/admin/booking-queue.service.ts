import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  BOOKING_QUEUE: "/api/admin/booking-queue",
  BOOKING_QUEUE_WAITING: "/api/admin/booking-queue/waiting",
  BOOKING_QUEUE_CALLING: "/api/admin/booking-queue/calling",
  BOOKING_QUEUE_SYSTEM_CANCELLED: "/api/admin/booking-queue/system-cancelled",
};

export const fetchBookingQueueWaiting = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.BOOKING_QUEUE_WAITING);
  return data.data;
};

export const fetchBookingQueueCalling = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.BOOKING_QUEUE_CALLING);
  return data.data;
};

export const fetchBookingQueueSystemCancelled = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.BOOKING_QUEUE_SYSTEM_CANCELLED);
  return data.data;
};

export const updateWaitingOrderForBookingQueue = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.BOOKING_QUEUE, values);
  return data.data;
};

export const updateStatusBookingQueue = async (values, needToSendNotification: boolean) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.BOOKING_QUEUE}/${values.id}`, values, { params: { needToSendNotification } });
  return data.data;
};
