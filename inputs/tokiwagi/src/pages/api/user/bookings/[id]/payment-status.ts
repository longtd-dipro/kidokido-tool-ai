import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { PaymentType, TicketType } from "@prisma/client";

import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { USER_BOOKING_SELECT_FIELDS, USER_TICKET_WITHIN_INCLUDE_FIELDS } from "utils/server/db-fields-selector";
import { ERROR_MESSAGES } from "constants/errors";
import withValidation from "libs/middleware/withValidation";
import { changePaymentStatusSchema } from "libs/validation/schemas";

const handler = nc({ onError, onNoMatch }).use(checkAuth);

const validate = withValidation({
  schema: changePaymentStatusSchema,
  mode: "body",
});

handler.patch(validate(handler), async (req: NextApiRequest, res: NextApiResponse) => {
  const { paymentStatus, isSmaregiScanned } = req.body;
  const booking = await prisma.booking.findFirst({
    where: {
      id: +req.query.id,
      userId: req.user.id,
    },
    select: {
      ...USER_BOOKING_SELECT_FIELDS,
      Ticket: {
        select: USER_TICKET_WITHIN_INCLUDE_FIELDS,
      },
    },
  });
  if (!booking) {
    res.status(400).json({ error: ERROR_MESSAGES.BOOKING_NOT_FOUND });
  }
  const canUpdatePaymentStatus = booking.Ticket?.paymentType === PaymentType.Offline ||
    !([TicketType.Monthly, TicketType.DailyTimesLimit] as unknown as string[]).includes(booking.Ticket?.type);

  const updateData: any = {
    isSmaregiScanned: isSmaregiScanned
  };
  if (canUpdatePaymentStatus) {
    updateData.paymentStatus = paymentStatus;
  }
  const updatedBooking = await prisma.booking.update({ where: { id: booking.id }, data: updateData });

  res.status(200).json({ data: { booking: updatedBooking } });
});

export default handler;