import { Moment } from "moment";

import { NOT_AVAILABLE_REASON, VACANCY_STATUS } from "constants/common";

export type TicketVacancy = {
  tenantCode: string;
  ticketId: number;
  ticketName: string;
  ticketType: string;
  status?: (typeof VACANCY_STATUS)[keyof typeof VACANCY_STATUS];
  reason?: (typeof NOT_AVAILABLE_REASON)[keyof typeof NOT_AVAILABLE_REASON];
  maxBookingPeople?: number;
  totalBookingPeople?: number;
  totalAccumulativeMaxBookingPeople?: number;
  totalAccumulativeBookingPeople?: number;
  waitingBookingsCount?: number;
  waitingTimeInMinutes?: number;
  invisibleWhenReachedMaxBookingPeople?: boolean;
  canNotBookMore?: boolean;
  isAccumulativeMaxBookingPeople?: boolean;
};

export type OnlineTicketVacancy = TicketVacancy & { date: string };

export type TenantVacancy = {
  tenantName: string;
  status: string;
  tickets: TicketVacancy[];
  date?: Date | Moment | string;
  reason?: string;
  tenant?: string;
  tenantCode?: string;
};

export type PaymentOnlineBookingVacancy = {
  ticketId: number;
  vacancies: OnlineTicketVacancy[];
};
