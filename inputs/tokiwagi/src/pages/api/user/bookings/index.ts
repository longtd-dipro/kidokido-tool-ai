import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { PaymentStatus } from "@prisma/client";

import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { USER_BOOKING_SELECT_FIELDS, USER_TENANT_WITHIN_INCLUDE_FIELDS, USER_TICKET_WITHIN_INCLUDE_FIELDS } from "utils/server/db-fields-selector";
import { attachFormattedTotalAmount } from "utils/booking";
import { getLatestBarcodeByBookingBarCode } from "utils/server/booking";

const handler = nc({ onError, onNoMatch }).use(checkAuth);

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const date = req.query.date as string;
  const fromDate = req.query.fromDate as string;

  const bookings = await prisma.booking.findMany({
    where: {
      AND: [
        { userId: req.user.id },
        { date: (date && new Date(date)) || (fromDate && { gte: new Date(fromDate) }) || undefined },
        {
          OR: [
            { GMOTransactionId: null },
            {
              paymentStatus: {
                not: PaymentStatus.Pending
              }
            },
            {
              paymentStatus: PaymentStatus.Pending,
              checkedOutAt: { not: null },
            }
          ]
        }
      ]
    },
    select: {
      ...USER_BOOKING_SELECT_FIELDS,
      Ticket: {
        select: {
          ...USER_TICKET_WITHIN_INCLUDE_FIELDS,
          TicketDetail: true,
          TicketDiscountSetting: true,
          TicketBookingSchedule: { where: { deleted: false } },
        },
      },
      Tenant: {
        select: USER_TENANT_WITHIN_INCLUDE_FIELDS,
      },
      BookingChildAgeInfo: true,
      PartialCheckout: { where: { deleted: false } },
    },
  });

  // Attach the latest active 仮販売 barcode to each checked-out booking. Bookings checked out
  // together share a group `barCode`; the newest Normal SmaregiTemporaryTransaction per group
  // (createdAt desc) is the one the POS can still scan.
  const latestSmaregiBarcodes = await getLatestBarcodeByBookingBarCode(bookings);

  const bookingsWithFormattedTotal = attachFormattedTotalAmount(bookings as any[]);

  const data = bookingsWithFormattedTotal.map((booking) => ({
    ...booking,
    smaregiTransactionBarcode: latestSmaregiBarcodes?.get(booking.barCode),
  }));

  res.status(200).json({ data });
});

export default handler;
