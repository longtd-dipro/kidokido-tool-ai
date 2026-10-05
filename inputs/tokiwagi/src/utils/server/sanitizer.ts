import { Booking } from "@prisma/client";

const BOOKING_EXCLUDED_FIELDS = ["Tenant", "Ticket", "User"];

export const sanitizeBookings = (bookings: Booking[]) => {
  if (!bookings) return;

  const sanitizedBookings = [];
  bookings.forEach((booking) => {
    sanitizedBookings.push(sanitizeBooking(booking));
  });

  return sanitizedBookings;
};

export const sanitizeBooking = (booking: Booking) => {
  if (!booking) return;
  const newBooking = { ...booking };
  BOOKING_EXCLUDED_FIELDS.forEach(field => {
    delete newBooking[field];
  });

  return newBooking;
};
