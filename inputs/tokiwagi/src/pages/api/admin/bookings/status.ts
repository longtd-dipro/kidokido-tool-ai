import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus } from "@prisma/client";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";
import { chooseNextCallingBookingsAndSendNotifications } from "utils/server/booking-queue";
import { getDateOneYearAgo, isSameDay } from "utils/date-time";
import { isOnlineBooking, isOnlineMonthlyBooking, isOnlineTimesLimitBooking } from "utils/booking";
import { cancelTransaction, searchTransaction } from "services/gmo.service";
import { parseGMOResponse } from "utils/gmo";
import { TRANSACTION_ERRORS } from "constants/booking";
import { checkIsValidChildQuantityAfterCancelBooking } from "utils/booking-validation";
import { Booking } from "models/Entity";
import { getSseCancelAndRefundSuccessPayload, registerSseNotification } from "utils/server/sse-hub";
import { cancelConfirmedTransactionForBooking, enabledTenantSmaregiSetting } from "utils/server/smaregiSync";
import { ERROR_MESSAGES } from "constants/errors";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.put(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = Number(req.body.id);
  const { status: newStatus } = req.body;
  const now = new Date();

  delete req.body.updatedAt;
  const updatedData = {
    status: BookingStatus[newStatus],
    waitingAt: undefined,
    callingAt: undefined,
    checkedInAt: undefined,
    checkedOutAt: undefined,
    cancelledAt: undefined,
    firstCheckedInAt: undefined,
    requestedReCheckInAt: undefined,
    paymentStatus: undefined,
    waitingOrder: null,
  };

  const currentBooking = await prisma.booking.findUnique({
    where: { id },
    include: { Ticket: true, User: true, Tenant: true },
  });

  // Calling must always follow Waiting in the entry-limit queue — block a direct jump into Calling
  // (e.g. accidentally moving an already-CheckedIn booking back to Calling).
  if (newStatus === BookingStatus.Calling && currentBooking.status !== BookingStatus.Waiting) {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_CALLING_STATUS_TRANSITION });
  }

  if (newStatus === BookingStatus.Waiting) {
    updatedData.waitingAt = now;
  } else if (newStatus === BookingStatus.Calling) {
    updatedData.callingAt = now;
  } else if (newStatus === BookingStatus.CheckedIn) {
    updatedData.checkedInAt = now;
    updatedData.requestedReCheckInAt = null;
  } else if (newStatus === BookingStatus.CheckedOut) {
    updatedData.checkedOutAt = now;
    updatedData.paymentStatus = PaymentStatus.Completed;
    updatedData.firstCheckedInAt = currentBooking.firstCheckedInAt ? currentBooking.firstCheckedInAt : currentBooking.checkedInAt;
    updatedData.requestedReCheckInAt = null;
  } else if (newStatus === BookingStatus.Cancelled || newStatus === BookingStatus.SystemCancelled) {
    if (currentBooking.checkedOutAt) {
      updatedData.status = BookingStatus.CheckedOut;
      updatedData.requestedReCheckInAt = null;
    }
    if (isOnlineBooking(currentBooking) && newStatus === BookingStatus.SystemCancelled) {
      const errMsg = await processRefund(currentBooking.id, currentBooking.tenantCode);
      if (errMsg) {
        return res.status(400).json({ error: errMsg });
      }
      updatedData.paymentStatus = PaymentStatus.Refunded;

      if (isOnlineMonthlyBooking(currentBooking) || isOnlineTimesLimitBooking(currentBooking)) {
        await processCancelMonthlyOneDayBookings(currentBooking.id);

      }
      // Whole season pass is being cancelled — its confirmed sale (if any) is now orphaned.
      if (enabledTenantSmaregiSetting(currentBooking.Tenant)) {
        void cancelConfirmedTransactionForBooking(currentBooking.Tenant.smaregiContractId, currentBooking);
      }
    }

    await processCancelInvalidQuantityBookings(currentBooking, newStatus);
    updatedData.cancelledAt = now;
  }

  const updatedBooking = await prisma.booking.update({
    where: {
      id: id,
    },
    data: updatedData,
  });

  // Record/remove the first user's checked out booking id
  if (newStatus === BookingStatus.CheckedOut) {
    // Record the first user's checked out booking id
    if (!currentBooking.User.firstCheckedOutBookingId) {
      await prisma.user.update({
        where: { id: currentBooking.User.id },
        data: {
          firstCheckedOutBookingId: currentBooking.id
        },
      });
    }
  } else {
    // Remove the first user's checked out booking id
    if (currentBooking.User.firstCheckedOutBookingId === currentBooking.id) {
      await prisma.user.update({
        where: { id: currentBooking.User.id },
        data: {
          firstCheckedOutBookingId: null
        },
      });
    }
  }

  const currentStatus = currentBooking.status as any;

  if (
    isSameDay(currentBooking.date, now) &&
    [BookingStatus.CheckedOut, BookingStatus.Cancelled, BookingStatus.SystemCancelled].includes(newStatus) &&
    [BookingStatus.Calling, BookingStatus.CheckedIn].includes(currentStatus)
  ) {
    await chooseNextCallingBookingsAndSendNotifications(currentBooking.ticketId);
  }

  registerSseNotification(currentBooking.User.id, getSseCancelAndRefundSuccessPayload());

  res.status(200).json({ data: updatedBooking });
});

const processRefund = async (bookingId: number, tenantCode: string) => {
  const searchResult = await searchTransaction(bookingId, tenantCode);

  const { ErrInfo: searchTransactionErrInfo, AccessID, AccessPass } = parseGMOResponse(searchResult);
  if (searchTransactionErrInfo) {
    return TRANSACTION_ERRORS[searchTransactionErrInfo];
  }

  const cancelTransactionResult = await cancelTransaction({ AccessID, AccessPass }, tenantCode);

  if (cancelTransactionResult.ErrInfo) {
    return TRANSACTION_ERRORS[cancelTransactionResult.ErrInfo];
  }
};

const processCancelInvalidQuantityBookings = async (mainBooking: Booking, newStatus: BookingStatus) => {
  const sameBarCodeBookings = await prisma.booking.findMany({
    where: {
      barCode: mainBooking.barCode,
      createdAt: { gte: getDateOneYearAgo(mainBooking.createdAt) },
      status: {
        in: [BookingStatus.Successful, BookingStatus.Calling, BookingStatus.CheckedIn, BookingStatus.Waiting],
      },
    },
    include: {
      Ticket: true,
    },
  });

  const isValid = checkIsValidChildQuantityAfterCancelBooking(mainBooking.id, sameBarCodeBookings);
  if (!isValid) {
    await prisma.booking.updateMany({
      where: {
        barCode: mainBooking.barCode,
        createdAt: { gte: getDateOneYearAgo(mainBooking.createdAt) },
        status: {
          in: [BookingStatus.Successful, BookingStatus.Calling, BookingStatus.CheckedIn, BookingStatus.Waiting],
        },
      },
      data: { status: newStatus },
    });
  }
};

const processCancelMonthlyOneDayBookings = async (onlineMonthlyBookingId: number) => {
  const oneDayMonthlyBookings = await prisma.booking.findMany({ where: { parentBookingId: onlineMonthlyBookingId } });

  for (const oneDayMonthlyBooking of oneDayMonthlyBookings) {
    const bookings = await prisma.booking.findMany({
      where: {
        barCode: oneDayMonthlyBooking.barCode,
        createdAt: { gte: getDateOneYearAgo(oneDayMonthlyBooking.createdAt) },
        status: {
          notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled],
        },
      },
      include: {
        Ticket: true,
      },
    });

    const isValid = checkIsValidChildQuantityAfterCancelBooking(oneDayMonthlyBooking.id, bookings);
    if (!isValid) {
      await prisma.booking.updateMany({
        where: {
          barCode: oneDayMonthlyBooking.barCode,
          createdAt: { gte: getDateOneYearAgo(oneDayMonthlyBooking.createdAt) },
          status: { in: [BookingStatus.Successful, BookingStatus.Calling, BookingStatus.CheckedIn, BookingStatus.Waiting] },
        },
        data: { status: BookingStatus.SystemCancelled },
      });
    }

    await prisma.booking.update({
      where: { id: oneDayMonthlyBooking.id },
      data: { status: BookingStatus.SystemCancelled },
    });
  }
};

export default handler;
