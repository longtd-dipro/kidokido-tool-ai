import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import moment from "moment";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import withValidation from "libs/middleware/withValidation";
import { ticketBookingFramesJsonSchema } from "libs/validation/ticketSchema";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { MINIMUM_MONTH_CAN_DELETE_BOOKING_SCHEDULE, ROLE } from "constants/common";
import { MESSAGES } from "constants/messages";
import { isDateInFuture } from "utils/date-time";
import { diffObicCodes, backfillObicCodesForTicket } from "utils/server/obicCodes";

const validate = withValidation({
  schema: ticketBookingFramesJsonSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  // eslint-disable-next-line no-unused-vars
  const payload = req.body.map(({ ticketType, ...item }) => item);
  const results = await prisma.ticketBookingSchedule.createMany({
    data: payload,
  });
  res.status(201).json({ data: results });
});

handler.put(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const payloads = req.body.map(({ ticketType, ...item }) => item);
  const ticketId = payloads[0].ticketId;

  const schedules = await prisma.ticketBookingSchedule.findMany({
    where: {
      ticketId,
    },
  });

  const oldSchedules = schedules.map((s) => ({
    id: s.id,
    baseAdultObicCode: s.baseAdultObicCode,
    baseChildObicCode: s.baseChildObicCode,
    extendedAdultObicCode: s.extendedAdultObicCode,
    extendedChildObicCode: s.extendedChildObicCode,
  }));

  const scheduleIds = schedules.map((item) => item.id);
  for (const scheduleId of scheduleIds) {
    const isNotExist = !payloads.some(({ id }) => id === scheduleId);
    if (isNotExist) {
      const booking = await prisma.booking.findFirst({ where: { ticketBookingScheduleId: scheduleId } });
      const isBookingScheduleOutOfDate = await checkIsTicketBookingScheduleOutOfDate(scheduleId);
      if (booking && !isBookingScheduleOutOfDate) {
        return res.status(400).json({ error: MESSAGES.CANNOT_REMOVE_TICKET_BOOKING_SCHEDULE });
      }

      const willBeDeletedBookingSchedule = schedules.find(s => s.id === scheduleId);
      const isScheduleInFutureDeleted = isDateInFuture(willBeDeletedBookingSchedule.dateFrom);
      await prisma.ticketBookingSchedule.update({
        where: { id: scheduleId },
        data: {
          deleted: true,
          isScheduleInFutureDeleted
        }
      });
    }
  }

  for (const payload of payloads) {
    await prisma.ticketBookingSchedule.upsert({
      where: {
        id: payload.id || 0,
      },
      update: {
        ...payload,
      },
      create: {
        ...payload,
      },
    });
  }

  const changes = diffObicCodes(
    { TicketBookingSchedule: oldSchedules },
    { TicketBookingSchedule: payloads },
  );
  const filledTransitions = changes.filter((c) => c.changeKind === "empty-to-filled");

  if (filledTransitions.length > 0) {
    await backfillObicCodesForTicket(ticketId, filledTransitions);
  }

  res.status(201).json({ data: null });
});

const checkIsTicketBookingScheduleOutOfDate = async (ticketBookingScheduleId: number) => {
  const ticketBookingSchedule = await prisma.ticketBookingSchedule.findUnique({ where: { id: ticketBookingScheduleId } });
  const today = moment();
  const dateTo = moment(ticketBookingSchedule?.dateTo);

  const isOutOfDate = today.diff(dateTo, "month", true) > MINIMUM_MONTH_CAN_DELETE_BOOKING_SCHEDULE;
  return isOutOfDate;
};

export default handler;
