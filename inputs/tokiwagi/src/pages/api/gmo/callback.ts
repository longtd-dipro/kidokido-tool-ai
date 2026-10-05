import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus, TicketType } from "@prisma/client";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import { cancelTransaction, execute3DSAuthentication, executeSecureTransaction, get3DSAuthenticationResult } from "services/gmo.service";
import prisma from "utils/db";
import { serverConfig } from "config";
import { SECURE_AUTHENTICATION_ERRORS, TRANSACTION_ERRORS } from "constants/booking";
import { ERROR_MESSAGES } from "constants/errors";
import logger from "utils/logger";
import { ROUTE } from "constants/route";
import { sendOnlineBookingEmail } from "utils/server/booking";

const handler = nc({ onError, onNoMatch });

export enum AuthResultStatus {
  Y = "Y", // Authentication/card number verification successful
  A = "A", // Attempted processing was performed
  C = "C", // Authentication challenge required
  N = "N", // Unauthorized/card number not confirmed. Transaction refused
  U = "U", // Authentication/card number verification failed
  R = "R", // Authentication/card number verification rejected
}

export type AuthResult = {
  Tds2TransResult: AuthResultStatus,
  Tds2TransResultReason: string,
  ChallengeUrl: string
}

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { accessId, accessPass, bookingId, tenantCode, ticketType } = req.query;
  const { param, event } = req.body;

  // Pre-check if the booking is still pending
  if (bookingId) {
    const processingBooking = await prisma.booking.findFirst({
      where: {
        id: +bookingId,
        status: {
          not: BookingStatus.SystemCancelled,
        }
      },
    });

    // If booking is not found or its status is not pending, do not proceed.
    // This is to prevent processing a booking that has already been cancelled or completed.
    if (!processingBooking || processingBooking.paymentStatus !== PaymentStatus.Pending) {
      // Booking is not pending anymore, do not proceed
      logger.info({ type: "gmo-callback", bookingId, reason: "Booking is not pending anymore, do not proceed" });
      return res.status(200).json({ data: {} });
    }
  }

  const successPage = ticketType === TicketType.Monthly ?
    `${ROUTE.BUY_MONTHLY_TICKET_SUCCESS}?tenantCode=${tenantCode}` : ROUTE.BOOKING_PAYMENT_ONLINE_SUCCESS;
  const redirectUrlInFailurePage = ticketType === TicketType.Monthly ? ROUTE.BUY_MONTHLY_TICKET : ROUTE.BOOKING_PAYMENT_ONLINE;

  try {
    const authenticationResult = await getAuthenticationResult(event, accessId as string, accessPass as string, param);
    const { Tds2TransResult, Tds2TransResultReason, ChallengeUrl } = authenticationResult;

    if (Tds2TransResult === AuthResultStatus.Y || Tds2TransResult === AuthResultStatus.A) {
      await handleSuccessfulTransaction(accessId as string, accessPass as string, bookingId as string, successPage, redirectUrlInFailurePage, res);
    } else if (Tds2TransResult === AuthResultStatus.C) {
      return res.redirect(302, ChallengeUrl);
    } else {
      await handleFailedTransaction(Tds2TransResultReason, bookingId as string,
        accessId as string, accessPass as string, tenantCode as string, redirectUrlInFailurePage, res);
    }
  } catch (err) {
    await handleError(err, bookingId as string, redirectUrlInFailurePage, res);
  }
});

async function getAuthenticationResult(event: string, accessId: string, accessPass: string, param: any): Promise<AuthResult> {
  if (event === "AuthResultReady") {
    return (await get3DSAuthenticationResult(accessId, accessPass) as unknown) as AuthResult;
  } else {
    return (await execute3DSAuthentication(accessId, accessPass, param) as unknown) as AuthResult;
  }
}

async function handleSuccessfulTransaction(
  accessId: string,
  accessPass: string,
  bookingId: string,
  successPage: string,
  redirectUrlInFailurePage: string,
  res: NextApiResponse<IResponse>) {
  const txResult = await executeSecureTransaction(accessId, accessPass);
  const { ErrInfo, TranID } = txResult;

  if (!ErrInfo) {
    const booking = await prisma.booking.update({
      where: { id: +bookingId },
      data: { paymentStatus: PaymentStatus.Completed, GMOTransactionId: TranID },
      include: {
        Ticket: {
          include: {
            TicketDetail: true,
            TicketBookingSchedule: {
              where: {
                deleted: false,
                dateTo: { gte: new Date() },
              },
            },
          },
        },
        Tenant: true,
        User: true,
        BookingChildAgeInfo: true,
      }
    });

    sendOnlineBookingEmail(booking);

    return res.redirect(302, serverConfig.external.url + successPage);
  } else {
    await prisma.booking.deleteMany({
      where: { id: +bookingId },
    });
    const errMessage = TRANSACTION_ERRORS[ErrInfo] || ERROR_MESSAGES.PAYMENT_COMMON_ERROR;
    return res.redirect(302, serverConfig.external.url +
      `${ROUTE.BOOKING_PAYMENT_ONLINE_FAILURE}?error=${encodeURIComponent(errMessage)}&redirectUrl=${redirectUrlInFailurePage}`);
  }
}

async function handleFailedTransaction(
  Tds2TransResultReason: string,
  bookingId: string,
  accessId: string,
  accessPass: string,
  tenantCode: string,
  redirectUrlInFailurePage: string,
  res: NextApiResponse<IResponse>) {

  // Update booking status to SystemCancelled
  await prisma.booking.updateMany({
    where: { id: +bookingId },
    data: { status: BookingStatus.SystemCancelled },
  });

  cancelTransaction({ AccessID: accessId, AccessPass: accessPass }, tenantCode as string);

  const errMessage = SECURE_AUTHENTICATION_ERRORS[Tds2TransResultReason] || ERROR_MESSAGES.PAYMENT_COMMON_ERROR;
  logger.info({ type: "gmo-callback", bookingId, result: "failed", reason: errMessage, Tds2TransResultReason });
  return res.redirect(302, serverConfig.external.url +
    `${ROUTE.BOOKING_PAYMENT_ONLINE_FAILURE}?error=${encodeURIComponent(errMessage)}&redirectUrl=${redirectUrlInFailurePage}`);
}

async function handleError(err: any, bookingId: string, redirectUrlInFailurePage: string, res: NextApiResponse<IResponse>) {
  logger.info({ type: "gmo-callback", bookingId, result: "error", reason: err?.message });
  logger.error(err.stack || err.message);
  await prisma.booking.updateMany({
    where: { id: +bookingId },
    data: { status: BookingStatus.SystemCancelled },
  });
  const errMessage = ERROR_MESSAGES.PAYMENT_COMMON_ERROR;
  return res.redirect(302, serverConfig.external.url +
    `${ROUTE.BOOKING_PAYMENT_ONLINE_FAILURE}?error=${encodeURIComponent(errMessage)}&redirectUrl=${redirectUrlInFailurePage}`);
}

export default handler;
