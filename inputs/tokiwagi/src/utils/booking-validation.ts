import { TicketBookingSchedule, TicketType } from "@prisma/client";
import moment from "moment";
import isNil from "lodash/isNil";

import { BOOKING_VALIDATION_ERROR_MESSAGES } from "constants/booking";
import { SHORT_DATE } from "constants/common";
import { BookingPayload, OneDayBookings } from "models/Booking";
import { Booking, Tenant, Ticket } from "models/Entity";
import { isAfterTime, isBeforeTime, isSameDay, standardizeEpochDate } from "utils/date-time";
import { BookingFormData } from "components/CreateBooking/PaymentOfflineBookingForm";
import { getTicketBookingSchedule } from "utils/ticket";
import { isOnlineMonthlyTicket, isOnlyAdultTicket, isPromotionTicket, isTimesLimitTicket } from "utils/booking";

type ValidationResult = {
  isValid: boolean;
  message: string;
};

type ValidationParams = {
  userId?: number;
  bookingPayload?: BookingPayload;
  ticketBookingSchedule?: TicketBookingSchedule;
  tickets?: Ticket[];
  sameDayBookings?: Booking[];
  tenants?: Tenant[];
  type?: "create" | "update" | "cancel";
  originalBooking?: Booking;
  sameBarCodeBookings?: Booking[];
};

export const checkMaxBookingTimes = (userId: number, ticketBookingSchedule: TicketBookingSchedule, sameDayBookings: Booking[]) => {
  if (ticketBookingSchedule.maxBookingTimes === 1) {
    const booking = sameDayBookings.find((item) => item.userId === userId);
    return !booking;
  }
  return true;
};

export const checkValidChildQuantity = (childQuantity: number, adultQuantity: number, maxChildPerAdult: number) => {
  const maximum = maxChildPerAdult * adultQuantity || maxChildPerAdult;
  return childQuantity <= maximum;
};

export const checkCanBookInAdvance = (date: string, ticket: Ticket) => {
  if (ticket.type === TicketType.Monthly) {
    return true;
  }

  if (!ticket.canBookInAdvance) {
    return isSameDay(date, moment.now());
  }
  return true;
};

export const checkBookAfterSettingBookingFromTime = (date: string, ticketBookingSchedule: TicketBookingSchedule) => {
  if (isSameDay(date, moment.now())) {
    return isAfterTime(moment.now(), ticketBookingSchedule?.canBookingFrom);
  }
  return true;
};

export const checkBookInAdvanceDeadline = (date: string, ticketBookingSchedule: TicketBookingSchedule) => {
  if (isSameDay(date, moment.now())) {
    return isBeforeTime(moment.now(), ticketBookingSchedule.canBookingUtil);
  }
  return true;
};

const checkAgePerChild = (childAges: number[], ticket: Ticket) => {
  const { childAgeLimitFrom, childAgeLimitTo } = ticket;
  for (const age of childAges) {
    if (age < childAgeLimitFrom || age > childAgeLimitTo) {
      return false;
    }
  }

  return true;
};

const checkValidTenant = (tenantCode: string, ticket: Ticket) => {
  return tenantCode === ticket.tenantCode;
};

export const validateBooking = ({
  userId,
  bookingPayload,
  ticketBookingSchedule,
  tickets,
  sameDayBookings,
  originalBooking,
  type = "create",
  sameBarCodeBookings,
}: ValidationParams): ValidationResult => {
  const { childQuantity, adultQuantity, date, ticketId, tenantCode, childAges } = bookingPayload;

  const ticket = tickets.find((ticket) => {
    return ticket.id === ticketId;
  });
  let message = "";
  let isValid = true;

  if (type === "create") {
    const isValidMaxBookingTimes = checkMaxBookingTimes(userId, ticketBookingSchedule, sameDayBookings);
    const isValidCanBookInAdvance = checkCanBookInAdvance(date, ticket);
    const isValidBookingBeforeDeadline = isOnlineMonthlyTicket(ticket) ? true : checkBookInAdvanceDeadline(date, ticketBookingSchedule);

    if (!isValidCanBookInAdvance) {
      message = BOOKING_VALIDATION_ERROR_MESSAGES.ONLY_BOOK_ON_DATE;
      isValid = false;
    }

    if (!isValidBookingBeforeDeadline) {
      message = BOOKING_VALIDATION_ERROR_MESSAGES.OVERDUE_BOOKING_TIME;
      isValid = false;
    }

    if (!isValidMaxBookingTimes) {
      message = BOOKING_VALIDATION_ERROR_MESSAGES.MAX_BOOKING_TIMES;
      isValid = false;
    }
  }

  if (type === "update") {
    const isValidBookingUpdateDeadline = checkBookingUpdateDeadline(originalBooking, ticketBookingSchedule);
    if (!isValidBookingUpdateDeadline) {
      message = BOOKING_VALIDATION_ERROR_MESSAGES.BOOKING_EDIT_TIME_EXPIRED;
      isValid = false;
    }

    if (sameBarCodeBookings) {
      const inputBookings = sameBarCodeBookings.map((booking) =>
        originalBooking.id === booking.id
          ? { ...booking, childQuantity, adultQuantity }
          : { ...booking }
      );

      const isValidChildQuantity = checkIsValidChildQuantity(inputBookings);
      if (!isValidChildQuantity) {
        message = BOOKING_VALIDATION_ERROR_MESSAGES.INVALID_CHILD_QUANTITY_FOR_MIXED_BOOKING;
        isValid = false;
      }
    }
  }

  const isValidTenant = checkValidTenant(tenantCode, ticket);
  let isValidChildQuantity = true;
  let isValidAgePerChild = true;
  if (!isTimesLimitTicket(ticket.type)) {
    isValidChildQuantity = checkValidChildQuantity(childQuantity, adultQuantity, ticket.maxChildPerAdult);
    isValidAgePerChild = checkAgePerChild(childAges, ticket);
  }

  if (!isValidTenant) {
    message = BOOKING_VALIDATION_ERROR_MESSAGES.INVALID_TENANT;
    isValid = false;
  }

  if (!isValidChildQuantity) {
    message = BOOKING_VALIDATION_ERROR_MESSAGES.INVALID_CHILD_QUANTITY;
    isValid = false;
  }

  if (!isValidAgePerChild) {
    message = BOOKING_VALIDATION_ERROR_MESSAGES.INVALID_CHILD_AGE;
    isValid = false;
  }

  return { isValid, message };
};

export const checkBookingUpdateDeadline = (originalBooking: Booking, ticketBookingSchedule: TicketBookingSchedule) => {
  if (isNil(ticketBookingSchedule.canCancelOrChangeBeforeInDay)) {
    return true;
  }

  const updateDeadlineMoment = moment(originalBooking.date);
  const now = moment();

  updateDeadlineMoment.subtract(ticketBookingSchedule.canCancelOrChangeBeforeInDay, "days");

  if (ticketBookingSchedule.canCancelOrChangeUtil) {
    const canUpdateUtil = moment(standardizeEpochDate(new Date(ticketBookingSchedule.canCancelOrChangeUtil)));

    updateDeadlineMoment.set("hours", canUpdateUtil.get("hours"));
    updateDeadlineMoment.set("minutes", canUpdateUtil.get("minutes"));
    updateDeadlineMoment.set("seconds", 0);
    updateDeadlineMoment.set("milliseconds", 0);
  }

  return now.isBefore(updateDeadlineMoment);
};

export const validateUseInDayBooking = ({ userId, bookingPayload, ticketBookingSchedule, sameDayBookings }: ValidationParams): ValidationResult => {
  let message = "";
  let isValid = true;

  const isValidBookingAfterSettingFromTime = checkBookAfterSettingBookingFromTime(bookingPayload.date, ticketBookingSchedule);
  const isValidBookingBeforeDeadline = checkBookInAdvanceDeadline(bookingPayload.date, ticketBookingSchedule);
  const isValidMaxBookingTimes = checkMaxBookingTimes(userId, ticketBookingSchedule, sameDayBookings);

  if (!isValidBookingAfterSettingFromTime) {
    message = BOOKING_VALIDATION_ERROR_MESSAGES.EARLY_BOOKING_TIME;
    isValid = false;
  }

  if (!isValidBookingBeforeDeadline) {
    message = BOOKING_VALIDATION_ERROR_MESSAGES.OVERDUE_BOOKING_TIME;
    isValid = false;
  }

  if (!isValidMaxBookingTimes) {
    message = BOOKING_VALIDATION_ERROR_MESSAGES.MAX_BOOKING_TIMES;
    isValid = false;
  }

  return { isValid, message };
};

export const checkIsValidChildQuantity = (inputBookings: Booking[]) => {
  const maximumQuantity = getMaximumChildQuantity(inputBookings);
  const inputQuantity = inputBookings.reduce((sum, inputBooking) => +inputBooking.childQuantity + sum, 0);

  return inputQuantity <= maximumQuantity;
};

const getMaximumChildQuantity = (inputBookings: Booking[]) => {
  const totalAdultQuantity = inputBookings.reduce((sum, inputBooking) => +inputBooking.adultQuantity + sum, 0);
  const bookingTickets = inputBookings.map((inputBooking) => inputBooking.Ticket);
  const minimumMaxChildPerAdultSetting = getMinimumMaxChildPerAdultSetting(bookingTickets);
  return totalAdultQuantity * minimumMaxChildPerAdultSetting;
};

export const getMinimumMaxChildPerAdultSetting = (tickets: Ticket[]) => {
  let minimumMaxChildPerAdult = 0;

  const normalTickets = tickets.filter((ticket) => !isPromotionTicket(ticket) && !isOnlyAdultTicket(ticket));

  if (normalTickets.length) {
    const maxChildPerAdultSettings = normalTickets.map((ticket) => ticket.maxChildPerAdult);
    minimumMaxChildPerAdult = Math.min(...maxChildPerAdultSettings);
  } else {
    const promotionTicket = tickets.find((ticket) => isPromotionTicket(ticket));
    const onlyAdultTicket = tickets.find((ticket) => isOnlyAdultTicket(ticket));
    if (promotionTicket) {
      minimumMaxChildPerAdult = promotionTicket.maxChildPerAdult;
    } else if (onlyAdultTicket) {
      minimumMaxChildPerAdult = onlyAdultTicket.maxChildPerAdult;
    }
  }

  return minimumMaxChildPerAdult;
};

export const checkValidMaxBookingTimesForUseInDayBooking = (enteredBookings: BookingFormData[], sameDayBookings: Booking[], tickets: Ticket[]) => {
  for (const enteredBooking of enteredBookings) {
    const ticket = tickets.find((item) => item.id === enteredBooking.ticketId);
    const bookingSchedule = getTicketBookingSchedule(moment().format(SHORT_DATE), ticket);
    if (bookingSchedule?.maxBookingTimes === 1) {
      const sameTicketsBookings = sameDayBookings.filter((booking) => enteredBookings.find((item) => item.ticketId === booking.ticketId));
      return !sameTicketsBookings.length;
    }
  }

  return true;
};

export const checkIsValidChildQuantityAfterCancelBooking = (bookingId: number, sameBarcodeBookings: Booking[]) => {
  if (sameBarcodeBookings.length > 1) {
    const excludedMainBookings = sameBarcodeBookings.filter((item) => item.id !== bookingId);
    const isValidChildQuantity = checkIsValidChildQuantity(excludedMainBookings);
    return !!isValidChildQuantity;
  }
  return true;
};

export const checkIsValidChildQuantityAfterCancelMonthlyBooking = (totalOneDayBookings: OneDayBookings) => {
  let isValidChildQuantity = true;
  let isAllBookingsInvalid = false;
  let invalidBookingBarCodes = [];
  let count = 0;

  for (const { oneDayMonthlyBookingId, bookings } of Object.values(totalOneDayBookings)) {
    const isValid = checkIsValidChildQuantityAfterCancelBooking(oneDayMonthlyBookingId, bookings);
    if (!isValid) {
      isValidChildQuantity = false;
      count++;
      invalidBookingBarCodes.push(bookings[0].barCode);
    }
  }

  isAllBookingsInvalid = count === Object.values(totalOneDayBookings).length;

  return { isValidChildQuantity, isAllBookingsInvalid, invalidBookingBarCodes };
};
