import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus, TicketType } from "@prisma/client";

import { ROLE } from "constants/common";
import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { bookingTicketsPayloadSchema } from "libs/validation/bookingSchema";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));
  
const validate = withValidation({
  schema: bookingTicketsPayloadSchema,
  mode: "query",
});

handler.get(validate(handler), async (req: NextApiRequest, res: NextApiResponse) => {
  const { user } = req;
  const includeCancelledStatus = req.query.includeCancelledStatus;
  
  const acceptStatusList = includeCancelledStatus
    ? [BookingStatus.Successful, BookingStatus.Cancelled, BookingStatus.SystemCancelled]
    : [BookingStatus.Successful];
  
  const acceptPaymentStatusList = [PaymentStatus.Completed, PaymentStatus.Refunded];

  const filters = {
    AND: [
      {
        userId: user.id,
      },
      {
        paymentStatus: { in: acceptPaymentStatusList },
        status: { in: acceptStatusList },
        parentBookingId: null,
      },
      {
        Ticket: {
          type: {
            in: [TicketType.HourlyTimesLimit, TicketType.DailyTimesLimit],
          },
        },
      }
    ],
  };

  const totalTickets = await prisma.booking.count({
    where: filters,
  });

  res.status(200).json({ data: totalTickets });
});

export default handler;
