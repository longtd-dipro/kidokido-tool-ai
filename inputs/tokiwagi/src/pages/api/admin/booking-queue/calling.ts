import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus } from "@prisma/client";
import { uniqBy } from "lodash";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { LONG_TIME, ROLE } from "constants/common";
import { formatDuration, newDateKeepLocalTime } from "utils/date-time";
import { Booking } from "models/Entity";
import { isAccumulativeBooking, isStandardAloneBooking } from "utils/booking";

const handler = nc({ onError, onNoMatch }).use(checkAuth).use(roleAuth([ROLE.ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;

  const callingBookings = await prisma.booking.findMany({
    where: {
      tenantCode: user.tenantCode,
      date: newDateKeepLocalTime(),
      status: BookingStatus.Calling,
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
          phone: true,
        }
      },
      Ticket: {
        select: {
          id: true,
          name: true
        }
      },
      TicketBookingSchedule: true,
    },
    orderBy: [
      {
        callingAt: "asc",
      }
    ]
  });

  const accumulativeCallingBookings = callingBookings.filter((booking) => isAccumulativeBooking(booking as Booking));
  augmentCallingDuration(accumulativeCallingBookings);

  const standardAloneCallingBookings = callingBookings.filter(booking => isStandardAloneBooking(booking as Booking));
  let standardAloneTickets = standardAloneCallingBookings.map(booking => booking.Ticket);
  standardAloneTickets = uniqBy(standardAloneTickets, ticket => ticket.id);

  const standaloneCallingBookings = [];
  for (const ticket of standardAloneTickets) {
    const ticketCallingBookings = standardAloneCallingBookings.filter((booking) => booking.ticketId === ticket.id);
    if (ticketCallingBookings.length) {
      augmentCallingDuration(ticketCallingBookings);
      standaloneCallingBookings.push({
        ticketId: ticket.id,
        ticketName: ticket.name,
        callingBookings: ticketCallingBookings,
      });
    }
  }

  res.status(200).json({
    data: {
      accumulativeCallingBookings,
      standaloneCallingBookings
    }
  });
});

const augmentCallingDuration = (callingBookings) => {
  const now = new Date();
  callingBookings.forEach(booking => {
    booking.callingDuration = booking.callingAt ? formatDuration(now, booking.callingAt, LONG_TIME) : "";
  });
};

export default handler;
