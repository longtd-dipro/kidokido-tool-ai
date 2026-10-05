import { Booking, PaymentStatus, PaymentType, Ticket } from "@prisma/client";

import { isHourlyTimesLimitTicket } from "utils/booking";
import { formatCurrencyStrictMode, formatCurrency } from "utils/number";

export const getTotalPosBookingAmount = (booking: Booking & { Ticket: Ticket }) => {
  if (booking?.paymentStatus !== PaymentStatus.Completed && booking?.paymentStatus !== PaymentStatus.Refunded) {
    return formatCurrency(0);
  }

  const ticket = booking.Ticket;
  if (booking?.posTotalAmount) {
    return formatCurrencyStrictMode(Number(booking.posTotalAmount));
  }

  const totalAmount = Number(booking?.totalAmount || 0);
  if (booking.parentBookingId) {
    if (isHourlyTimesLimitTicket(ticket)) {
      return formatCurrencyStrictMode(totalAmount);
    }
    return formatCurrency(0);
  }

  if (!ticket || ticket.paymentType === PaymentType.Online) {
    return formatCurrency(0);
  }

  return formatCurrencyStrictMode(totalAmount);
};
