import { BookingStatus } from "@prisma/client";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { POS_API_ERROR_MESSAGE, POS_API_RESULT_CODE } from "constants/pos-api-result";
import checkPOSAuth from "libs/middleware/checkPOSAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { POSResponse } from "models/Response";
import { isBeforeTime } from "utils/date-time";
import withPOSApiValidation from "libs/middleware/withPOSApiValidation";
import { calculationPayAmountPayloadSchema } from "libs/validation/posApiSchema";
import { LONG_DATE } from "constants/common";
import { getBookingsByBarCode } from "utils/server/barcode";
import { withLogging } from "libs/middleware/withLogging";
import { calculateTotalBookingsPayAmount } from "utils/booking";
import prisma from "utils/db";

const validate = withPOSApiValidation({
  schema: calculationPayAmountPayloadSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch }).use(checkPOSAuth);

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<POSResponse>) => {
  const { barCode, payTimeAt } = req.body;

  const bookings = await getBookingsByBarCode(barCode);
  if (!bookings.length) {
    return res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.INVALID_BAR_CODE });
  }

  const checkedInBookings = bookings.filter((booking) => booking.status === BookingStatus.CheckedIn);

  if (checkedInBookings.length === 0) {
    return res.status(400).json({ resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.BOOKING_HAS_NOT_CHECKED_IN });
  }

  const parsedPayTimeAt = moment(payTimeAt, LONG_DATE).second(0);
  const checkedInAt = moment(checkedInBookings[0].checkedInAt);

  if (isBeforeTime(parsedPayTimeAt, checkedInAt)) {
    return res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.INVALID_PAY_TIME_AT });
  }

  const totalAmount = calculateTotalBookingsPayAmount(parsedPayTimeAt.toDate(), checkedInBookings);

  // Persist the quoted pay time so that check-out computes OBIC codes against the exact
  // same moment used to calculate (and charge) the amount here. Re-calling this API on the
  // same barcode overwrites the value with the latest quote.
  await prisma.booking.updateMany({
    where: { id: { in: checkedInBookings.map((booking) => booking.id) } },
    data: { tempCheckoutAt: parsedPayTimeAt.toDate() },
  });

  res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000000, totalAmount });
});

export default withLogging(handler);
