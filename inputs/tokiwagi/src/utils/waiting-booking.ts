import { isNil, orderBy, uniqBy } from "lodash";

import { Booking } from "models/Entity";
import { SIMULATE_COMING_USER_BOOKING_BARCODE } from "constants/common";

export const parseWaitingTimeSettings = (waitingTimeSettingsValue) => {
  return waitingTimeSettingsValue.split(",").map(item => Number(item));
};

const WAITING_TIME_BREAK_POINTS = [0];

export const getWaitingTimeByWaitingOrder = (waitingBookingsCount: number, waitingTimeSettings): number => {
  let waitingTime;
  if (waitingBookingsCount == 0) {
    waitingTime = 0;
  } else if (waitingBookingsCount <= 5) {
    waitingTime = waitingTimeSettings[0] || 0;
  } else if (waitingBookingsCount >= 6 && waitingBookingsCount <= 10) {
    waitingTime = waitingTimeSettings[1] || 0;
  } else if (waitingBookingsCount >= 11 && waitingBookingsCount <= 20) {
    waitingTime = waitingTimeSettings[2] || 0;
  } else { // >= 21
    waitingTime = waitingTimeSettings[3] || 0;
  }

  return waitingTime;
};

export const calculateWaitingTimeForBookingGroups = (waitingBookings, waitingTimeSettings, includeSimulateBooking?: boolean) => {
  // Group waiting bookings by Barcode
  const waitingBookingGroups = uniqBy(waitingBookings, (booking: Booking) => {
    return booking.barCode;
  });

  const waitingTimes = {};
  const commonWaitingTime = getWaitingTimeByWaitingOrder(waitingBookingGroups.length, waitingTimeSettings);
  const totalWaitingBookingsTime = commonWaitingTime;

  // Calculate waiting time for each group
  for (let i = 0; i < waitingBookingGroups.length; i++) {
    const barCode = waitingBookingGroups[i].barCode;
    if (barCode != SIMULATE_COMING_USER_BOOKING_BARCODE) {
      waitingTimes[barCode] = commonWaitingTime;
    }
  }

  if (includeSimulateBooking && WAITING_TIME_BREAK_POINTS.includes(Object.keys(waitingTimes).length)) {
    waitingTimes[SIMULATE_COMING_USER_BOOKING_BARCODE] = commonWaitingTime;
  }

  return {
    waitingTimes,
    totalWaitingBookingsTime
  };
};

export const countBookingGroups = (bookings): number => {
  // Group bookings by Barcode
  const bookingGroups = uniqBy(bookings, (booking: Booking) => {
    return booking.barCode;
  });

  return bookingGroups.length;
};

export const sortWaitingBookings = (bookings) => orderBy(bookings, ["waitingOrder", "createdAt"], ["asc", "asc"]);

export const sortCallingBookings = (bookings) => orderBy(bookings, ["callingAt"], ["asc"]);

export const groupBookings = (bookings): Booking[] => {
  const barCodeBookings = [];
  const barCodeBookingsIndex = {};
  let barCodeIndex = 0;

  const sortedBookings = orderBy(bookings, ["createdAt"], ["asc"]);
  sortedBookings.forEach(booking => {
    if (!isNil(barCodeBookingsIndex[booking.barCode])) {
      barCodeBookings[barCodeBookingsIndex[booking.barCode]].adultQuantity += booking.adultQuantity;
      barCodeBookings[barCodeBookingsIndex[booking.barCode]].childQuantity += booking.childQuantity;
    } else {
      barCodeBookingsIndex[booking.barCode] = barCodeIndex;
      barCodeBookings.push(booking);
      barCodeIndex++;
    }
  });
  return barCodeBookings;
};

export const calculateWaitingOrder = (bookings) => {
  const barCodeOrder = {};
  bookings.forEach(booking => {
    if (!isNil(barCodeOrder[booking.barCode])) {
      booking.waitingOrder = barCodeOrder[booking.barCode];
    } else {
      booking.waitingOrder = Object.keys(barCodeOrder).length + 1;
      barCodeOrder[booking.barCode] = booking.waitingOrder;
    }
  });

  return bookings;
};
