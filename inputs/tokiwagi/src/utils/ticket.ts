import { TicketBookingSchedule } from "@prisma/client";

import { PAYMENT_TYPE_OPTIONS, PROMOTION_TICKET_TYPE_NAME, TICKET_TYPE_OPTIONS, TIMES_LIMIT_TICKET_TYPE_NAME } from "constants/ticket";
import { Booking, Ticket } from "models/Entity";
import { AgeUnit } from "models/enums";
import { isAfterDay, isBetweenOrSameDay, isSameDay } from "utils/date-time";

import { isTimesLimitTicket } from "./booking";

export const getTicketBookingSchedule = (date: string | Date, ticket: Ticket, needNearest = true) => {
  return getBookingScheduleByDate(date, ticket?.TicketBookingSchedule, needNearest);
};

export const getBookingScheduleByDate = (date: string | Date, bookingSchedules: TicketBookingSchedule[], needNearest = true) => {
  if (!bookingSchedules) {
    return null;
  }

  const sameDateBookingSchedule = bookingSchedules.find((item) => isSameDay(item.dateFrom, date));
  if (sameDateBookingSchedule) {
    return sameDateBookingSchedule;
  }

  const betweenDateBookingSchedule = bookingSchedules.find((item) => isBetweenOrSameDay(date, item.dateFrom, item.dateTo));

  if (betweenDateBookingSchedule) {
    return betweenDateBookingSchedule;
  }

  if (needNearest) {
    const nearestDateBookingSchedule = bookingSchedules
      .filter((item) => isAfterDay(item.dateFrom, date))
      .sort(function (item1, item2) {
        return new Date(item2.dateFrom).getTime() - new Date(item1.dateFrom).getTime();
      })[0];

    return nearestDateBookingSchedule;
  }

  return null;
};

export const getTicketBookingScheduleByTicketId = (date: string | Date, ticketId: number, tickets: Ticket[]) => {
  const ticket = tickets.find((ticket) => ticket.id === ticketId);

  return getTicketBookingSchedule(date, ticket, true);
};

export const getTicketById = (ticketId: number, tickets: Ticket[]) => {
  return tickets.find((ticket) => ticket.id === ticketId);
};

export const getAgeLabel = (age: number, shouldShowExtraTextForYearUnit = false) => {
  const ageValue = age >= 12 ? age / 12 : age;
  const ageUnit = age >= 12 ? `歳${shouldShowExtraTextForYearUnit ? "ま" : ""}` : "ヶ月";
  return ageValue + ageUnit;
};

export const generateAgeOptions = (ticket: Ticket) => {
  const { childAgeLimitFrom, childAgeLimitTo } = ticket;
  const childAgeLimitFromItem = {
    age: childAgeLimitFrom >= 12 ? childAgeLimitFrom / 12 : childAgeLimitFrom,
    unit: childAgeLimitFrom >= 12 ? AgeUnit.Year : AgeUnit.Month,
  };
  const childAgeLimitToItem = {
    age: childAgeLimitTo >= 12 ? childAgeLimitTo / 12 : childAgeLimitTo,
    unit: childAgeLimitTo >= 12 ? AgeUnit.Year : AgeUnit.Month,
  };

  let ageValues = [];

  if (childAgeLimitFromItem.unit === AgeUnit.Month) {
    if (childAgeLimitToItem.unit === AgeUnit.Month) {
      for (let i = childAgeLimitFromItem.age; i <= childAgeLimitToItem.age; i++) {
        ageValues.push({ age: i, unit: AgeUnit.Month });
      }
    } else {
      for (let i = childAgeLimitFromItem.age; i <= 11; i++) {
        ageValues.push({ age: i, unit: AgeUnit.Month });
      }

      for (let i = 1; i <= childAgeLimitToItem.age; i++) {
        ageValues.push({ age: i, unit: AgeUnit.Year });
      }
    }
  } else {
    for (let i = childAgeLimitFromItem.age; i <= childAgeLimitToItem.age; i++) {
      ageValues.push({ age: i, unit: AgeUnit.Year });
    }
  }

  return ageValues;
};

export const generateMonthlyBookingAgeOptions = (monthlyBooking: Booking) => {
  const childAgeInMonths = monthlyBooking?.BookingChildAgeInfo.map((item) => item.childAgeInMonth);
  const uniqueChildAgeInMonths = Array.from(new Set(childAgeInMonths));

  const options = uniqueChildAgeInMonths.map((item) => {
    return { age: item >= 12 ? item / 12 : item, unit: item >= 12 ? AgeUnit.Year : AgeUnit.Month };
  });

  return options;
};

export const getPaymentTypeLabel = (ticket: Ticket) => {
  return PAYMENT_TYPE_OPTIONS.find((item) => item.value === ticket.paymentType)?.label;
};

export const getTicketTypeLabel = (ticket: Ticket) => {
  if (ticket.isPromotion) {
    return PROMOTION_TICKET_TYPE_NAME;
  }
  if (isTimesLimitTicket(ticket.type)) {
    return TIMES_LIMIT_TICKET_TYPE_NAME;
  }
  return TICKET_TYPE_OPTIONS.find((item) => item.value === ticket.type)?.label;
};
