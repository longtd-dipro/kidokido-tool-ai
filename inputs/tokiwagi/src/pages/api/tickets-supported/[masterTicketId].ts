import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import { getSlaveMonthlyTickets } from "utils/server/ticket";
import { getTicketBookingSchedule } from "utils/ticket";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const masterTicketId = +req.query.masterTicketId;
  const visibility = req.query.visibility ? req.query.visibility === "true" : undefined;
  const includeTenant = req.query.includeTenant === "true";
  const hasBookingSchedule = req.query.hasBookingSchedule === "true";
  const hasTodayBookingSchedule = req.query.hasTodayBookingSchedule === "true";

  let slaveTickets = await getSlaveMonthlyTickets(masterTicketId,
    { includeTenant, includeBookingSchedule: hasTodayBookingSchedule || hasBookingSchedule, visibility }
  );

  if (hasBookingSchedule) {
    slaveTickets = slaveTickets.filter((ticket) => {
      return ticket.TicketBookingSchedule?.length > 0;
    });
  }

  if (hasTodayBookingSchedule) {
    slaveTickets = slaveTickets.filter((ticket) => {
      if (ticket.TicketBookingSchedule?.length > 0) {
        return !!getTicketBookingSchedule(new Date(), ticket, false);
      }
      return false;
    });
  }

  res.status(200).json({ data: slaveTickets });
});

export default handler;
