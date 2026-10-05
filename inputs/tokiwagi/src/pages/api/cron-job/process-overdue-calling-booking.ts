import { BookingStatus, PrismaClient } from "@prisma/client";
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
import { checkIsValidChildQuantity } from "utils/booking-validation";
import { Booking } from "models/Entity";
import { selectBookingsForUpdate } from "utils/server/sql";
import { DEFAULT_TRANSACTION_TIMEOUT, DEFAULT_TOTAL_BOOKINGS_PROCESS_IN_BATCH } from "constants/common";
import { splitArrayIntoChunks } from "utils/array";

const handler = nc({ onError, onNoMatch });

// RUN every minute
handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  if (serverConfig.cronJob.enable) {
    const callingTimeDelayInMinute = Number(await getAppSettingByKey(APP_SETTING_KEY.CALLING_TIME_LIMIT_IN_MINUTES));
    const where = {
      date: newDateKeepLocalTime(),
      status: BookingStatus.Calling,
      AND: [
        {
          callingAt: {
            not: null,
          },
        },
        {
          callingAt: {
            lte: moment().subtract(callingTimeDelayInMinute, "minutes").toDate(),
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
        const overdueCallingBookings = await selectBookingsForUpdate(tx, bookingIdsForLockingChunk);

        for (const overdueCallingBooking of overdueCallingBookings) {
          barCodes.add(overdueCallingBooking.barCode);
          await processCancelOverdueCallingBooking(overdueCallingBooking, tx);
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

const processCancelOverdueCallingBooking = async (overdueCallingBooking: Booking, tx: PrismaClient) => {
  let updateData;
  if (overdueCallingBooking.checkedOutAt) {
    updateData = {
      status: BookingStatus.CheckedOut,
      requestedReCheckInAt: null,
    };
  } else {
    updateData = {
      status: BookingStatus.SystemCancelled,
      cancelledAt: new Date(),
    };
  }

  await tx.booking.update({
    where: {
      id: overdueCallingBooking.id,
    },
    data: updateData,
  });

  sendSystemCancelledNotificationEmail(overdueCallingBooking);

  await chooseNextCallingBookingsAndSendNotifications(overdueCallingBooking.ticketId);
};

const processCancelInvalidQuantityBookings = async (overdueBarCodes: Set<string>, tx: PrismaClient) => {
  const today = new Date();
  const bookings = await tx.booking.findMany({
    where: {
      status: BookingStatus.Calling,
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
        await processCancelOverdueCallingBooking(sameBarCodeBooking, tx);
      }
    }
  }
};

export default handler;
