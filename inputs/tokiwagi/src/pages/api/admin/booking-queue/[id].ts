import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus } from "@prisma/client";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";
import { chooseNextCallingBookingsAndSendNotifications } from "utils/server/booking-queue";
import { sendCallingNotificationEmail } from "utils/email";
import { getDateOneYearAgo } from "utils/date-time";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN]));

handler.put(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const needToSendCallingNotification = req.query.needToSendNotification;
  const id = Number(req.query.id);
  const { status: newStatus } = req.body;

  delete req.body.updatedAt;
  const updatedData = {
    status: BookingStatus[newStatus],
    waitingAt: undefined,
    callingAt: undefined,
    cancelledAt: undefined,
    requestedReCheckInAt: undefined,
    waitingOrder: null,
  };

  const currentBooking = await prisma.booking.findUnique({
    where: { id },
    include: {
      User: true,
    },
  });
  const currentStatus = currentBooking.status;
  const isCurrentCallingBooking = currentStatus === BookingStatus.Calling;

  const now = new Date();

  if (newStatus === BookingStatus.Calling) {
    updatedData.callingAt = now;
  } else if (newStatus === BookingStatus.Waiting) {
    updatedData.waitingAt = now;
  } else if (newStatus === BookingStatus.SystemCancelled) {
    if (currentBooking.checkedOutAt) {
      updatedData.status = BookingStatus.CheckedOut;
      updatedData.requestedReCheckInAt = null;
    }
    updatedData.cancelledAt = now;
  }

  const updatedBookings = await prisma.booking.updateMany({
    where: {
      barCode: currentBooking.barCode,
      createdAt: { gte: getDateOneYearAgo(currentBooking.createdAt) },
      status: currentStatus,
    },
    data: updatedData,
  });

  if (needToSendCallingNotification) {
    sendCallingNotificationEmail(currentBooking);
  }

  if (newStatus === BookingStatus.SystemCancelled && isCurrentCallingBooking) {
    await chooseNextCallingBookingsAndSendNotifications(currentBooking.ticketId);
  }

  res.status(200).json({ data: updatedBookings });
});

export default handler;
