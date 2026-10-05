import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  BOOKING_VACANCIES: "/api/admin/booking-vacancies",
};

export const fetchBookingVacancies = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.BOOKING_VACANCIES);
  return data.data;
};

