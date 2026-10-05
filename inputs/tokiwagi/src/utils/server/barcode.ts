import bwipjs from "bwip-js";
import { BookingStatus, PaymentStatus, TicketType } from "@prisma/client";
import randomString from "randomstring";

import { BARCODE_CHARSET, BARCODE_FORMAT, BARCODE_LENGTH } from "constants/booking";
import prisma from "utils/db";
import { Booking } from "models/Entity";
import { getDateOneYearAgo, isSameDay } from "utils/date-time";
import { isPartialCheckoutBooking, isHourlyBooking, isOneDayBooking } from "utils/booking";

export const generateBase64Barcode = (data: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: BARCODE_FORMAT,
        text: data,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: "center",
        backgroundcolor: "ffffff",
        paddingwidth: 8,
        paddingheight: 2,
      },
      function (error, buffer) {
        if (error) {
          reject(error);
        } else {
          const gifBase64 = `data:image/gif;base64,${buffer.toString("base64")}`;
          resolve(gifBase64);
        }
      }
    );
  });
};

export const checkExistingBarCode = async (barCode: string, tenantCode?: string) => {
  const today = new Date();

  const booking = await prisma.booking.findFirst({
    where: {
      barCode,
      createdAt: { gte: getDateOneYearAgo(today) },
      ...(tenantCode && { tenantCode }),
    },
  });

  return !!booking;
};

export const getBookingsByBarCode = async (barCode: string) => {
  const today = new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      barCode,
      createdAt: { gte: getDateOneYearAgo(today) },
    },
    include: {
      Ticket: {
        include: {
          TicketBookingSchedule: { where: { deleted: false } },
          TicketDetail: true,
          TicketDiscountSetting: true,
        },
      },
      PartialCheckout: { where: { deleted: false } },
      TicketBookingSchedule: true,
    },
  });
  return bookings;
};

export const checkBookingsDate = (bookings: Booking[]) => {
  const isInvalidDate = bookings.some((booking) => !isSameDay(booking.date, new Date()));
  return !isInvalidDate;
};

export const checkBookingsStatus = (bookings: Booking[]) => {
  const isInvalidBookingStatus = bookings.every((booking) => {
    return [BookingStatus.Cancelled, BookingStatus.SystemCancelled].includes(booking.status as any);
  });
  return !isInvalidBookingStatus;
};

export const checkPaymentStatus = (bookings: Booking[]) => {
  const isInvalidPaymentStatus = bookings.every((booking) => {
    return [PaymentStatus.Error, PaymentStatus.Refunded].includes(booking.paymentStatus as any);
  });
  return !isInvalidPaymentStatus;
};

export const canCheckIn = (bookings: Booking[]) => {
  const filteredBookings = bookings.filter((booking) => ![BookingStatus.Cancelled, BookingStatus.SystemCancelled].includes(booking.status as any));
  if (filteredBookings.length === 0) return false;

  // Filter not able to recheck-in bookings
  const canNotRecheckInBookings = filteredBookings.filter(
    (booking) => booking.status === BookingStatus.CheckedOut && 
    (booking.Ticket.type === TicketType.Hourly || booking.Ticket.type === TicketType.HourlyTimesLimit)
  );
  if (canNotRecheckInBookings.length === filteredBookings.length) return false;

  // Check request recheck-in for one day checked out bookings if any
  const alreadyCheckedOutOneDayBookings = filteredBookings.filter((booking) => isOneDayBooking(booking) && !!booking.checkedOutAt);
  if (alreadyCheckedOutOneDayBookings.length) {
    if (alreadyCheckedOutOneDayBookings.every((booking) => !booking.requestedReCheckInAt)) return false;
  }

  // Check bookings have partial checkout
  const checkingInBookings = filteredBookings.filter((item) => item.status === BookingStatus.CheckedIn);
  const canNotRecheckInPartialCheckoutBookings = checkingInBookings.filter((booking) => isHourlyBooking(booking) && isPartialCheckoutBooking(booking));
  if (canNotRecheckInPartialCheckoutBookings.length === filteredBookings.length) return false;

  for (const booking of checkingInBookings) {
    if (isOneDayBooking(booking) && isPartialCheckoutBooking(booking) && !booking.requestedReCheckInAt) {
      return false;
    }
  }

  return true;
};

export const generateBookingBarCode = async () => {
  let isExistingBarCode = true;
  let barCode = null;
  while (isExistingBarCode) {
    const generatedBarCode = randomString.generate({
      length: BARCODE_LENGTH,
      charset: BARCODE_CHARSET,
    });

    barCode = generatedBarCode;
    isExistingBarCode = await checkExistingBarCode(generatedBarCode);
  }

  return barCode;
};
