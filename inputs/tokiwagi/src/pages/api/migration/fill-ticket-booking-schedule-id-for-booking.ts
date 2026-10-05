import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { getTicketBookingSchedule } from "utils/ticket";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const unfilledBookings = await prisma.booking.findMany({
    where: { ticketBookingScheduleId: null },
    include: {
      Ticket: { include: { TicketBookingSchedule: true } }
    }
  });

  let filledCount = 0;

  for (let i = 0; i < unfilledBookings.length; i++) {
    const unfilledBooking = unfilledBookings[i];
    let bookingDate = unfilledBooking.date.toISOString();
    if (unfilledBooking.parentBookingId) {
      const parentBooking = await prisma.booking.findUnique({
        where: { id: unfilledBooking.parentBookingId }
      });

      if (parentBooking) {
        bookingDate = parentBooking.date.toISOString();
      }
    }
    const ticketBookingSchedule = getTicketBookingSchedule(bookingDate, unfilledBooking.Ticket, true);

    if (ticketBookingSchedule) {
      await prisma.booking.update({
        where: { id: unfilledBooking.id },
        data: {
          ticketBookingScheduleId: ticketBookingSchedule.id
        }
      });
      filledCount++;
    }
  }

  res.status(200).json({ data: { unfilledBookings: unfilledBookings.length, filledCount } });
});

export default handler;
