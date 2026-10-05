import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus } from "@prisma/client";
import { isNull } from "lodash";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { LONG_TIME, ROLE } from "constants/common";
import { getTicketBookingSchedule } from "utils/ticket";
import { countTotalCheckedInAdult, countTotalCheckedInChild, countTotalPeopleForBookings } from "utils/booking";
import { APP_SETTING_KEY } from "constants/settings";
import { getAppSettingByKey } from "utils/app-setting";
import { calculateWaitingTimeForBookingGroups, countBookingGroups, parseWaitingTimeSettings, sortWaitingBookings } from "utils/waiting-booking";
import { Booking } from "models/Entity";
import { formatDuration, newDateKeepLocalTime } from "utils/date-time";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;

  const tickets = await prisma.ticket.findMany({
    where: {
      tenantCode: user.tenantCode,
    },
    include: {
      Tenant: true,
      TicketBookingSchedule: { where: { deleted: false } },
    },
  });

  const today = new Date();
  const accumulativeMaxPeopleTickets = tickets.filter((ticket) => {
    const ticketBookingSchedule = getTicketBookingSchedule(today.toISOString(), ticket);
    return ticketBookingSchedule && !isNull(ticketBookingSchedule.maxBookingPeople) && ticketBookingSchedule.maxBookingPeopleAccumulative;
  });
  const accumulativeMaxPeopleTicketIds = accumulativeMaxPeopleTickets.map((ticket) => ticket.id);

  const waitingBookings = await prisma.booking.findMany({
    where: {
      tenantCode: req.user.tenantCode,
      status: BookingStatus.Waiting,
      date: newDateKeepLocalTime(),
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      Ticket: {
        select: {
          name: true,
        },
      },
    },
  });

  const checkInBookings = await prisma.booking.findMany({
    where: {
      tenantCode: req.user.tenantCode,
      status: BookingStatus.CheckedIn,
      date: newDateKeepLocalTime(),
    },
  });

  const accumulativeWaitingBookings: Booking[] = sortWaitingBookings(
    waitingBookings.filter((booking) => accumulativeMaxPeopleTicketIds.includes(booking.ticketId))
  );
  augmentWaitingDuration(accumulativeWaitingBookings);

  const standaloneWaitingBookings = [];

  for (const ticket of tickets) {
    if (!accumulativeMaxPeopleTicketIds.includes(ticket.id)) {
      const ticketWaitingBookings: Booking[] = sortWaitingBookings(waitingBookings.filter((booking) => booking.ticketId === ticket.id));
      if (ticketWaitingBookings.length) {
        augmentWaitingDuration(ticketWaitingBookings);
        standaloneWaitingBookings.push({
          ticketId: ticket.id,
          ticketName: ticket.name,
          waitingBookings: ticketWaitingBookings,
        });
      }
    }
  }

  const standaloneWaitingBookingCount = standaloneWaitingBookings.reduce((acc, item) => acc + item.waitingBookings.length, 0);

  const totalWaitingBookings = accumulativeWaitingBookings.length + standaloneWaitingBookingCount;
  const totalWaitingGroups =
    countBookingGroups(accumulativeWaitingBookings) + standaloneWaitingBookings.reduce((acc, item) => acc + countBookingGroups(item.waitingBookings), 0);
  const totalWaitingPeople =
    countTotalPeopleForBookings(accumulativeWaitingBookings) +
    standaloneWaitingBookings.reduce((acc, item) => acc + countTotalPeopleForBookings(item.waitingBookings), 0);
  const totalAdultCheckIn = countTotalCheckedInAdult(checkInBookings);
  const totalChildCheckIn = countTotalCheckedInChild(checkInBookings);

  const waitingTimeSettingsValue = await getAppSettingByKey(APP_SETTING_KEY.WAITING_TIME_IN_MINUTES);
  const waitingTimeSettingsInMinutes = parseWaitingTimeSettings(waitingTimeSettingsValue);

  let totalStandaloneWaitingBookingsTime = 0;
  let totalAccumulativeWaitingBookingsTime = 0;

  const waitingTimeInfo = calculateWaitingTimeForBookingGroups(accumulativeWaitingBookings, waitingTimeSettingsInMinutes);
  for (let i = 0; i < accumulativeWaitingBookings.length; i++) {
    accumulativeWaitingBookings[i].waitingTime = waitingTimeInfo.waitingTimes[accumulativeWaitingBookings[i].barCode];
  }

  totalAccumulativeWaitingBookingsTime = waitingTimeInfo.totalWaitingBookingsTime;

  standaloneWaitingBookings.forEach((item) => {
    const waitingTimeInfo = calculateWaitingTimeForBookingGroups(item.waitingBookings, waitingTimeSettingsInMinutes);
    for (let i = 0; i < item.waitingBookings.length; i++) {
      item.waitingBookings[i].waitingTime = waitingTimeInfo.waitingTimes[item.waitingBookings[i].barCode];
    }
    totalStandaloneWaitingBookingsTime += waitingTimeInfo.totalWaitingBookingsTime;
  });

  const totalWaitingBookingsTime = totalStandaloneWaitingBookingsTime + totalAccumulativeWaitingBookingsTime;

  res.status(200).json({
    data: {
      accumulativeWaitingBookings,
      standaloneWaitingBookings,
      totalWaitingBookings,
      totalWaitingGroups,
      totalWaitingPeople,
      totalAdultCheckIn,
      totalChildCheckIn,
      totalWaitingBookingsTime,
    },
  });
});

export default handler;

const augmentWaitingDuration = (waitingBookings) => {
  const now = new Date();
  waitingBookings.forEach((booking) => {
    booking.waitingDuration = booking.waitingAt ? formatDuration(now, booking.waitingAt, LONG_TIME) : "";
  });
};
