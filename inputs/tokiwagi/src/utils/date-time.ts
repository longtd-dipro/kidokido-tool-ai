import moment, { Moment } from "moment";
import { PriceUnit, TicketType } from "@prisma/client";
import { MomentInput } from "moment/moment";

import { EMPTY_SHORT_TIME, JP_HOURS, JP_HOURS_MINUTES, JP_MINUTES, LONG_DATE, MINUTES, SHORT_DATE, SHORT_TIME } from "constants/common";

export function isBeforeDay(date, value): boolean {
  return moment(date).isBefore(moment(value), "day");
}

export function isAfterDay(date, value): boolean {
  return moment(date).isAfter(moment(value), "day");
}

export function isSameDay(date, value): boolean {
  return moment(date).isSame(moment(value), "day");
}

export function isSameOrBeforeDay(date, value): boolean {
  return moment(date).isSameOrBefore(moment(value), "day");
}

export function isSameOrAfterDay(date, value): boolean {
  return moment(date).isSameOrAfter(moment(value), "day");
}

export function isBetweenOrSameDay(date, valueFrom, valueTo): boolean {
  return moment(date).isBetween(valueFrom, valueTo, "day") || isSameDay(date, valueFrom) || isSameDay(date, valueTo);
}

export function isSameTime(date, value): boolean {
  const dateUTC = moment(date).millisecond(0);
  const valueUTC = moment(value).year(dateUTC.year()).month(dateUTC.month()).date(dateUTC.date()).millisecond(0);
  return dateUTC.isSame(valueUTC);
}

export function isBeforeTime(date, value): boolean {
  const dateUTC = moment(date).millisecond(0);
  const valueUTC = moment(value).year(dateUTC.year()).month(dateUTC.month()).date(dateUTC.date()).millisecond(0);
  return dateUTC.isBefore(valueUTC);
}

export function isBeforeOrSameTime(date, value): boolean {
  return isBeforeTime(date, value) || isSameTime(date, value);
}

export function isAfterTime(date, value): boolean {
  const dateUTC = moment(date).millisecond(0);
  const valueUTC = moment(value).year(dateUTC.year()).month(dateUTC.month()).date(dateUTC.date()).millisecond(0);
  return dateUTC.isAfter(valueUTC);
}

export function isAfterOrSameTime(date, value): boolean {
  return isAfterTime(date, value) || isSameTime(date, value);
}

export function isDateInFuture(date): boolean {
  return date && moment(date).diff(moment(), "day", true) > 0;
}

export function minDate(date1, date2) {
  return moment(date1).isBefore(moment(date2)) ? date1 : date2;
}

export function maxDate(date1, date2) {
  return moment(date1).isAfter(moment(date2)) ? date1 : date2;
}

export const getDiffOfDates = (date1: Date, date2: Date) => {
  const diffMs = Math.max(date2.getTime() - date1.getTime(), 0);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

  return {
    days: diffDays,
    hours: diffHrs,
    minutes: diffMins,
  };
};

export const toStartOfDay = (date: Date | string) => {
  return moment(date).startOf("date").toDate();
};

export const toStartOfDayStr = (date: Date | string) => {
  return toStartOfDay(date).toISOString();
};

export const toEndOfDay = (date: Date | string) => {
  return moment(date).endOf("day").toDate();
};

export const toEndOfDayStr = (date: Date | string) => {
  return toEndOfDay(date).toISOString();
};

export const createContinuousDates = (startDate: string, totalRangeDate: number) => {
  const dates = Array(totalRangeDate - 1)
    .fill(null)
    .reduce(
      (acc) => {
        const nextDate = moment(acc[acc.length - 1])
          .add(1, "d")
          .toISOString();
        return [...acc, nextDate];
      },
      [startDate]
    );

  return dates;
};

/***
 * Replace "1970-01-01" to "2000-01-01" (or another valid date) to avoid issue:
 * new Date("1970-01-01T15:00:00.000Z")
 * return Thu Jan 01 1970 23:00:00 GMT+0800 (Indochina Time) instead of Thu Jan 01 1970 22:00:00 GMT+0700 (Indochina Time)
 * @param epochDate
 */
export const standardizeEpochDate = (epochDate) => {
  if (epochDate instanceof Date) {
    return new Date(epochDate.toISOString().replace("1970-01-01", "2000-01-01"));
  }

  return epochDate;
};

export const formatBasePeriod = (period: any, unit: PriceUnit, ticket: TicketType): string => {
  let periodInMinutes;
  if (unit === PriceUnit.Day && ticket === TicketType.Daily) {
    return "";
  } else if (unit === PriceUnit.Day && ticket === TicketType.Hourly) {
    return `${period}日`;
  } else {
    if (unit === PriceUnit.Hour) {
      periodInMinutes = period * 60;
    } else {
      periodInMinutes = period;
    }

    periodInMinutes -= 5; // Reduce 5 minutes for free
    return formatPeriod(periodInMinutes);
  }
};

export const formatExtendPeriod = (period: any, unit: PriceUnit): string => {
  let periodInMinutes;
  if (unit === PriceUnit.Day) {
    return `${period}日間`;
  } else {
    if (unit === PriceUnit.Hour) {
      periodInMinutes = period * 60;
    } else {
      periodInMinutes = period;
    }

    return formatPeriod(periodInMinutes);
  }
};

export const formatPeriod = (periodInMinutes: number): string => {
  if (periodInMinutes < 0) periodInMinutes = 0;
  if (periodInMinutes < 60) {
    return moment.utc(moment.duration(periodInMinutes, MINUTES).asMilliseconds()).format(JP_MINUTES);
  } else if (periodInMinutes % 60 == 0) {
    return moment.utc(moment.duration(periodInMinutes, MINUTES).asMilliseconds()).format(JP_HOURS);
  } else {
    return moment.utc(moment.duration(periodInMinutes, MINUTES).asMilliseconds()).format(JP_HOURS_MINUTES);
  }
};

export const newDateKeepLocalTime = (date?: Date | string): Date => {
  return moment(date).utc(true).toDate();
};

export const formatDuration = (date1: Date | Moment, date2: Date | Moment, format: string) => {
  return moment.utc(moment.duration(moment(date1).diff(date2)).asMilliseconds()).format(format);
};

export const formatHourDuration = (duration: number, format: string) => {
  return moment.utc(moment.duration(duration, "hours").asMilliseconds()).format(format);
};

export const toISOStringWithoutTimezone = (date: string | Date) => {
  return moment(date).utc().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toISOString();
};

export const formatEmailTime = (time: Date | string) => {
  if (!time) return EMPTY_SHORT_TIME;
  return moment(time).format(SHORT_TIME);
};

export const calculateStayingDuration = (startAt: Date | string, endAt: Date | string) => {
  const parsedStartAt = moment(startAt, LONG_DATE).second(0);
  const parsedEndAt = moment(endAt, LONG_DATE).second(0);
  return +moment.duration(moment(parsedEndAt).diff(parsedStartAt)).asMinutes().toFixed(0);
};

export const formatStayDurationTime = (durationInMinute: number) => {
  const safeDuration = Math.max(durationInMinute, 0);
  const { minutes, hours } = toHoursAndMinutes(safeDuration);
  return `${hours}時${minutes}分`;
};

export const formatStayDurationColonTime = (durationInMinute: number) => {
  const safeDuration = Math.max(durationInMinute, 0);
  const { minutes, hours } = toHoursAndMinutes(safeDuration);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const toHoursAndMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes };
};

export const getDateOneYearAgo = (date: string | Date) => {
  return moment(date).subtract(1, "years").toDate();
};

export const formatDate = (date: MomentInput, format = SHORT_DATE): string =>
  date ? moment(date).format(format) : "";

export const calculateStayingDurationWithoutParsing = (startAt: Date, endAt: Date) => {
  const stayDuration = +moment.duration(moment(endAt).diff(moment(startAt))).asMinutes().toFixed(0);
  return Math.max(stayDuration, 0);
};

export const formatJpTz = (d: Date | moment.Moment) => moment(d).utcOffset("+09:00").format("YYYY-MM-DDTHH:mm:ssZ");

export const truncateToMinute = (date: MomentInput): Date => {
  return moment(date).second(0).millisecond(0).toDate();
};
