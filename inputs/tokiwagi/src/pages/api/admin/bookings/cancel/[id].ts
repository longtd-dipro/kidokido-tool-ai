import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus, PaymentType, TicketType } from "@prisma/client";
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
import { formatCurrency } from "utils/number";
import { EMAIL_SETTING_KEY } from "constants/settings";
import { checkStatusCanNotCancelBooking, isOnlineOneDayBooking, isTimesLimitTicket } from "utils/booking";
import { chooseNextCallingBookingsAndSendNotifications } from "utils/server/booking-queue";
import { formatEmailTime, getDateOneYearAgo } from "utils/date-time";
import { registerSseNotification, getSseCancelAndRefundSuccessPayload } from "utils/server/sse-hub";
import { cancelConfirmedTransactionForBooking, enabledTenantSmaregiSetting } from "utils/server/smaregiSync";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.put(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const bookingId = Number(req.query.id);
  const { shouldCancelAllSameBarcodeBookings, specificBookingBarCodeShouldCancelAll } = req.body;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { User: true, Tenant: true, Ticket: true } });
  const ticket = await prisma.ticket.findUnique({ where: { id: booking.ticketId } });

  const { result: canNotCancel, errorMessage } = checkStatusCanNotCancelBooking(booking.status);
  if (canNotCancel) {
    return res.status(400).json({ error: errorMessage });
  }

  const hadTransaction = booking.paymentStatus === PaymentStatus.Completed && ticket.paymentType === PaymentType.Online && !booking.parentBookingId;

  if (hadTransaction) {
    const searchResult = await searchTransaction(bookingId, booking.tenantCode);

    const { ErrInfo: searchTransactionErrInfo, AccessID, AccessPass } = parseGMOResponse(searchResult);
    if (searchTransactionErrInfo) {
      return res.status(400).json({ error: TRANSACTION_ERRORS[searchTransactionErrInfo] });
    }

    const cancelTransactionResult = await cancelTransaction({ AccessID, AccessPass }, booking.tenantCode);

    if (cancelTransactionResult.ErrInfo) {
      return res.status(400).json({ error: TRANSACTION_ERRORS[cancelTransactionResult.ErrInfo] });
    }
  }

  const dataToUpdate = {
    status: BookingStatus.SystemCancelled,
    paymentStatus: hadTransaction ? PaymentStatus.Refunded : PaymentStatus.Pending,
    cancelledAt: new Date(),
  };

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

  if ((booking.Ticket.type === TicketType.Monthly || isTimesLimitTicket(booking.Ticket.type)) && !booking.parentBookingId) {
    // if cancel monthly booking, then cancel all one day monthly bookings and all mixed bookings of them
    const oneDayMonthlyBookings = await prisma.booking.findMany({ where: { parentBookingId: booking.id } });

    for (const oneDayMonthlyBooking of oneDayMonthlyBookings) {
      const shouldCancelAllSameBarcodeMonthlyBookings = specificBookingBarCodeShouldCancelAll.includes(oneDayMonthlyBooking.barCode);
      if (shouldCancelAllSameBarcodeMonthlyBookings) {
        await prisma.booking.updateMany({
          where: { barCode: oneDayMonthlyBooking.barCode, createdAt: { gte: getDateOneYearAgo(oneDayMonthlyBooking.createdAt) } },
          data: { status: BookingStatus.SystemCancelled },
        });
      } else {
        await prisma.booking.update({
          where: { id: oneDayMonthlyBooking.id },
          data: { status: BookingStatus.SystemCancelled },
        });
      }
    }

    // Whole season pass is being cancelled — its confirmed sale (if any) is now orphaned.
    if (enabledTenantSmaregiSetting(booking.Tenant)) {
      void cancelConfirmedTransactionForBooking(booking.Tenant.smaregiContractId, booking);
    }
  }

  void Promise.all([
    EmailService.sendEmail(
      [booking.User.email, booking.subEmail],
      EMAIL_SETTING_KEY.ADMIN_CANCEL_BOOKING,
      {
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
      },
    ),
    registerSseNotification(
      booking.User.id,
      getSseCancelAndRefundSuccessPayload(),
    ),
  ]);

  if (!isOnlineOneDayBooking(booking) && ([BookingStatus.Calling, BookingStatus.Successful] as any).includes(booking.status)) {
    await chooseNextCallingBookingsAndSendNotifications(booking.ticketId);
  }

  res.status(200).json({ data: null });
});

export default handler;
