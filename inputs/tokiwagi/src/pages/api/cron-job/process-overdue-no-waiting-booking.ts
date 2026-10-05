import { BookingStatus, PaymentStatus, PrismaClient } from "@prisma/client";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { groupBy } from "lodash";

import { serverConfig } from "config";
import { APP_SETTING_KEY } from "constants/settings";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import { getAppSettingByKey } from "utils/app-setting";
import { getDateOneYearAgo, newDateKeepLocalTime } from "utils/date-time";
import prisma from "utils/db";
import { sendSystemCancelledNotificationEmail } from "utils/email";
import { chooseNextCallingBookingsAndSendNotifications } from "utils/server/booking-queue";
import { Booking } from "models/Entity";
import { checkIsValidChildQuantity } from "utils/booking-validation";
import { DEFAULT_TOTAL_BOOKINGS_PROCESS_IN_BATCH, DEFAULT_TRANSACTION_TIMEOUT } from "constants/common";
import { selectBookingsForUpdate } from "utils/server/sql";
import { splitArrayIntoChunks } from "utils/array";

const handler = nc({ onError, onNoMatch });

// RUN every minute
handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  if (serverConfig.cronJob.enable) {
    const waitingTimeLimitInMinute = Number(await getAppSettingByKey(APP_SETTING_KEY.CALLING_TIME_LIMIT_IN_MINUTES));
    const where = {
      date: newDateKeepLocalTime(),
      status: BookingStatus.Successful,
      createdAt: {
        lte: moment().subtract(waitingTimeLimitInMinute, "minutes").toDate(),
      },
      OR: [
        {
          // Booking for normal One day ticket
          paymentStatus: PaymentStatus.Pending,
          GMOTransactionId: null,
        },
        {
          // Booking for One day of Monthly ticket
          paymentStatus: PaymentStatus.Completed,
          parentBookingId: {
            not: null,
          },
        },
      ],
    };

    const overdueBookingsForLocking = await prisma.booking.findMany({
      select: {
        id: true,
      },
      where
    });

    const bookingIdsForLocking = overdueBookingsForLocking.map(b => b.id);
    const bookingIdsForLockingChunks = splitArrayIntoChunks(bookingIdsForLocking, DEFAULT_TOTAL_BOOKINGS_PROCESS_IN_BATCH);
    const barCodes = new Set<string>();
    for (const bookingIdsForLockingChunk of bookingIdsForLockingChunks) {
      await prisma.$transaction(async (tx: PrismaClient) => {
        const overdueBookings = await selectBookingsForUpdate(tx, bookingIdsForLockingChunk);

        for (const overdueBooking of overdueBookings) {
          barCodes.add(overdueBooking.barCode);
          await processCancelOverdueSuccessfulBooking(overdueBooking, tx);
        }

        barCodes.size !== 0 && (await processCancelInvalidQuantityBookings(barCodes, tx));
      }, {
        timeout: DEFAULT_TRANSACTION_TIMEOUT
      });
    }

    res.status(200).json({ data: "OK" });
  } else {
    res.status(200).json({ data: "Cron job is not enable" });
  }
});

const processCancelInvalidQuantityBookings = async (overdueBarCodes: Set<string>, tx: PrismaClient) => {
  const today = new Date();
  const bookings = await tx.booking.findMany({
    where: {
      status: BookingStatus.Successful,
      barCode: {
        in: Array.from(overdueBarCodes),
      },
      createdAt: {
        gte: getDateOneYearAgo(today),
      },
    },

    include: {
      User: true,
      Tenant: true,
      Ticket: true,
    },
  });

  const groupByBarCodeBookings = groupBy(bookings, "barCode");
  for (const [, sameBarCodeBookings] of Object.entries(groupByBarCodeBookings)) {
    const isValidChildQuantity = checkIsValidChildQuantity(sameBarCodeBookings);
    if (!isValidChildQuantity) {
      for (const sameBarCodeBooking of sameBarCodeBookings) {
        await processCancelOverdueSuccessfulBooking(sameBarCodeBooking, tx);
      }
    }
  }
};

const processCancelOverdueSuccessfulBooking = async (overdueBooking: Booking, tx: PrismaClient) => {
  await tx.booking.update({
    where: {
      id: overdueBooking.id,
    },
    data: {
      status: BookingStatus.SystemCancelled,
      cancelledAt: new Date(),
    },
  });

  sendSystemCancelledNotificationEmail(overdueBooking);

  await chooseNextCallingBookingsAndSendNotifications(overdueBooking.ticketId);
};

export default handler;
