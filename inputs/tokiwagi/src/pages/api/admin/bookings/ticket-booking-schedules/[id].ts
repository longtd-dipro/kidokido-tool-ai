import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";
import withValidation from "libs/middleware/withValidation";
import { ticketBookingScheduleSchema } from "libs/validation/schemas";
import { chooseNextCallingBookingsAndSendNotifications } from "utils/server/booking-queue";
import { isBetweenOrSameDay } from "utils/date-time";

const handler = nc({ onError, onNoMatch }).use(checkAuth).use(roleAuth([ROLE.ADMIN]));

const validate = withValidation({
  schema: ticketBookingScheduleSchema,
  mode: "body",
});

handler.put(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = Number(req.query.id);
  const maxBookingPeople = Number(req.body.maxBookingPeople);

  const currentBookingSchedule = await prisma.ticketBookingSchedule.findUnique({ where: { id: id } });
      
  const updatedTicketBookingSchedule = await prisma.ticketBookingSchedule.update({
    where: {
      id: id
    },
    data: {
      maxBookingPeople
    }
  });

  // Move top 1 waiting booking to calling when increase max booking people for current date
  if (maxBookingPeople > currentBookingSchedule.maxBookingPeople
    && isBetweenOrSameDay(new Date(), currentBookingSchedule.dateFrom, currentBookingSchedule.dateTo)) {
    await chooseNextCallingBookingsAndSendNotifications(currentBookingSchedule.ticketId);
  }
  
  res.status(200).json({ data: updatedTicketBookingSchedule });
});

export default handler;
