import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { Booking } from "@prisma/client";

import { DEFAULT_TRANSACTION_TIMEOUT, ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { calcTotalAmount, getPaymentInfoAfterUpdate } from "utils/server/booking";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.patch(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const bookingId = Number(req.query.id);
  const { adultQuantity, childQuantity, childAges } = req.body;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { User: true, Tenant: true, Ticket: true, TicketBookingSchedule: true },
  });
  const ticket = await prisma.ticket.findUnique({
    where: { id: booking.ticketId },
    include: {
      TicketBookingSchedule: { where: { deleted: false } },
      TicketDetail: true,
    },
  });

  const updateBookingPayload: Partial<Booking> = {
    id: bookingId,
    adultQuantity: booking.adultQuantity - adultQuantity,
    childQuantity: booking.childQuantity - childQuantity,
  };

  const newTotalAmount = calcTotalAmount(updateBookingPayload, ticket, booking.TicketBookingSchedule);
  updateBookingPayload.totalAmount = newTotalAmount;

  const { error } = await getPaymentInfoAfterUpdate(booking, newTotalAmount);
  if (error) {
    return res.status(400).json({ error });
  }

  await updateBookingToDB(updateBookingPayload, childAges);

  res.status(200).json({ data: null });
});

const updateBookingToDB = async (updateBooking, childAges) => {
  return await prisma.$transaction(async (tx) => {
    if (childAges.length) {
      const childAgeIds = childAges.map((item) => item.id);
      await tx.bookingChildAgeInfo.deleteMany({ where: { id: { in: childAgeIds } } });
    }

    const booking = await tx.booking.update({
      where: {
        id: +updateBooking.id,
      },
      data: updateBooking,
    });

    return booking;
  }, 
  { timeout: DEFAULT_TRANSACTION_TIMEOUT }
  );
};

export default handler;
