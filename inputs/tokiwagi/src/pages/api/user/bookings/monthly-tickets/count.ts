import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus, TicketType } from "@prisma/client";

import checkAuth from "libs/middleware/checkAuth";
import prisma from "utils/db";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;
  const includeCancelledStatus = req.query.includeCancelledStatus;

  const acceptStatusList = includeCancelledStatus
    ? [BookingStatus.Successful, BookingStatus.Cancelled, BookingStatus.SystemCancelled]
    : [BookingStatus.Successful];

  const acceptPaymentStatusList = [PaymentStatus.Completed, PaymentStatus.Refunded];

  const totalBookingMonthlyTickets = await prisma.booking.count({
    where: {
      AND: [
        {
          userId: user.id,
        },
        {
          Ticket: {
            type: TicketType.Monthly,
          },
        },
        { paymentStatus: { in: acceptPaymentStatusList }, status: { in: acceptStatusList }, parentBookingId: null },
      ],
    },
  });

  res.status(200).json({
    data: totalBookingMonthlyTickets,
  });
});

export default handler;
