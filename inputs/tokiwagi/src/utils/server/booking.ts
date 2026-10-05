import { BookingStatus, SmaregiTemporaryStatus, Tenant, TicketType } from "@prisma/client";
import { groupBy, uniq } from "lodash";
import moment from "moment/moment";

import { TRANSACTION_ERRORS } from "constants/booking";
import { Booking } from "models/Entity";
import { changeTransactionAmount, searchTransaction } from "services/gmo.service";
import {
  calculateDeadlineMonthlyTicket,
  getCheckingInPeopleBooking,
  getDailyBookingTotalPrices,
  getMonthlyBookingTotalPrices,
  getShortBarCode,
  isOnlineMonthlyBooking,
  isOnlineMonthlyTicket,
  isOnlineOneDayBooking,
  isOnlineOneDayTicket,
  isTimesLimitTicket,
} from "utils/booking";
import prisma from "utils/db";
import { parseGMOResponse } from "utils/gmo";
import { formatEmailTime, isSameOrBeforeDay } from "utils/date-time";
import { CHECK_IN_OUT_TENANT_VERSION, JP_LONG_DATE_SLASH, SHORT_DATE } from "constants/common";
import { getAgeLabel } from "utils/ticket";
import { formatThousands } from "utils/common";
import { PAYMENT_TYPE_OPTIONS } from "constants/ticket";
import { generateBase64Barcode } from "utils/server/barcode";
import { BARCODE_IMG_CID, EMAIL_SETTING_KEY } from "constants/settings";
import { compileEmailContent } from "utils/email";
import { BOOKINGS_INFO_TEMPLATE, MONTHLY_BOOKING_INFO_TEMPLATE } from "constants/email-template";
import { serverConfig } from "config";
import EmailService from "services/email.service";
import { getS3CommonJson } from "utils/aws-s3";

export const getPaymentInfoAfterUpdate = async (originalBooking, newTotalAmount) => {
  let isChangePaymentAmount = false;
  let isRefunded = null;

  if (isOnlineOneDayBooking(originalBooking) || isOnlineMonthlyBooking(originalBooking)) {
    const needToUpdateTransaction = newTotalAmount !== originalBooking.totalAmount.toNumber();

    if (needToUpdateTransaction) {
      const searchResult = await searchTransaction(originalBooking.id, originalBooking.tenantCode);
      const { ErrInfo: searchTransactionErrInfo, AccessID, AccessPass } = parseGMOResponse(searchResult);
      if (searchTransactionErrInfo) {
        return { error: TRANSACTION_ERRORS[searchTransactionErrInfo] };
      }

      const changeAmountResult = await changeTransactionAmount({ AccessID, AccessPass }, newTotalAmount, originalBooking.tenantCode);
      const { ErrInfo: changeAmountTransactionErrInfo } = parseGMOResponse(changeAmountResult);
      if (changeAmountTransactionErrInfo) {
        return { error: TRANSACTION_ERRORS[changeAmountTransactionErrInfo] };
      }

      isChangePaymentAmount = true;
      isRefunded = newTotalAmount < originalBooking.totalAmount.toNumber();
    }
  }

  return { isChangePaymentAmount, isRefunded };
};

export const calcTotalAmount = (updateBooking, ticket, originTicketBookingSchedule) => {
  let newTotalAmount = null;

  if (isOnlineMonthlyTicket(ticket) && !updateBooking.parentBookingId) {
    const totalPrices = getMonthlyBookingTotalPrices(updateBooking.adultQuantity, updateBooking.childQuantity, ticket);
    newTotalAmount = totalPrices.totalAmount;
  }

  if (isOnlineOneDayTicket(ticket)) {
    const totalPrices = getDailyBookingTotalPrices(updateBooking.adultQuantity, updateBooking.childQuantity, ticket, originTicketBookingSchedule);
    newTotalAmount = totalPrices.totalAmount;
  }

  return newTotalAmount;
};

export const validatePartialCheckoutPayload = async ({ bookingId, adultQuantity, childQuantity, childAges }) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { PartialCheckout: { where: { deleted: false } }, BookingChildAgeInfo: true },
  });
  const checkingIdPeople = getCheckingInPeopleBooking(booking);

  if (adultQuantity > checkingIdPeople.adultQuantity || childQuantity > checkingIdPeople.childQuantity) {
    return false;
  }

  if (childAges.length) {
    const hasAtLeastOneInvalidChildAge = childAges.some((item) => !checkingIdPeople.childAges.find((childAge) => childAge.id === item.id));
    if (hasAtLeastOneInvalidChildAge) return false;
  }

  return true;
};

export const checkIsFirstTimeUsingMonthlyTicket = async (booking: Booking) => {
  const firstCheckedInOrCheckedOutBooking = await prisma.booking.findFirst({
    where: {
      AND: [
        { parentBookingId: booking.parentBookingId, },
        {
          OR: [
            { status: BookingStatus.CheckedOut },
            { status: { in: [BookingStatus.Calling, BookingStatus.Waiting, BookingStatus.CheckedIn, BookingStatus.Successful] }, checkedOutAt: { not: null } }
          ]
        }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  if (!firstCheckedInOrCheckedOutBooking) {
    // If there is no checked in or checked out booking, we consider it as the first time using the monthly ticket
    return true;
  } else {
    // If there is a checked in or checked out booking, we check if the current booking is the first one
    return booking.id === firstCheckedInOrCheckedOutBooking?.id;
  }
};

export const checkIfAlreadyUsedMonthlyTicket = async (parentBookingId: number) => {
  const oneDayMonthlyBooking = await prisma.booking.findFirst({
    where: { parentBookingId: parentBookingId, status: { notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled] } }
  });
  return !!oneDayMonthlyBooking;
};

export const augmentFirstTimeUsingMonthlyTicketPropForBookings = async (bookings: Booking[]) => {
  const parentBookingIds = uniq(
    bookings
      .filter((booking) => !!booking.parentBookingId)
      .map((booking) => booking.parentBookingId)
  );

  const oneDayMonthlyBookings = await prisma.booking.findMany({
    where: {
      AND: [
        { parentBookingId: { in: parentBookingIds }, },
        {
          OR: [
            { status: BookingStatus.CheckedOut },
            { status: { in: [BookingStatus.Calling, BookingStatus.Waiting, BookingStatus.CheckedIn, BookingStatus.Successful] }, checkedOutAt: { not: null } }
          ]
        }
      ]
    },
    orderBy: { createdAt: "asc" },
  });

  const parentBookingGroups = groupBy(oneDayMonthlyBookings, "parentBookingId");

  bookings.forEach((booking) => {
    booking["isFirstTimeUsingMonthlyTicket"] = booking.id === parentBookingGroups[booking.parentBookingId]?.[0]?.id;
  });
};

export const checkHasOnlineBookingFromGMO = async (gmoSettingId: number) => {
  const gmoSetting = await prisma.gMOSetting.findUnique({
    where: {
      id: gmoSettingId,
    },
    include: {
      Tenant: true,
    },
  });

  const tenantCodes = gmoSetting.Tenant.map((tenant) => tenant.code);

  const booking = await prisma.booking.findFirst({
    where: {
      GMOTransactionId: { not: null },
      status: {
        notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled],
      },
      tenantCode: {
        in: tenantCodes,
      },
    },
  });

  return !!booking;
};

export const checkHasOnlineBookingFromTenant = async (tenantCode: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      GMOTransactionId: { not: null },
      status: {
        notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled],
      },
      tenantCode,
    },
  });

  return !!booking;
};

export const getSupportedTenantMonthlyBookings = async (
  userId: number,
  tenantCode: string,
  includeDeadlineDate: boolean,
  onlyIncludeSupportedTenantIfAlreadyUseTheFirstTime: boolean
) => {
  const supportedTenantMonthlyBookings = [];
  const userBuyAtOtherTenantsMonthlyBookings: Booking[] = await prisma.booking.findMany({
    where: {
      userId,
      Ticket: {
        type: TicketType.Monthly,
        masterTicketId: {
          not: null
        }
      },
      parentBookingId: null,
      tenantCode: {
        not: tenantCode
      },
      status: BookingStatus.Successful
    },
    include: {
      Ticket: {
        include: {
          TicketDetail: true,
          TicketBookingSchedule: {
            where: { deleted: false },
          }
        }
      },
      BookingChildAgeInfo: true,
    }
  });

  for (let userBuyAtOtherTenantsMonthlyBooking of userBuyAtOtherTenantsMonthlyBookings) {
    if (onlyIncludeSupportedTenantIfAlreadyUseTheFirstTime) {
      const alreadyUsedMonthlyTicket = await checkIfAlreadyUsedMonthlyTicket(userBuyAtOtherTenantsMonthlyBooking.id);
      if (!alreadyUsedMonthlyTicket) {
        continue;
      }
    }
    const supportedThisTenantTicket = await prisma.ticket.findFirst({
      where: {
        masterTicketId: userBuyAtOtherTenantsMonthlyBooking.Ticket.masterTicketId,
        tenantCode: tenantCode
      },
      include: {
        TicketDetail: true,
        TicketBookingSchedule: {
          where: { deleted: false },
        },
        TicketDiscountSetting: true,
      }
    });

    if (supportedThisTenantTicket) {
      // Check if the booking in original ticket is still unexpired
      const originalBookingDeadline = calculateDeadlineMonthlyTicket(userBuyAtOtherTenantsMonthlyBooking.date, userBuyAtOtherTenantsMonthlyBooking.Ticket);
      if (isSameOrBeforeDay(moment(), originalBookingDeadline)) {
        userBuyAtOtherTenantsMonthlyBooking.ticketId = supportedThisTenantTicket.id;
        userBuyAtOtherTenantsMonthlyBooking.tenantCode = supportedThisTenantTicket.tenantCode;
        userBuyAtOtherTenantsMonthlyBooking.Ticket = supportedThisTenantTicket;

        if (includeDeadlineDate) {
          userBuyAtOtherTenantsMonthlyBooking.deadlineDate = originalBookingDeadline;
          // remove unnecessary deleted booking schedule in Ticket
          userBuyAtOtherTenantsMonthlyBooking.Ticket.TicketBookingSchedule
            = userBuyAtOtherTenantsMonthlyBooking.Ticket.TicketBookingSchedule?.filter(schedule => !schedule.deleted);
        }

        supportedTenantMonthlyBookings.push(userBuyAtOtherTenantsMonthlyBooking);
      }
    }
  }

  return supportedTenantMonthlyBookings;
};

export const sendOnlineBookingEmail = async (booking: Booking) => {
  const ticketType = booking.Ticket.type;
  const isGroupTicket = ticketType === TicketType.Monthly || isTimesLimitTicket(ticketType);
  const emailData = {
    ...booking,
    date: moment(booking.date).format(isGroupTicket ? JP_LONG_DATE_SLASH : SHORT_DATE),
    childAges: booking.BookingChildAgeInfo.map((item) => getAgeLabel(item.childAgeInMonth)),
    totalAmount: formatThousands(+booking.totalAmount),
    createdAt: moment(booking.createdAt).format(JP_LONG_DATE_SLASH),
    Tenant: {
      ...booking.Tenant,
      openedAt: formatEmailTime(booking.Tenant.openedAt),
      closedAt: formatEmailTime(booking.Tenant.closedAt),
      servedUtil: formatEmailTime(booking.Tenant.servedUtil),
    },
    Ticket: {
      ...booking.Ticket,

      paymentType: PAYMENT_TYPE_OPTIONS.find(({ value }) => value === booking.Ticket.paymentType).label,
    },
    deadlineDate: isGroupTicket &&
      moment(calculateDeadlineMonthlyTicket(isTimesLimitTicket(ticketType) ? booking.createdAt : booking.date, booking.Ticket))
        .format(JP_LONG_DATE_SLASH),
  };

  const barcodeBase64 = await generateBase64Barcode(booking.barCode);
  const emailKey =
    isGroupTicket ? EMAIL_SETTING_KEY.MONTHLY_BOOKING_SUCCESSFUL : EMAIL_SETTING_KEY.ONE_DAY_ONLINE_BOOKING_SUCCESSFUL;
  const bookingsInfo =
    isGroupTicket
      ? compileEmailContent(MONTHLY_BOOKING_INFO_TEMPLATE, { data: { booking: emailData } })
      : compileEmailContent(BOOKINGS_INFO_TEMPLATE, { data: { bookings: [emailData] } });

  let bookingHistoryLink;
  if (isGroupTicket) {
    bookingHistoryLink = `${serverConfig.external.url}/user/my-page/monthly-ticket-status?userId=${booking.userId}`;
  } else {
    bookingHistoryLink = `${serverConfig.external.url}/user/my-page/booking-history?userId=${booking.userId}`;
  }

  EmailService.sendEmail([booking.User.email, booking.subEmail], emailKey, {
    name: booking.User.name,
    bookings: [emailData],
    bookingsInfo,
    bookingHistoryLink: `<a href=${bookingHistoryLink}>確認</a>`,
    bookingHistoryLinkEng: `<a href=${bookingHistoryLink}>Confirmation</a>`,
    barcodeImgSrc: barcodeBase64,
    barcodeImgTag: `<img src="cid:${BARCODE_IMG_CID}" alt="bar code" />`,
    shortBarCode: getShortBarCode(booking.barCode),
    cid: BARCODE_IMG_CID,
    attachments: booking.Ticket.type !== TicketType.Monthly && [
      {
        content: barcodeBase64.split("base64,")[1],
        encoding: "base64",
        cid: BARCODE_IMG_CID,
        filename: "barcode",
      },
    ],
  });
};

export const getHiddenTenantTicketNames = async (tenantCode: string) => {
  let hiddenTenantTicketNames = [];
  try {
    const hiddenTicketsList = await getS3CommonJson(`${serverConfig.env}/hidden-tickets.json`);
    hiddenTenantTicketNames = (hiddenTicketsList as { tenantCode: string, hiddenTicketNames: string[] }[])?.find(
      (item) => item.tenantCode === tenantCode
    )?.hiddenTicketNames || [];
  } catch (error) {
    console.error("Failed to fetch hidden-tickets.json from S3", error);
  }

  return hiddenTenantTicketNames;
};

type BookingExtends = Booking & { Tenant: Tenant };
export async function getLatestBarcodeByBookingBarCode(bookings: BookingExtends[]) {
  const latestBarcodeByBookingBarCode = new Map<string, string>();

  const checkedOutBarCodes = bookings
    ?.filter((b) => b.checkedOutAt && b.barCode && b.Tenant.allowedVersion === CHECK_IN_OUT_TENANT_VERSION)
    ?.map((b) => b.barCode as string);

  if (checkedOutBarCodes?.length > 0) {
    const temporaryTransactions = await prisma.smaregiTemporaryTransaction.findMany({
      where: {
        bookingBarCode: { in: checkedOutBarCodes },
        status: SmaregiTemporaryStatus.Normal,
      },
      select: { bookingBarCode: true, temporaryTransactionBarcode: true },
      distinct: ["bookingBarCode"],
      orderBy: { createdAt: "desc" },
    });
    for (const temporaryTransaction of temporaryTransactions) {
      latestBarcodeByBookingBarCode.set(temporaryTransaction.bookingBarCode, temporaryTransaction.temporaryTransactionBarcode as string);
    }
  }
  return latestBarcodeByBookingBarCode;
}