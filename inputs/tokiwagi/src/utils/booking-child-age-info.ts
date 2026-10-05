import { BookingChildAgeInfo } from "@prisma/client";

import { CHILD_AGE_HEADERS } from "constants/csv";
import { Booking } from "models/Entity";
import { AgeUnit } from "models/enums";

export const toChildAge = (childAgeInfo: BookingChildAgeInfo) => {
  if (childAgeInfo.childAgeInMonth < 12) {
    return {
      age: childAgeInfo.childAgeInMonth,
      unit: AgeUnit.Month,
    };
  }
  return {
    age: Math.floor(childAgeInfo.childAgeInMonth / 12),
    unit: AgeUnit.Year,
  };
};

export const getChildAgeStatistic = (booking: Booking) => {
  const bookingAges = booking.BookingChildAgeInfo.map((item) => item.childAgeInMonth);
  const displayAges = CHILD_AGE_HEADERS.map((item) => item.key);

  const results = displayAges.map((age) => {
    const count = bookingAges.filter((bookingAge) => +age === bookingAge).length;
    return { age, count: count ? count : "" };
  });

  return results;
};
