import { BookingStatus, PaymentStatus, PaymentType, PriceUnit, PrismaClient, TicketBookingSchedule, TicketType } from "@prisma/client";
import { fill, groupBy, isNil, isNull, map, orderBy, reduce, sortBy, uniq } from "lodash";
import moment from "moment";

import { TicketPayload } from "models/Ticket";
import { NOT_AVAILABLE_REASON, SHORT_BARCODE_LENGTH, TOTAL_TIMES_LIMIT_MONTHS_FROM_START, VACANCY_STATUS } from "constants/common";
import { DisclaimerTermCheckboxGroupFormData, BookingQuantityFormData, ChildAgeItem, PriceInfo } from "models/Booking";
import { Booking, Disclaimer, PartialCheckout, Ticket } from "models/Entity";
import {
  calculateStayingDurationWithoutParsing,
  getDiffOfDates,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  isSameOrBeforeDay,
  toISOStringWithoutTimezone,
  isSameOrAfterDay,
  maxDate,
  minDate,
} from "utils/date-time";
import { PAYMENT_STATUS_OPTIONS, PAYMENT_STATUS_UNPAID_CANCELLED } from "constants/booking";
import { OnlineTicketVacancy } from "models/Vacancy";
import { MESSAGES } from "constants/messages";
import { ERROR_MESSAGES } from "constants/errors";
import { fetchBookings } from "services/api-client/admin/booking.service";
import { checkIsValidChildQuantityAfterCancelBooking } from "utils/booking-validation";
import { formatThousands } from "utils/common";
import { AgeUnit } from "models/enums";
import {
  calculateDiscountByQuantity,
  calculateDiscountForTicket,
  calculateExtraTimeDiscountForTicket,
  calculateHourlyExtraTimeDiscountForSameBarCodeBookings,
  calculateNumberOfExtraTimeBlocks,
  extractOrderAndNumberOfExtraTimeBlocks,
  generateUseInDayBookingsWithDiscount,
  isEnableExtraTimeDiscountHourlyTicket,
} from "utils/discount";
import { MONTHLY_YEARLY_THRESHOLD, TIMES_LIMIT_TICKET_TYPE_NAME } from "constants/ticket";
import { HourlyExtraTimeDiscountDetail, HourlyExtraTimeInfos } from "models/Discount";

import { getTicketBookingSchedule } from "./ticket";
import { getSafeNumberValue } from "./number";

export const generateDefaultChildAges = (quantity: number, baseChildAges?: ChildAgeItem[]): ChildAgeItem[] => {
  const defaultAge = null;

  const result = fill(new Array(quantity), defaultAge);

  if (baseChildAges) {
    for (let i = 0; i < quantity; i++) {
      const baseChildAge = baseChildAges[i];
      if (!baseChildAge) {
        break;
      }

      result[i] = {
        age: baseChildAges[i]?.age,
        unit: baseChildAges[i]?.unit,
      };
    }
  }

  return result;
};

export const countTotalPeople = (booking: Booking) => booking.childQuantity + booking.adultQuantity;

export const countTotalPeopleForBookings = (bookings: Booking[]) =>
  bookings.reduce((acc, booking) => {
    return acc + countTotalPeople(booking);
  }, 0);

export const countTotalPeopleExcludePartialCheckedOut = (bookings: Booking[]) => {
  const totalPeople = bookings.reduce((acc, booking) => {
    return acc + (booking.childQuantity - booking.partialCheckedOutChildQuantity) + (booking.adultQuantity - booking.partialCheckedOutAdultQuantity);
  }, 0);

  return totalPeople;
};

export const countTotalCheckedInPeople = (bookings: Booking[]) => {
  const checkedInBookings = bookings.filter((booking) => booking.status === BookingStatus.CheckedIn);
  const totalPeople = checkedInBookings.reduce((acc, booking) => {
    return acc + (booking.childQuantity - booking.partialCheckedOutChildQuantity) + (booking.adultQuantity - booking.partialCheckedOutAdultQuantity);
  }, 0);

  return totalPeople;
};

export const countTotalCheckedInAdult = (bookings: Booking[]) => {
  const checkedInBookings = bookings.filter((booking) => booking.status === BookingStatus.CheckedIn);
  const totalPeople = checkedInBookings.reduce((acc, booking) => {
    return acc + (booking.adultQuantity - booking.partialCheckedOutAdultQuantity);
  }, 0);

  return totalPeople;
};

export const countTotalCheckedInChild = (bookings: Booking[]) => {
  const checkedInBookings = bookings.filter((booking) => booking.status === BookingStatus.CheckedIn);
  const totalPeople = checkedInBookings.reduce((acc, booking) => {
    return acc + (booking.childQuantity - booking.partialCheckedOutChildQuantity);
  }, 0);

  return totalPeople;
};

export const countTotalCheckedOutPeople = (bookings: Booking[]) => {
  const checkedOutBookings = bookings.filter((booking) => booking.status === BookingStatus.CheckedOut);
  const totalCheckedOutPeople = checkedOutBookings.reduce((acc, booking) => {
    return acc + booking.childQuantity + booking.adultQuantity;
  }, 0);

  const checkedInBookings = bookings.filter((booking) => booking.status === BookingStatus.CheckedIn);
  const totalPartialCheckedOutPeople = checkedInBookings.reduce((acc, booking) => {
    return acc + booking.partialCheckedOutChildQuantity + booking.partialCheckedOutChildQuantity;
  }, 0);

  return totalCheckedOutPeople + totalPartialCheckedOutPeople;
};

export const countTotalAdultForBooking = (bookings: Booking[]) =>
  bookings.reduce((acc, booking) => {
    return acc + booking.adultQuantity;
  }, 0);

export const countTotalChildrenForBooking = (bookings: Booking[]) =>
  bookings.reduce((acc, booking) => {
    return acc + booking.childQuantity;
  }, 0);

export const getBookingStayDuration = (booking: Booking) => {
  if (!booking.checkedInAt || !booking.checkedOutAt) return "";
  const checkedInAt = new Date(booking.firstCheckedInAt || booking.checkedInAt);
  const checkedOutAt = new Date(booking.checkedOutAt);

  const diffTime = getDiffOfDates(checkedInAt, checkedOutAt);

  return `${diffTime.hours}時${diffTime.minutes}分`;
};

// The first-ever checkout of a booking (persists across later re-check-in/checkout cycles),
// falling back to the current checkedOutAt for bookings checked out before this field existed.
export const getBookingFirstCheckoutAt = (booking: Booking) => booking.firstCheckoutAt || booking.checkedOutAt;

// Duration of the booking's FIRST visit only (first check-in → first checkout), ignoring any
// later re-entry cycles.
export const getBookingFirstStayDurationMinutes = (booking: Booking) => {
  const checkedInAt = booking.firstCheckedInAt || booking.checkedInAt;
  const checkoutAt = getBookingFirstCheckoutAt(booking);
  if (!checkedInAt || !checkoutAt) return null;

  return calculateStayingDurationWithoutParsing(new Date(checkedInAt), new Date(checkoutAt));
};

export const getMonthlyBookingTotalPrices = (adultQuantity: number, childQuantity: number, ticket: Ticket) => {
  const { adultPrice, childPrice, enableDiscount } = ticket.TicketDetail;

  let adultDiscount = 0;
  let childDiscount = 0;
  let totalDiscount = 0;
  if (enableDiscount) {
    const { adultDiscountAmount, childDiscountAmount } = calculateDiscountByQuantity(adultQuantity, childQuantity, ticket);
    adultDiscount = adultDiscountAmount;
    childDiscount = childDiscountAmount;
    totalDiscount = adultDiscountAmount + childDiscountAmount;
  }
  const totalAdultPrice = adultQuantity * (adultPrice as any);
  const totalChildPrice = childQuantity * (childPrice as any);

  const totalAmount = Math.max(0, totalAdultPrice + totalChildPrice - totalDiscount);

  return {
    adultPriceWithDiscount: totalAdultPrice - adultDiscount,
    childPriceWithDiscount: totalChildPrice - childDiscount,
    adultPrice: totalAdultPrice,
    childPrice: totalChildPrice,
    totalAmount,
    totalDiscount,
  };
};

export const getTimesLimitBookingTotalPrices = (adultQuantity: number, childQuantity: number, ticket: Ticket) => {
  const { enableDiscount } = ticket.TicketDetail;
  let { adultPrice, childPrice } = ticket.TicketDetail;
  if (ticket.type === TicketType.HourlyTimesLimit) {
    const ticketBookingSchedule = getTicketBookingSchedule(new Date(), ticket);
    adultPrice = ticketBookingSchedule.baseAdultPeriodPrice;
    childPrice = ticketBookingSchedule.baseChildPeriodPrice;
  }

  let adultDiscount = 0;
  let childDiscount = 0;
  let totalDiscount = 0;
  if (enableDiscount) {
    const { adultDiscountAmount, childDiscountAmount } = calculateDiscountByQuantity(adultQuantity, childQuantity, ticket);
    adultDiscount = adultDiscountAmount;
    childDiscount = childDiscountAmount;
    totalDiscount = adultDiscountAmount + childDiscountAmount;
  }
  const totalAdultPrice = adultQuantity * (adultPrice as any);
  const totalChildPrice = childQuantity * (childPrice as any);

  const totalAmount = Math.max(0, totalAdultPrice + totalChildPrice - totalDiscount);

  return {
    adultPriceWithDiscount: totalAdultPrice - adultDiscount,
    childPriceWithDiscount: totalChildPrice - childDiscount,
    adultPrice: totalAdultPrice,
    childPrice: totalChildPrice,
    totalAmount,
    totalDiscount,
  };
};

export const getChildAgeIndexesShouldRemove = (length: number, totalChanges: number) => {
  let fieldLength = length;
  const shouldRemoveIndexes = [];

  Array(totalChanges)
    .fill(0)
    .forEach(() => {
      shouldRemoveIndexes.push(fieldLength - 1);
      fieldLength--;
    });

  return shouldRemoveIndexes;
};

export const getDailyBookingTotalPrices = (adultQuantity: number, childQuantity: number, ticket: Ticket, ticketBookingSchedule: TicketBookingSchedule) => {
  const { adultPrice, childPrice } = ticket.TicketDetail;
  const { baseAdultPeriodPrice, baseChildPeriodPrice } = ticketBookingSchedule || {};

  const totalAdultPrice = adultQuantity * (baseAdultPeriodPrice != null ? Number(baseAdultPeriodPrice) : (adultPrice as any));
  const totalChildPrice = childQuantity * (baseChildPeriodPrice != null ? Number(baseChildPeriodPrice) : (childPrice as any));

  let totalDiscount = 0;
  if (isOnlineOneDayTicket(ticket)) {
    const discountInfo = calculateDiscountByQuantity(adultQuantity, childQuantity, ticket);
    totalDiscount = discountInfo.total;
  }

  const totalAmount = Math.max(0, totalAdultPrice + totalChildPrice - totalDiscount);
  return {
    totalAdultPrice,
    totalChildPrice,
    totalAmount,
  };
};

export const getBookingModificationStatus = (booking: Booking) => {
  const isSuccessfulGroupOrOnlineDayTicket = (isOnlineTimesLimitBooking(booking) || isOnlineMonthlyBooking(booking) || isOnlineOneDayBooking(booking))
    && booking.paymentStatus == PaymentStatus.Completed;
  const isBookingExpired = isAfterDay(moment().toDate(), booking.date);

  // If the booking is past its usage date, it cannot be edited or canceled, except for monthly and one day online ticket
  if (isBookingExpired && !isSuccessfulGroupOrOnlineDayTicket) {
    return {
      canEdit: false,
      canCancel: false,
      canPartialCheckout: false,
    };
  }

  const bookingStatus = {
    isCancelled: ([BookingStatus.Cancelled, BookingStatus.SystemCancelled] as BookingStatus[]).includes(booking.status),
    isCheckedOut: booking.status === BookingStatus.CheckedOut,
    isCheckingIn: booking.status === BookingStatus.CheckedIn,
    isReCheckedIn: isOneDayBooking(booking) && !!booking.firstCheckedInAt
  };
  let canEdit = !bookingStatus.isCancelled && !bookingStatus.isCheckedOut && !bookingStatus.isReCheckedIn;

  if (isOneDayMonthlyBooking(booking)) {
    canEdit = !bookingStatus.isCancelled && !bookingStatus.isCheckedOut;
  }
  return {
    canEdit,
    canCancel: !bookingStatus.isCancelled && !bookingStatus.isCheckedOut && !bookingStatus.isCheckingIn && !bookingStatus.isReCheckedIn,
    canPartialCheckout: bookingStatus.isCheckingIn
  };
};

const calculateTotalDays = (dateFrom: string | Date, dateTo: string | Date): number => {
  const utcDateFrom = toISOStringWithoutTimezone(dateFrom);
  const utcDateTo = toISOStringWithoutTimezone(dateTo);

  return moment(utcDateTo).diff(utcDateFrom, "days") + 1;
};

export const calculateDeadlineMonthlyTicket = (startDate: Date | string, ticket: Ticket, ticketBookingSchedule?: TicketBookingSchedule[]) => {
  let totalDayInUse = ticket.TicketDetail.totalDaysInUseFromStart;
  if (isTimesLimitTicket(ticket.type) && !totalDayInUse) {
    const start = moment();
    const end = moment().add(TOTAL_TIMES_LIMIT_MONTHS_FROM_START, "months");
    // The scheduled expiration date is set to one day after the calculated end month
    totalDayInUse = end.diff(start, "days") + 1;
  }
  // filter bookingSchedule has dateTo > startDate and sort by dateFrom/dateTo
  const ticketBookingSchedules = ticketBookingSchedule || ticket.TicketBookingSchedule;
  const bookingSchedules = ticketBookingSchedules.filter(
    (item) => isSameOrBeforeDay(startDate, item?.dateTo) && !item.isScheduleInFutureDeleted && !item.deleted
  );
  const sortedBookingSchedules = sortBy(bookingSchedules, "dateFrom");

  // find index of booking schedule in sortedBookingSchedules
  const startIndex = sortedBookingSchedules.findIndex((item) => isSameOrAfterDay(startDate, item?.dateFrom) && isSameOrBeforeDay(startDate, item?.dateTo));
  if (startIndex === -1) {
    return moment(startDate).toDate();
  }

  const includeStartDateBookingSchedule = sortedBookingSchedules[startIndex];
  let result = includeStartDateBookingSchedule.dateTo;

  let count = calculateTotalDays(startDate, includeStartDateBookingSchedule.dateTo);

  // total days from startDate to dateTo of first booking schedule >= target -> find deadlineDate from this first booking schedule
  if (count >= totalDayInUse) {
    const { date } = calculateDeadlineForCertainDates(startDate, includeStartDateBookingSchedule.dateTo, totalDayInUse);
    result = date;
  } else {
    // total days from startDate to dateTo of first booking schedule < target -> calc remaining days and loops after booking schedule to find deadline
    let totalRemainingDays = totalDayInUse - count;
    // loop list booking schedules and stop when remaining day equal 0
    for (let i = startIndex + 1; i < sortedBookingSchedules.length; i++) {
      const bookingSchedule = sortedBookingSchedules[i];
      const { dateFrom, dateTo } = bookingSchedule;

      const { date, remainingDays } = calculateDeadlineForCertainDates(dateFrom, dateTo, totalRemainingDays);

      if (remainingDays === 0) {
        return date;
      }

      totalRemainingDays = remainingDays;
      result = date as Date;
    }
  }

  return result;
};

export const calculateDeadlineForCertainDates = (startDate: Date | string, endDate: Date | string, totalDayInUse: number) => {
  let count = 1;
  let date = moment(startDate).toDate();
  const maximumDeadlineDate = moment(endDate).toDate();

  while (isBeforeDay(date, maximumDeadlineDate)) {
    if (count === totalDayInUse) {
      break;
    }

    count++;
    date = moment(date).add(1, "days").toDate();
  }

  return { date, remainingDays: totalDayInUse - count };
};

export const calculateRemainingDaysOfMonthlyBooking = (booking: Booking, deadlineDate: Date | string) => {
  const today = new Date();
  if (isAfterDay(today, deadlineDate)) {
    return 0;
  }

  const startCalculationDate = maxDate(today, booking.date);
  const fromTodayAndBeforeDeadlineBookingSchedules = booking.Ticket.TicketBookingSchedule
    .filter((item) => isSameOrBeforeDay(startCalculationDate, item.dateTo) && isSameOrAfterDay(deadlineDate, item.dateFrom));

  if (!fromTodayAndBeforeDeadlineBookingSchedules.length) {
    return 0;
  }

  const sortedBookingSchedules = sortBy(fromTodayAndBeforeDeadlineBookingSchedules, "dateFrom");

  let remainingDays = 0;
  sortedBookingSchedules.forEach((schedule) => {
    const fromDate = maxDate(startCalculationDate, schedule.dateFrom);
    const toDate = minDate(deadlineDate, schedule.dateTo);
    remainingDays += calculateTotalDays(fromDate, toDate);
  });

  return remainingDays;
};

// Ticket Utils
export const isOnlineOneDayTicket = (ticket: Ticket): boolean => {
  return ticket.paymentType == PaymentType.Online && ticket.type == TicketType.Daily;
};

export const isOnlineMonthlyTicket = (ticket: Ticket): boolean => {
  return ticket.paymentType == PaymentType.Online && ticket.type == TicketType.Monthly;
};

export const isOnlineYearlyTicket = (ticket: Ticket) => {
  return isOnlineMonthlyTicket(ticket) && ticket.TicketDetail.totalDaysInUseFromStart >= MONTHLY_YEARLY_THRESHOLD;
};

export const isOnlineTimesLimitTicket = (ticket: Ticket): boolean => {
  return ticket.paymentType == PaymentType.Online &&
    ([TicketType.HourlyTimesLimit, TicketType.DailyTimesLimit] as string[]).includes(ticket.type);
};

export const isOfflineOneDayTicket = (ticket: Ticket): boolean => {
  return ticket.paymentType == PaymentType.Offline && ticket.type == TicketType.Daily;
};

export const isHourlyTicket = (ticket: Ticket): boolean => {
  return ticket.type == TicketType.Hourly;
};

export const isHourlyTimesLimitTicket = (ticket: Ticket): boolean => {
  return ticket.type == TicketType.HourlyTimesLimit;
};
export const isDailyTimesLimitTicket = (ticket: Ticket): boolean => {
  return ticket.type == TicketType.DailyTimesLimit;
};

export const isInDayTicket = (ticket: Ticket): boolean => {
  return isOfflineOneDayTicket(ticket) ||
    isHourlyTicket(ticket) ||
    isOnlineMonthlyTicket(ticket) ||
    isOnlineTimesLimitTicket(ticket);
};

export const isOnlyAdultTicket = (ticket: Ticket): boolean => {
  return ticket?.maxChildPerAdult === 0;
};

export const isPromotionTicket = (ticket: Ticket) => {
  return ticket?.isPromotion;
};

export const isMasterMonthlyTicket = (ticket: Ticket | TicketPayload): boolean => {
  return ticket.type == TicketType.MasterMonthly;
};

export const isMasterOrSlaveMonthlyTicket = (ticket: Ticket | TicketPayload): boolean => {
  return ticket.type == TicketType.MasterMonthly || (ticket.type == TicketType.Monthly && !!ticket.masterTicketId);
};

export const isMonthlyTicket = (ticketType: string): boolean => {
  return ([TicketType.MasterMonthly, TicketType.Monthly] as string[]).includes(ticketType);
};

export const isGroupTicket = (ticketType: string): boolean => {
  return isMonthlyTicket(ticketType) || ticketType == TicketType.DailyTimesLimit;
};

export const isTimesLimitTicket = (ticketType: string): boolean => {
  return ([TicketType.HourlyTimesLimit, TicketType.DailyTimesLimit, TIMES_LIMIT_TICKET_TYPE_NAME] as string[]).includes(ticketType);
};

// Booking Utils
export const isOnlineOneDayBooking = (booking: Booking): boolean => {
  return isOnlineOneDayTicket(booking.Ticket);
};

export const isOnlineMonthlyBooking = (booking: Booking): boolean => {
  return isOnlineMonthlyTicket(booking.Ticket) && isNil(booking.parentBookingId);
};

export const isOneDayMonthlyBooking = (booking: Booking): boolean => {
  return isOnlineMonthlyTicket(booking.Ticket) && !isNil(booking.parentBookingId);
};

export const isOnlineTimesLimitBooking = (booking: Booking): boolean => {
  return isOnlineTimesLimitTicket(booking.Ticket) && isNil(booking.parentBookingId);
};

export const isOneDayTimesLimitBooking = (booking: Booking): boolean => {
  return isOnlineTimesLimitTicket(booking.Ticket) && !isNil(booking.parentBookingId);
};

export const isOfflineOneDayBooking = (booking: Booking): boolean => {
  return isOfflineOneDayTicket(booking.Ticket);
};

export const isOneDayBooking = (booking: Booking) => {
  return isOfflineOneDayBooking(booking) || isOnlineOneDayBooking(booking) || isOneDayMonthlyBooking(booking) || isOneDayTimesLimitBooking(booking);
};

export const isInDayBooking = (booking: Booking) => {
  return isOfflineOneDayBooking(booking) || isHourlyBooking(booking) || isOneDayMonthlyBooking(booking) || isOneDayTimesLimitBooking(booking);
};

export const isOnlineBooking = (booking: Booking): boolean => {
  return isOnlineOneDayBooking(booking) || isOnlineMonthlyBooking(booking) || isOnlineTimesLimitBooking(booking);
};

export const isHourlyBooking = (booking: Booking): boolean => {
  return isHourlyTicket(booking.Ticket);
};

export const isHourlyTimesLimitBooking = (booking: Booking): boolean => {
  return isHourlyTimesLimitTicket(booking.Ticket);
};
export const isDailyTimesLimitBooking = (booking: Booking): boolean => {
  return isDailyTimesLimitTicket(booking.Ticket);
};

export const isPartialCheckoutBooking = (booking: Booking) => {
  return booking.status === BookingStatus.CheckedIn && (booking.partialCheckedOutAdultQuantity || booking.partialCheckedOutChildQuantity);
};

export const isAccumulativeBooking = (booking: Booking): boolean => {
  if (!booking.TicketBookingSchedule) return false;
  const ticketBookingSchedule = booking.TicketBookingSchedule;
  return !isNull(ticketBookingSchedule.maxBookingPeople) && ticketBookingSchedule.maxBookingPeopleAccumulative;
};

export const isStandardAloneBooking = (booking: Booking): boolean => {
  if (!booking.TicketBookingSchedule) return false;
  const ticketBookingSchedule = booking.TicketBookingSchedule;
  return !ticketBookingSchedule.maxBookingPeopleAccumulative;
};

export const isPossibleReCheckInBooking = (booking: Booking): boolean => {
  const isCheckedOut = booking.status === BookingStatus.CheckedOut;
  const isTodayBooking = isSameDay(new Date(), booking.date);
  return isCheckedOut && !isHourlyBooking(booking) && !isHourlyTimesLimitBooking(booking) && isTodayBooking;
};

export const isAccumulativeBookingSchedule = (ticketBookingSchedule: TicketBookingSchedule) => {
  return ticketBookingSchedule && !isNil(ticketBookingSchedule.maxBookingPeople) && ticketBookingSchedule.maxBookingPeopleAccumulative;
};

export const isCancelledBooking = (booking: Booking): boolean => {
  return [BookingStatus.Cancelled, BookingStatus.SystemCancelled].includes(booking.status as any);
};

export const checkIsFullOrNotAvailableDay = (day: moment.Moment, exceptDate, onlineTicketVacancies: OnlineTicketVacancy[]) => {
  if (isSameDay(day, exceptDate)) {
    return false;
  }

  for (const vacancy of onlineTicketVacancies) {
    if (isSameDay(vacancy.date, day) && [VACANCY_STATUS.FULL, VACANCY_STATUS.NOT_AVAILABLE].includes(vacancy.status)) {
      return true;
    }
  }

  return false;
};

export const getShortBarCode = (barCode: string) => {
  return barCode.substring(barCode.length - SHORT_BARCODE_LENGTH);
};

// Attaches display numbering ("No.{shortBarCode} (i/n)") used by the admin barcode scanner (v2) —
// order is fixed by createdAt asc so the same ticket always gets the same index regardless of the
// DB's return order for `findMany({ where: { id: { in: [...] } } })`.
export const attachTicketNumbering = <T extends { id: number; createdAt: Date | string; barCode: string }>(
  bookings: T[],
): (T & { shortBarCode: string; ticketIndex: number; ticketCount: number })[] => {
  const ordered = orderBy(bookings, ["createdAt"], ["asc"]);
  const ticketCount = ordered.length;
  const indexById = new Map(ordered.map((b, index) => [b.id, index + 1]));
  return bookings.map((b) => ({
    ...b,
    shortBarCode: getShortBarCode(b.barCode),
    ticketIndex: indexById.get(b.id) as number,
    ticketCount,
  }));
};

export const checkDoesAgreeAllTerms = (disclaimersValue: DisclaimerTermCheckboxGroupFormData[]) => {
  const checkboxValues = disclaimersValue.reduce((result, item) => {
    return [...result, ...item.options.map((option) => option.value)];
  }, []);

  return checkboxValues.every((value) => value);
};

export const transformDisclaimerTermDefaultValue = (enteredDisclaimers: Disclaimer[]): { disclaimers: DisclaimerTermCheckboxGroupFormData[] } => {
  const disclaimers = enteredDisclaimers.map((disclaimer) => {
    const options = disclaimer.DisclaimerOption.map((item) => ({ content: item.content, value: false }));
    return { title: disclaimer.title, options };
  });

  return { disclaimers };
};

export const getPaymentStatus = (booking: Booking) => {
  return booking.status === BookingStatus.Cancelled && !isOnlineBooking(booking)
    ? PAYMENT_STATUS_UNPAID_CANCELLED
    : PAYMENT_STATUS_OPTIONS.find(({ value }) => value === booking.paymentStatus).label;
};

export const getTicketNotAvailableErrorMessage = (reason: string, ticketName: string) => {
  const options = {
    [NOT_AVAILABLE_REASON.CAN_NOT_BOOK_MORE]: MESSAGES.TICKET_FULL_AND_NOT_BOOK_MORE,
    [NOT_AVAILABLE_REASON.NO_BOOKING_SCHEDULE]: MESSAGES.TICKET_BOOKING_SCHEDULE_NOT_AVAILABLE,
    [NOT_AVAILABLE_REASON.EXPIRED]: MESSAGES.TICKET_NOT_IN_BOOKING_TIME,
    [NOT_AVAILABLE_REASON.NOT_TIME_YET]: MESSAGES.TICKET_NOT_IN_BOOKING_TIME,
  };

  return options[reason].replace("ticketName", ticketName);
};

export const getCheckingInPeopleBooking = (booking: Booking): BookingQuantityFormData => {
  const { BookingChildAgeInfo, PartialCheckout } = booking;
  const checkIsInPartialCheckout = (bookingChildAgeInfoId: number) => PartialCheckout.some((item) => item.bookingChildAgeInfoId === bookingChildAgeInfoId);
  const childAges = BookingChildAgeInfo.filter((item) => !checkIsInPartialCheckout(item.id));
  const childQuantity = childAges.length;
  const adultQuantity = booking.adultQuantity - booking.partialCheckedOutAdultQuantity;

  return {
    adultQuantity,
    childQuantity,
    childAges: childAges,
  };
};

export const getDetailPeopleBooking = (booking: Booking): BookingQuantityFormData => {
  const { adultQuantity, childQuantity, BookingChildAgeInfo } = booking;

  return {
    adultQuantity,
    childQuantity,
    childAges: BookingChildAgeInfo,
  };
};

export const countAdultQuantityInPartialCheckout = (partialCheckouts: PartialCheckout[]) => {
  const result = partialCheckouts.filter((item) => item.isAdult).reduce((acc, item) => acc + item.quantity, 0);
  return result;
};

export const countChildQuantityInPartialCheckout = (partialCheckouts: PartialCheckout[]) => {
  const result = partialCheckouts.filter((item) => !item.isAdult).reduce((acc, item) => acc + item.quantity, 0);
  return result;
};

export const checkStatusCanNotUpdateBooking = (status: BookingStatus, checkedOutAt?: Date) => {
  const absoluteStatuses = [BookingStatus.CheckedOut, BookingStatus.Cancelled, BookingStatus.SystemCancelled] as string[];
  const errorMessages = {
    [BookingStatus.CheckedOut]: ERROR_MESSAGES.INVALID_BOOKING_STATUS.CHECKED_OUT,
    [BookingStatus.Cancelled]: ERROR_MESSAGES.INVALID_BOOKING_STATUS.CANCELLED,
    [BookingStatus.SystemCancelled]: ERROR_MESSAGES.INVALID_BOOKING_STATUS.SYSTEM_CANCELLED,
  };
  if (checkedOutAt && !absoluteStatuses.includes(status)) {
    status = BookingStatus.CheckedOut;
  }
  const result = absoluteStatuses.includes(status);
  const errorMessage = errorMessages[status];

  return { result, errorMessage };
};

export const checkStatusCanNotCancelBooking = (status: BookingStatus) => {
  const errorMessages = {
    [BookingStatus.CheckedIn]: ERROR_MESSAGES.INVALID_BOOKING_STATUS.CHECKED_IN,
    [BookingStatus.CheckedOut]: ERROR_MESSAGES.INVALID_BOOKING_STATUS.CHECKED_OUT,
    [BookingStatus.Cancelled]: ERROR_MESSAGES.INVALID_BOOKING_STATUS.CANCELLED,
    [BookingStatus.SystemCancelled]: ERROR_MESSAGES.INVALID_BOOKING_STATUS.SYSTEM_CANCELLED,
  };

  const result = ([BookingStatus.CheckedIn, BookingStatus.CheckedOut, BookingStatus.Cancelled, BookingStatus.SystemCancelled] as string[]).includes(status);
  const errorMessage = errorMessages[status];

  return { result, errorMessage };
};

export const validateChildQuantityAfterCancelBooking = async (booking: Booking) => {
  let result = true;

  const { bookings: sameBarcodeBookings } = await fetchBookings({
    barCode: booking.barCode,
    status: [BookingStatus.Successful, BookingStatus.Calling, BookingStatus.CheckedIn, BookingStatus.Waiting, BookingStatus.CheckedOut],
  });

  result = checkIsValidChildQuantityAfterCancelBooking(booking.id, sameBarcodeBookings);

  return result;
};

export const transformBookingFormData = (originalBooking: Booking) => {
  const { parentBookingId } = originalBooking;
  return {
    childQuantity: originalBooking.childQuantity,
    adultQuantity: originalBooking.adultQuantity,
    ticketId: { ...originalBooking.Ticket, ...(parentBookingId ? { parentBookingId } : {}) },
    childAges: originalBooking.BookingChildAgeInfo.map((item) => ({
      age: item.childAgeInMonth >= 12 ? item.childAgeInMonth / 12 : item.childAgeInMonth,
      unit: item.childAgeInMonth >= 12 ? AgeUnit.Year : AgeUnit.Month,
    })),
    minimumAdultQuantity: 0,
    parentBookingId: parentBookingId || undefined,
    fromLastBooking: true,
  };
};

export const populateTimesLimitBookingsUsageInfo = async (prisma: PrismaClient, bookings: Booking[]) => {
  const parentTimesLimitBookingIds = uniq(
    bookings
      .filter((booking) => isTimesLimitTicket(booking.Ticket.type) && booking.parentBookingId)
      .map((booking) => booking.parentBookingId)
  );

  const ticketsUsageCount = await prisma.booking.groupBy({
    by: ["parentBookingId"],
    where: {
      parentBookingId: {
        in: parentTimesLimitBookingIds,
      },
      status: { notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled] },
    },
    _sum: {
      childQuantity: true,
    },
  });

  return bookings.map((booking) => {
    const timesLimitTicketUsage = ticketsUsageCount.find((usage) => usage.parentBookingId === booking.id || usage.parentBookingId === booking.parentBookingId);
    if (!isTimesLimitTicket(booking.Ticket.type)) {
      return booking;
    }
    return {
      ...booking,
      usageTimes: timesLimitTicketUsage ? timesLimitTicketUsage._sum.childQuantity : 0,
      totalTimes: booking.Ticket.TicketDetail.limitTimes + (booking.Ticket.TicketDetail.extraTimes || 0),
    };
  });
};

export const calculatePayAmount = (totalUsageTime: number, priceInfo: PriceInfo, hasSettingExtendedPrice?: boolean) => {
  if (hasSettingExtendedPrice) {
    return calculatePayAmountWithExtendedPeriod(totalUsageTime, priceInfo);
  }
  return calculatePayAmountWithoutExtendedPeriod(priceInfo);
};

export const calculatePayAmountWithoutExtendedPeriod = (priceInfo: PriceInfo) => {
  return priceInfo.basePeriodPrice || 0;
};

export const calculatePayAmountWithExtendedPeriod = (totalUsageTime: number, priceInfo: PriceInfo) => {
  if (priceInfo.basePeriodUnit === PriceUnit.Day) {
    return priceInfo.basePeriodPrice;
  }

  const basePeriod = priceInfo.basePeriodUnit === PriceUnit.Hour ? priceInfo.basePeriod * 60 : priceInfo.basePeriod;
  const extendedPeriod = priceInfo.extendedPeriodUnit === PriceUnit.Hour ? priceInfo.extendedPeriod * 60 : priceInfo.extendedPeriod;

  if (totalUsageTime <= basePeriod) {
    return priceInfo.basePeriodPrice;
  }
  let extendedUsageTime = totalUsageTime - basePeriod;
  if (extendedUsageTime < 0) extendedUsageTime = 0;

  let extendedPayAmount = Math.ceil(extendedUsageTime / extendedPeriod) * priceInfo.extendedPeriodPrice;

  if (!priceInfo.extendedPeriod) {
    extendedPayAmount = 0;
  }

  return +priceInfo.basePeriodPrice + extendedPayAmount;
};

export const calculateTotalBookingsPayAmount = (payTimeAt: Date, bookings: Booking[], useNewVersion = false) => {
  let total = 0;
  let hourlyExtraTimeInfos: HourlyExtraTimeInfos = {};

  // Only calculate payment amount for payment offline Tickets
  // Calculate original pay amount
  for (const booking of bookings) {
    const { date, Ticket, adultQuantity, childQuantity, partialCheckedOutAdultQuantity, partialCheckedOutChildQuantity, PartialCheckout } = booking;

    const checkedInAt = moment(booking.checkedInAt).second(0);

    const sameTicketBookings = bookings.filter(b => b.ticketId === booking.ticketId);
    const { adultDiscountAmount, childDiscountAmount } = calculateDiscountAmounts(booking, sameTicketBookings);
    const baseDiscount = adultDiscountAmount + childDiscountAmount;
    if (([TicketType.Daily, TicketType.DailyTimesLimit] as string[]).includes(Ticket.type) && Ticket.paymentType === PaymentType.Offline) {
      // If daily booking already checked-out once then do not charge anymore
      if (booking.firstCheckedInAt) {
        total += 0;
        continue;
      }

      const { baseAdultPeriodPrice, baseChildPeriodPrice } = getTicketBookingSchedule(date.toISOString(), Ticket);
      const amount = +baseAdultPeriodPrice * adultQuantity + +baseChildPeriodPrice * childQuantity;
      total += amount;

      // This is for apply discount for daily ticket
      if (useNewVersion) {
        total -= baseDiscount;
      }
      continue;
    }

    if (([TicketType.Hourly, TicketType.HourlyTimesLimit] as string[]).includes(Ticket.type)) {
      const {
        baseAdultPeriod,
        baseAdultPeriodPrice,
        baseChildPeriodUnit,
        baseAdultPeriodUnit,
        baseChildPeriod,
        baseChildPeriodPrice,
        extendedAdultPeriod,
        extendedAdultPeriodPrice,
        extendedAdultPeriodUnit,
        extendedChildPeriod,
        extendedChildPeriodPrice,
        extendedChildPeriodUnit,
      } = getTicketBookingSchedule(date.toISOString(), Ticket);
      const hourlyTimesLImitTicket = Ticket.type === TicketType.HourlyTimesLimit;
      const adultPriceInfo: PriceInfo = {
        basePeriod: getSafeNumberValue(baseAdultPeriod),
        basePeriodUnit: baseAdultPeriodUnit,
        basePeriodPrice: hourlyTimesLImitTicket ? 0 : getSafeNumberValue(baseAdultPeriodPrice),
        extendedPeriod: getSafeNumberValue(extendedAdultPeriod),
        extendedPeriodUnit: extendedAdultPeriodUnit,
        extendedPeriodPrice: getSafeNumberValue(extendedAdultPeriodPrice),
      };

      const childPriceInfo: PriceInfo = {
        basePeriod: getSafeNumberValue(baseChildPeriod),
        basePeriodUnit: baseChildPeriodUnit,
        basePeriodPrice: hourlyTimesLImitTicket ? 0 : getSafeNumberValue(baseChildPeriodPrice),
        extendedPeriod: getSafeNumberValue(extendedChildPeriod),
        extendedPeriodUnit: extendedChildPeriodUnit,
        extendedPeriodPrice: getSafeNumberValue(extendedChildPeriodPrice),
      };

      const hasSettingExtendedPrice = !!extendedAdultPeriod || !!extendedChildPeriod;

      let partialPayAmount = 0;
      hourlyExtraTimeInfos[booking.id] = [];

      // Calculate amount for partial checkouts
      for (const PartialCheckoutItem of PartialCheckout) {
        const { checkedOutAt, isAdult, quantity } = PartialCheckoutItem;
        const partialUsageTime = moment.duration(moment(checkedOutAt).diff(checkedInAt)).asMinutes();
        const adultAmount = isAdult ? calculatePayAmount(partialUsageTime, adultPriceInfo, hasSettingExtendedPrice) * quantity : 0;
        const childAmount = !isAdult ? calculatePayAmount(partialUsageTime, childPriceInfo, hasSettingExtendedPrice) * quantity : 0;

        // Add info for hourly extra time discounts
        if (hasSettingExtendedPrice) {
          const priceInfo = isAdult ? adultPriceInfo : childPriceInfo;
          hourlyExtraTimeInfos[booking.id].push({
            adultQuantity: isAdult ? quantity : 0,
            childQuantity: !isAdult ? quantity : 0,
            numberOfExtraTimeBlocks: calculateNumberOfExtraTimeBlocks(partialUsageTime, priceInfo)
          });
        }
        partialPayAmount += adultAmount + childAmount;
      }

      const totalUsageTime = moment.duration(moment(payTimeAt).diff(checkedInAt)).asMinutes();
      const remainingAdultQuantity = adultQuantity - partialCheckedOutAdultQuantity;
      const remainingChildQuantity = childQuantity - partialCheckedOutChildQuantity;
      const remainingAdultAmount = calculatePayAmount(totalUsageTime, adultPriceInfo, hasSettingExtendedPrice) * remainingAdultQuantity;
      const remainingChildAmount = calculatePayAmount(totalUsageTime, childPriceInfo, hasSettingExtendedPrice) * remainingChildQuantity;

      const remainingPayAmount = remainingAdultAmount + remainingChildAmount;

      total += partialPayAmount + remainingPayAmount;

      // Add info for hourly extra time discounts
      if (hasSettingExtendedPrice) {
        hourlyExtraTimeInfos[booking.id].push({
          adultQuantity: remainingAdultQuantity,
          childQuantity: 0,
          numberOfExtraTimeBlocks: calculateNumberOfExtraTimeBlocks(totalUsageTime, adultPriceInfo)
        });
        hourlyExtraTimeInfos[booking.id].push({
          adultQuantity: 0,
          childQuantity: remainingChildQuantity,
          numberOfExtraTimeBlocks: calculateNumberOfExtraTimeBlocks(totalUsageTime, childPriceInfo)
        });
      }

      // Reset total if it's a hourly times limit ticket and has setting for extended period
      if (Ticket.type === TicketType.HourlyTimesLimit) {
        total = hasSettingExtendedPrice
          ? total -
          calculatePayAmountWithoutExtendedPeriod(adultPriceInfo) -
          calculatePayAmountWithoutExtendedPeriod(childPriceInfo)
          : total;
      }

      // Calculate discount amount for hourly extra time bookings
      const hourlyBookings = bookings.filter(booking => booking.Ticket.type === TicketType.Hourly || booking.Ticket.type === TicketType.HourlyTimesLimit);
      const extraTimeDiscount = (calculateHourlyExtraTimeDiscountForSameBarCodeBookings(hourlyBookings, hourlyExtraTimeInfos)).total;
      const totalExtraTimeDiscount = extraTimeDiscount.adultDiscountAmount + extraTimeDiscount.childDiscountAmount;
      total = Math.max(0, total - baseDiscount - totalExtraTimeDiscount);
    }
  }

  return total;
};

const checkIsDailyBookingCheckedInAtLeastOnce = (booking: Booking) =>
  booking.Ticket.type === TicketType.Daily && !!booking.firstCheckedInAt;

/**
 * Compute extended (延長) prices for a booking, returning the pay amount
 * **per person** for each partial-checkout record AND for each remaining
 * (fully-checked-out) person.
 *
 * Mirrors the Hourly / HourlyTimesLimit branch of
 * `calculateTotalBookingsPayAmount` in this file:
 *
 *     const adultPriceInfo: PriceInfo = {
 *       basePeriod: getSafeNumberValue(baseAdultPeriod),
 *       basePeriodUnit: baseAdultPeriodUnit,
 *       basePeriodPrice: hourlyTimesLImitTicket ? 0 : getSafeNumberValue(baseAdultPeriodPrice),
 *       extendedPeriod: getSafeNumberValue(extendedAdultPeriod),
 *       extendedPeriodUnit: extendedAdultPeriodUnit,
 *       extendedPeriodPrice: getSafeNumberValue(extendedAdultPeriodPrice),
 *     };
 *     // (childPriceInfo similar)
 *     const hasSettingExtendedPrice = !!extendedAdultPeriod || !!extendedChildPeriod;
 *
 *     // Partial checkouts
 *     for (const pc of PartialCheckout) {
 *       const partialUsageTime = moment.duration(moment(pc.checkedOutAt).diff(checkedInAt)).asMinutes();
 *       const adultAmount = pc.isAdult ? calculatePayAmount(partialUsageTime, adultPriceInfo, hasSettingExtendedPrice) * pc.quantity : 0;
 *       const childAmount = !pc.isAdult ? calculatePayAmount(partialUsageTime, childPriceInfo, hasSettingExtendedPrice) * pc.quantity : 0;
 *     }
 *
 *     // Remaining (fully-checked-out) people
 *     const totalUsageTime = moment.duration(moment(payTimeAt).diff(checkedInAt)).asMinutes();
 *     const remainingAdultAmount = calculatePayAmount(totalUsageTime, adultPriceInfo, hasSettingExtendedPrice) * remainingAdult;
 *     const remainingChildAmount = calculatePayAmount(totalUsageTime, childPriceInfo, hasSettingExtendedPrice) * remainingChild;
 *
 * For the UI we want PER-PERSON amounts so each line renders as
 * `こども1人 X円` / `おとな1人 Y円`. We therefore push `quantity` entries
 * (one per person) of `calculatePayAmount(...)` into the parent/child
 * bucket — the `× quantity` in the reference logic becomes `push quantity
 * times` here.
 *
 * `payTimeAt` for remaining people is `booking.checkedOutAt` (final checkout).
 *
 * Only Hourly / HourlyTimesLimit tickets process extensions.
 */
export const calculateBookingExtendedPrices = (
  booking: Booking,
): { parent: number[]; child: number[], totalExtendedAmount: number } => {
  const empty = { parent: [] as number[], child: [] as number[], totalExtendedAmount: 0 };
  const checkedOutAt = booking?.tempCheckoutAt || booking?.checkedOutAt;
  if (!booking?.Ticket) return empty;

  const ticketType = booking.Ticket.type;
  const isHourly = ticketType === TicketType.Hourly;
  const isHourlyTimesLimit = ticketType === TicketType.HourlyTimesLimit;
  if (!isHourly && !isHourlyTimesLimit) return empty;

  const tbs: any =
    (booking as any).TicketBookingSchedule ||
    getTicketBookingSchedule(booking.date?.toString(), booking.Ticket);
  if (!tbs) return empty;

  const checkedInAtRaw = (booking as any).checkedInAt;
  if (!checkedInAtRaw) return empty;

  // ─── Mirror `calculateTotalBookingsPayAmount` Hourly/HourlyTimesLimit setup ───
  const {
    baseAdultPeriod,
    baseAdultPeriodPrice,
    baseChildPeriodUnit,
    baseAdultPeriodUnit,
    baseChildPeriod,
    baseChildPeriodPrice,
    extendedAdultPeriod,
    extendedAdultPeriodPrice,
    extendedAdultPeriodUnit,
    extendedChildPeriod,
    extendedChildPeriodPrice,
    extendedChildPeriodUnit,
  } = tbs;

  const adultPriceInfo: PriceInfo = {
    basePeriod: getSafeNumberValue(baseAdultPeriod),
    basePeriodUnit: baseAdultPeriodUnit,
    basePeriodPrice: isHourlyTimesLimit ? 0 : getSafeNumberValue(baseAdultPeriodPrice),
    extendedPeriod: getSafeNumberValue(extendedAdultPeriod),
    extendedPeriodUnit: extendedAdultPeriodUnit,
    extendedPeriodPrice: getSafeNumberValue(extendedAdultPeriodPrice),
  };

  const childPriceInfo: PriceInfo = {
    basePeriod: getSafeNumberValue(baseChildPeriod),
    basePeriodUnit: baseChildPeriodUnit,
    basePeriodPrice: isHourlyTimesLimit ? 0 : getSafeNumberValue(baseChildPeriodPrice),
    extendedPeriod: getSafeNumberValue(extendedChildPeriod),
    extendedPeriodUnit: extendedChildPeriodUnit,
    extendedPeriodPrice: getSafeNumberValue(extendedChildPeriodPrice),
  };

  const hasSettingExtendedPrice = !!extendedAdultPeriod || !!extendedChildPeriod;

  const checkedInAt = moment(checkedInAtRaw).second(0);

  const extAdultPrice = getSafeNumberValue(extendedAdultPeriodPrice);
  const extChildPrice = getSafeNumberValue(extendedChildPeriodPrice);

  const partialCheckouts: Array<{
    isAdult: boolean;
    quantity: number;
    checkedOutAt: Date;
    deleted?: boolean;
  }> = ((booking as any).PartialCheckout ?? [])
    .filter((p: any) => p.checkedOutAt >= checkedInAt && p.checkedOutAt <= checkedOutAt);

  // ─── Step 1: Build `hourlyExtraTimeInfos` — same shape as scan.ts / calculateTotalBookingsPayAmount ───
  const bookingKey = String((booking as any).id ?? 0);
  const hourlyExtraTimeInfos: HourlyExtraTimeInfos = { [bookingKey]: [] };

  // Partial-checkout people → per-record blocks
  for (const pc of partialCheckouts) {
    const { checkedOutAt, isAdult, quantity } = pc;
    if (!quantity || quantity <= 0) continue;

    const partialUsageTime = moment
      .duration(moment(checkedOutAt).diff(checkedInAt))
      .asMinutes();

    const priceInfo = isAdult ? adultPriceInfo : childPriceInfo;
    const blocks = hasSettingExtendedPrice
      ? calculateNumberOfExtraTimeBlocks(partialUsageTime, priceInfo)
      : 0;

    hourlyExtraTimeInfos[bookingKey].push({
      adultQuantity: isAdult ? quantity : 0,
      childQuantity: !isAdult ? quantity : 0,
      numberOfExtraTimeBlocks: blocks,
    });
  }

  // Remaining / fully-checked-out people → use booking.checkedOutAt as payTimeAt
  if (checkedOutAt && hasSettingExtendedPrice) {
    const partialAdultQty = partialCheckouts
      .filter((p) => p.isAdult)
      .reduce((acc, p) => acc + (p.quantity ?? 0), 0);
    const partialChildQty = partialCheckouts
      .filter((p) => !p.isAdult)
      .reduce((acc, p) => acc + (p.quantity ?? 0), 0);

    const bookingAdultQty = (booking as any).adultQuantity ?? 0;
    const bookingChildQty = (booking as any).childQuantity ?? 0;
    const partialCheckedOutAdultQty = (booking as any).partialCheckedOutAdultQuantity ?? partialAdultQty;
    const partialCheckedOutChildQty = (booking as any).partialCheckedOutChildQuantity ?? partialChildQty;

    const remainingAdultQuantity = Math.max(bookingAdultQty - partialCheckedOutAdultQty, 0);
    const remainingChildQuantity = Math.max(bookingChildQty - partialCheckedOutChildQty, 0);

    if (remainingAdultQuantity > 0 || remainingChildQuantity > 0) {
      const totalUsageTime = moment
        .duration(moment(checkedOutAt).diff(checkedInAt))
        .asMinutes();

      const adultExtBlocks = calculateNumberOfExtraTimeBlocks(totalUsageTime, adultPriceInfo);
      const childExtBlocks = calculateNumberOfExtraTimeBlocks(totalUsageTime, childPriceInfo);

      hourlyExtraTimeInfos[bookingKey].push(
        {
          adultQuantity: remainingAdultQuantity,
          childQuantity: 0,
          numberOfExtraTimeBlocks: adultExtBlocks,
        },
        {
          adultQuantity: 0,
          childQuantity: remainingChildQuantity,
          numberOfExtraTimeBlocks: childExtBlocks,
        },
      );
    }
  }

  // ─── Step 2: Expand to per-person details, APPLYING hourly extra-time discount ───
  // When the ticket has hourly extra-time discount enabled,
  // `calculateExtraTimeDiscountForTicket` sorts people by blocks desc, assigns each an `order`,
  // and fills in per-person `discountSetting` / `discountAmount`.
  // Otherwise we expand without discount via `extractOrderAndNumberOfExtraTimeBlocks`.
  let adultDetails: HourlyExtraTimeDiscountDetail[] = [];
  let childDetails: HourlyExtraTimeDiscountDetail[] = [];

  if (isEnableExtraTimeDiscountHourlyTicket(booking.Ticket as any)) {
    const discountResult = calculateExtraTimeDiscountForTicket([booking as any], hourlyExtraTimeInfos);
    adultDetails = discountResult.adultDiscountDetails ?? [];
    childDetails = discountResult.childDiscountDetails ?? [];
  } else {
    const expanded = extractOrderAndNumberOfExtraTimeBlocks(
      hourlyExtraTimeInfos[bookingKey],
    );
    adultDetails = expanded.adultOrderAndExtraTimeBlocks;
    childDetails = expanded.childOrderAndExtraTimeBlocks;
  }

  // ─── Step 3: per-person extension amount = (blocks × extPrice) − discountAmount ───
  const parent: number[] = [];
  const child: number[] = [];
  let totalExtendedAmount = 0;
  adultDetails.forEach((detail) => {
    const base = (detail.numberOfExtraTimeBlocks ?? 0) * extAdultPrice;
    const discount = detail.discountAmount ?? 0;
    const finalAmount = base - discount;
    totalExtendedAmount += finalAmount;
    if (finalAmount > 0) parent.push(finalAmount);
  });

  childDetails.forEach((detail) => {
    const base = (detail.numberOfExtraTimeBlocks ?? 0) * extChildPrice;
    const discount = detail.discountAmount ?? 0;
    const finalAmount = base - discount;
    totalExtendedAmount += finalAmount;
    if (finalAmount > 0) child.push(finalAmount);
  });

  return { parent, child, totalExtendedAmount };
};

export const calculateDiscountAmounts = (booking: Booking, sameTicketBookings: Booking[]) => {
  let adultDiscountAmount = 0;
  let childDiscountAmount = 0;

  if (checkIsDailyBookingCheckedInAtLeastOnce(booking)) {
    // If daily ticket already checked-out once then do not charge anymore (discount = price)
    adultDiscountAmount = booking.adultQuantity * +(booking as any).TicketBookingSchedule.baseAdultPeriodPrice;
    childDiscountAmount = booking.childQuantity * +(booking as any).TicketBookingSchedule.baseChildPeriodPrice;
  } else if ((booking.Ticket.type === TicketType.Monthly && isNil(booking.parentBookingId)) || isOnlineOneDayBooking(booking)) {
    const discount = calculateDiscountForTicket([booking]);
    adultDiscountAmount = discount.adultDiscountAmount;
    childDiscountAmount = discount.childDiscountAmount;
  } else if (isOfflineOneDayBooking(booking) || isHourlyBooking(booking)) {
    const { useInDayWithDiscountBookingsPriceListMap } = generateUseInDayBookingsWithDiscount(sameTicketBookings);
    const bookingPriceListMap = useInDayWithDiscountBookingsPriceListMap[booking.id];
    adultDiscountAmount = bookingPriceListMap.adultDiscountAmount;
    childDiscountAmount = bookingPriceListMap.childDiscountAmount;
  }

  return { adultDiscountAmount, childDiscountAmount };
};

const generateUseInDayBookingsWithDiscountForBookingGroups = (allBookings: Booking[]) => {
  const sameBarcodeGroups = groupBy(allBookings, "barCode");
  let bookingsPriceListMap = {};
  Object.keys(sameBarcodeGroups).map((barcode) => {
    const sameBarcodeBookings = sameBarcodeGroups[barcode];
    const { useInDayWithDiscountBookingsPriceListMap } = generateUseInDayBookingsWithDiscount(sameBarcodeBookings);
    bookingsPriceListMap = { ...bookingsPriceListMap, ...useInDayWithDiscountBookingsPriceListMap };
  });

  return bookingsPriceListMap;
};

export const calculateBookingsPriceMap = (bookings: Booking[]) => {
  // Group by barCode
  const grouped = groupBy(bookings, "barCode");

  // Map each group
  const mapped = map(grouped, (values, key) => ({
    barCode: key,
    date: values[0].date,
    createdAt: values[0].createdAt,
    bookings: orderBy(values, ["createdAt"], ["asc"]).map((item, index, bookings) => ({
      ...item,
      index: `${index + 1}/${bookings.length}`,
    })),
  }));

  // Order the groups
  const ordered = orderBy(mapped, ["date", "createdAt"], ["desc", "desc"]);

  // Flatten the bookings
  const sortedBookings = reduce(ordered, (a, item) => [...a, ...item.bookings], []);

  const bookingsPriceListMap = generateUseInDayBookingsWithDiscountForBookingGroups(sortedBookings);
  return { sortedBookings, bookingsPriceListMap };
};

type BookingsPriceListMap = ReturnType<typeof calculateBookingsPriceMap>["bookingsPriceListMap"];

export const getFormattedTotalAmount = (
  booking: Pick<Booking, "id" | "totalAmount">,
  bookingsPriceListMap: BookingsPriceListMap
): string => {
  const totalBookingAmount = Number(booking?.totalAmount);
  return totalBookingAmount ?
    formatThousands(totalBookingAmount) :
    formatThousands(bookingsPriceListMap?.[booking.id]?.totalAmountAfterDiscount);
};

export const attachFormattedTotalAmount = <T extends Pick<Booking, "id" | "totalAmount" | "barCode">>(
  bookings: T[]
): (T & { formattedTotalAmount: string })[] => {
  const { bookingsPriceListMap } = calculateBookingsPriceMap(bookings as unknown as Booking[]);
  return bookings.map((booking) => ({
    ...booking,
    formattedTotalAmount: getFormattedTotalAmount(booking, bookingsPriceListMap),
  }));
};
