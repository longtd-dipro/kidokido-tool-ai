import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import moment from "moment";
import { Booking, BookingStatus, PrismaClient } from "@prisma/client";

import checkPOSAuth from "libs/middleware/checkPOSAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import prisma from "utils/db";
import { POS_API_ERROR_MESSAGE, POS_API_RESULT_CODE } from "constants/pos-api-result";
import { POSResponse } from "models/Response";
import withPOSApiValidation from "libs/middleware/withPOSApiValidation";
import { barCodeSchema } from "libs/validation/posApiSchema";
import { canCheckIn, checkBookingsDate, checkBookingsStatus, checkExistingBarCode, checkPaymentStatus } from "utils/server/barcode";
import { withLogging } from "libs/middleware/withLogging";
import { DEFAULT_TRANSACTION_TIMEOUT, SHORT_DATE } from "constants/common";
import { getDateOneYearAgo } from "utils/date-time";
import { selectBookingsForUpdate } from "utils/server/sql";

const validate = withPOSApiValidation({
  schema: barCodeSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch }).use(checkPOSAuth);

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<POSResponse>) => {
  const { barCode } = req.body;
  const today = new Date();

  const where = { barCode: barCode as string, createdAt: { gte: getDateOneYearAgo(today) } };
  const bookingsForLocking = await prisma.booking.findMany({
    select: {
      id: true,
    },
    where
  });

  const bookingIdsForLocking = bookingsForLocking.map(b => b.id);
  const result = await prisma.$transaction(async (tx: PrismaClient) => {
    const bookings = await selectBookingsForUpdate(tx, bookingIdsForLocking);
    if (!bookings.length) {
      return { resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.INVALID_BAR_CODE };
    }

    if (!checkBookingsDate(bookings)) {
      const firstBooking = bookings[0];
      return {
        resultCode: POS_API_RESULT_CODE.E00000400,
        error: POS_API_ERROR_MESSAGE.INVALID_DATE_BAR_CODE,
        date: moment(firstBooking.date).format(SHORT_DATE),
      };
    }

    if (!checkBookingsStatus(bookings)) {
      return { resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.INVALID_STATUS_BAR_CODE };
    }
    if (!checkPaymentStatus(bookings)) {
      return { resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.INVALID_PAYMENT_BAR_CODE };
    }

    if (!canCheckIn(bookings)) {
      return { resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.ALREADY_USED_BAR_CODE };
    }

    const filteredBookings = bookings.filter((booking) => ![BookingStatus.Cancelled, BookingStatus.SystemCancelled].includes(booking.status as any));

    await updateCheckedInStatusBookingToDB(filteredBookings, tx);
  }, {
    timeout: DEFAULT_TRANSACTION_TIMEOUT
  });

  if (result) {
    return res.status(200).json(result);
  }

  res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000000 });
});

handler.delete(validate(handler), async (req: NextApiRequest, res: NextApiResponse<POSResponse>) => {
  const { barCode } = req.body;
  const today = new Date();

  const isExistingBarCode = await checkExistingBarCode(barCode);
  if (!isExistingBarCode) {
    return res.status(400).json({ resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.INVALID_BAR_CODE });
  }

  const bookings = await prisma.booking.findMany({
    where: { barCode: barCode as string, createdAt: { gte: getDateOneYearAgo(today) } },
    include: { PartialCheckout: { where: { deleted: false } } },
  });
  if (bookings.every((booking) => booking.status !== BookingStatus.CheckedIn)) {
    return res.status(400).json({ resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.BOOKING_HAS_NOT_CHECKED_IN });
  }

  await rollbackCheckedInBookings(bookings);

  res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000000 });
});

const rollbackCheckedInBookings = async (bookings) => {
  return await prisma.$transaction(async (tx) => {
    const updatePromises = [];
    const partialCheckedOutBookingIds = [];
    const hasFirstCheckedInBookingInSameBarcode = bookings.some((booking) => booking.status === BookingStatus.CheckedIn && !booking.firstCheckedInAt);
    for (const booking of bookings) {
      if (booking.status === BookingStatus.CheckedIn) {
        const wasReCheckedIn = !!booking.firstCheckedInAt;
        let partialCheckedOutAdultQuantity = undefined;
        let partialCheckedOutChildQuantity = undefined;

        if (booking.PartialCheckout.length) {
          partialCheckedOutAdultQuantity = null;
          partialCheckedOutChildQuantity = null;
          partialCheckedOutBookingIds.push(booking.id);
        }

        let status: BookingStatus = BookingStatus.Successful;
        if (wasReCheckedIn) {
          if (hasFirstCheckedInBookingInSameBarcode) {
            status = BookingStatus.Calling;
          } else {
            status = BookingStatus.CheckedOut;
          }
        }

        const dataToUpdate = {
          checkedInAt: wasReCheckedIn ? booking.firstCheckedInAt : null,
          status: status,
          requestedReCheckInAt: null,
          reCheckInCount: { decrement: booking.reCheckInCount ? 1 : 0 },
          partialCheckedOutAdultQuantity,
          partialCheckedOutChildQuantity,
        };

        updatePromises.push(tx.booking.update({
          where: { id: booking.id },
          data: dataToUpdate,
        }));
      }
    }
    await Promise.all(updatePromises);

    if (partialCheckedOutBookingIds.length) {
      await tx.partialCheckout.deleteMany({ where: { bookingId: { in: partialCheckedOutBookingIds } } });
    }
  }, { timeout: DEFAULT_TRANSACTION_TIMEOUT });
};

const updateCheckedInStatusBookingToDB = async (bookings: Booking[], tx: PrismaClient) => {
  const checkedInAt = new Date();
  const updatePromises = [];
  const partialCheckedOutbookingIds = [];
  for (const booking of bookings) {
    if (canCheckIn([booking])) {
      updatePromises.push(
        tx.booking.update({
          where: { id: booking.id },
          data: {
            checkedInAt,
            status: BookingStatus.CheckedIn,
            partialCheckedOutAdultQuantity: null,
            partialCheckedOutChildQuantity: null,
            partialCheckedOutAt: null,
            requestedReCheckInAt: null,
            reCheckInCount: { increment: booking.requestedReCheckInAt ? 1 : 0 },
          },
        })
      );
      partialCheckedOutbookingIds.push(booking.id);
    }
  }
  await Promise.all(updatePromises);

  if (partialCheckedOutbookingIds.length) {
    await tx.partialCheckout.deleteMany({ where: { bookingId: { in: partialCheckedOutbookingIds } } });
  }
};

export default withLogging(handler);
