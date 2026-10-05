import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
import moment from "moment";

import prisma from "utils/db";
import { TRANSACTION_ERRORS } from "constants/booking";
import { ROLE, SHORT_DATE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import { cancelTransaction, searchTransaction } from "services/gmo.service";
import { parseGMOResponse } from "utils/gmo";
import EmailService from "services/email.service";
import { EMAIL_SETTING_KEY } from "constants/settings";
import { formatCurrency } from "utils/number";
import { chooseNextCallingBookingsAndSendNotifications } from "utils/server/booking-queue";
import { checkStatusCanNotCancelBooking, isOnlineBooking, isOnlineOneDayBooking } from "utils/booking";
import { formatEmailTime, getDateOneYearAgo } from "utils/date-time";
import { logRequest } from "utils/server/request";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  logRequest(req);
  const { bookingId, shouldCancelAllSameBarcodeBookings } = req.body;
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { Ticket: true, User: true, Tenant: true } });
  const isPaymentOnlineBooking = isOnlineBooking(booking);

  const { result: canNotCancel, errorMessage } = checkStatusCanNotCancelBooking(booking.status);
  if (canNotCancel) {
    return res.status(400).json({ error: errorMessage });
  }

  if (isPaymentOnlineBooking) {
    const searchResult = await searchTransaction(bookingId, booking.tenantCode);
    const { ErrInfo: searchTransactionErrInfo, AccessID, AccessPass } = parseGMOResponse(searchResult);
    if (searchTransactionErrInfo) {
      return res.status(400).json({ error: TRANSACTION_ERRORS[searchTransactionErrInfo] });
    }

    const data = await cancelTransaction({ AccessID, AccessPass }, booking.tenantCode);
    const results = parseGMOResponse(data);
    if (results.ErrInfo) {
      return res.status(400).json({ error: TRANSACTION_ERRORS[results.ErrInfo] });
    }
  }

  const dataToUpdate = {
    status: BookingStatus.Cancelled,
    paymentStatus: isPaymentOnlineBooking ? PaymentStatus.Refunded : PaymentStatus.Pending,
    cancelledAt: new Date(),
  } as Prisma.BookingUpdateInput;
  if (booking.checkedOutAt) {
    dataToUpdate.status = BookingStatus.CheckedOut;
    dataToUpdate.paymentStatus = PaymentStatus.Completed;
    dataToUpdate.requestedReCheckInAt = null;
  }

  if (shouldCancelAllSameBarcodeBookings) {
    await prisma.booking.updateMany({
      where: { barCode: booking.barCode, createdAt: { gte: getDateOneYearAgo(booking.createdAt) } },
      data: dataToUpdate,
    });
  } else {
    await prisma.booking.update({
      where: { id: bookingId },
      data: dataToUpdate,
    });
  }

  EmailService.sendEmail([booking.User.email, booking.subEmail], EMAIL_SETTING_KEY.USER_CANCEL_BOOKING, {
    name: booking.User.name,
    booking: {
      ...booking,
      createdAt: moment(booking.createdAt).format(SHORT_DATE),
      date: moment(booking.date).format(SHORT_DATE),
      cancelledAt: moment().format(SHORT_DATE),
      totalAmount: formatCurrency(+booking.totalAmount),
      Tenant: {
        ...booking.Tenant,
        openedAt: formatEmailTime(booking.Tenant.openedAt),
        closedAt: formatEmailTime(booking.Tenant.closedAt),
        servedUtil: formatEmailTime(booking.Tenant.servedUtil),
      },
    },
  });

  if (!isOnlineOneDayBooking(booking) && ([BookingStatus.Calling, BookingStatus.Successful] as any).includes(booking.status)) {
    await chooseNextCallingBookingsAndSendNotifications(booking.ticketId);
  }

  res.status(200).json({ data: null });
});

export default handler;
