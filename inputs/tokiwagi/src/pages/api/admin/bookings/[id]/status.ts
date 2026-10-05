import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { Booking, PaymentStatus, PaymentType, TicketType } from "@prisma/client";
import { isNil } from "lodash";

import { DEFAULT_TRANSACTION_TIMEOUT, ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { getDateOneYearAgo } from "utils/date-time";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.STAFF]));

handler.put(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = Number(req.query.id);
  const { posTotalAmount, coupons } = req.body;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return res.status(404).json({ error: "予約が見つかりません" });
  }

  const today = new Date();
  const sameBarcodeBookings = await prisma.booking.findMany({
    where: {
      barCode: booking.barCode,
      createdAt: { gte: getDateOneYearAgo(today) },
    },
    include: {
      Ticket: true,
    }
  });

  const hasOfflineBookings = sameBarcodeBookings.some((booking) => booking.Ticket.paymentType !== PaymentType.Online);
  let updatedTotalAmount: Boolean = false;
  await prisma.$transaction(async (tx) => {
    for (const booking of sameBarcodeBookings) {
      const dataToUpdate: Partial<Booking> = {
        coupons: coupons !== undefined ? coupons : booking.coupons,
        paymentStatus: PaymentStatus.Completed
      };

      const canUpdatePosTotalAmount = !isNil(posTotalAmount) &&
        (booking.Ticket.paymentType !== PaymentType.Online ||
          (!hasOfflineBookings && booking.Ticket.type == TicketType.HourlyTimesLimit && booking.parentBookingId));

      if (canUpdatePosTotalAmount) {
        if (!updatedTotalAmount) {
          dataToUpdate.posTotalAmount = posTotalAmount;
          updatedTotalAmount = true;
        } else {
          if (isNil(booking.posTotalAmount)) {
            dataToUpdate.posTotalAmount = 0 as any;
          }
        }
      }

      await tx.booking.update({
        where: { id: booking.id },
        data: dataToUpdate,
      });
    }
  },
  { timeout: DEFAULT_TRANSACTION_TIMEOUT }
  );

  res.status(200).json({ data: true });
});

export default handler;
