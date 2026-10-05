import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { chooseNextCallingBookingsAndSendNotifications } from "utils/server/booking-queue";
import { Booking } from "models/Entity";
import { validatePartialCheckoutPayload } from "utils/server/booking";
import { MESSAGES } from "constants/messages";
import { getCheckingInPeopleBooking } from "utils/booking";
import { calculateStayingDuration } from "utils/date-time";
import { logRequest } from "utils/server/request";
import { DEFAULT_TRANSACTION_TIMEOUT } from "constants/common";

const handler = nc({ onError, onNoMatch }).use(checkAuth);

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  logRequest(req);
  const bookingId = +req.query.id;
  const { adultQuantity, childQuantity, childAges } = req.body;

  const isValid = await validatePartialCheckoutPayload({ bookingId, adultQuantity, childQuantity, childAges });
  if (!isValid) {
    return res.status(400).json({ error: MESSAGES.INVALID_PROCESS_PARTIAL_CHECKOUT });
  }

  let booking: Booking;

  await prisma.$transaction(async (tx) => {
    const checkedOutAt = new Date();
    if (adultQuantity) {
      const dataToCreate = {
        bookingId,
        checkedOutAt,
        isAdult: true,
        quantity: adultQuantity,
      };
      await tx.partialCheckout.create({ data: dataToCreate });
    }

    if (childQuantity) {
      const dataToCreate = childAges.map((item) => ({
        bookingId,
        checkedOutAt,
        isAdult: false,
        quantity: 1,
        bookingChildAgeInfoId: item.id,
      }));
      await tx.partialCheckout.createMany({ data: dataToCreate });
    }

    booking = await tx.booking.findUnique({ where: { id: bookingId } });

    const isPartialCheckoutAllPeople = await checkIsPartialCheckoutAllPeople({ bookingId, adultQuantity, childQuantity });
    let partialCheckedOutAt = undefined;
    let lastStayDuration = undefined;
    let stayDuration = undefined;

    // Calculate and save stayDuration/lastStayDuration when booking proceed fully partial checked out all people
    if (isPartialCheckoutAllPeople) {
      partialCheckedOutAt = isPartialCheckoutAllPeople ? checkedOutAt : undefined;
      lastStayDuration = calculateStayingDuration(booking.checkedInAt, checkedOutAt);
      stayDuration = booking.stayDuration ? booking.stayDuration + lastStayDuration : lastStayDuration;
    }

    const bookingPartialCheckoutQuantity = {
      partialCheckedOutAdultQuantity: adultQuantity ? (booking.partialCheckedOutAdultQuantity || 0) + adultQuantity : booking.partialCheckedOutAdultQuantity,
      partialCheckedOutChildQuantity: childQuantity ? (booking.partialCheckedOutChildQuantity || 0) + childQuantity : booking.partialCheckedOutChildQuantity,
      partialCheckedOutAt,
      stayDuration,
      lastStayDuration,
    };

    await tx.booking.update({
      where: { id: bookingId },
      data: bookingPartialCheckoutQuantity,
    });
  }, { timeout: DEFAULT_TRANSACTION_TIMEOUT });

  if (booking) {
    await chooseNextCallingBookingsAndSendNotifications(booking.ticketId);
  }

  res.status(200).json({ data: null });
});

const checkIsPartialCheckoutAllPeople = async ({ bookingId, adultQuantity, childQuantity }) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { PartialCheckout: { where: { deleted: false } }, BookingChildAgeInfo: true },
  });

  const checkingIdPeople = getCheckingInPeopleBooking(booking);

  return adultQuantity === checkingIdPeople.adultQuantity && childQuantity === checkingIdPeople.childQuantity;
};

export default handler;
