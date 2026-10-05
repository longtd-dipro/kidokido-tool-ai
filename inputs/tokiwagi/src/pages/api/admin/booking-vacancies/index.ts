import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, TicketType } from "@prisma/client";
import moment from "moment";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { createContinuousDates, isSameDay } from "utils/date-time";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";
import { getTicketBookingSchedule } from "utils/ticket";
import { countTotalCheckedInPeople, countTotalPeopleForBookings, isOnlineMonthlyBooking } from "utils/booking";
import { getHiddenTenantTicketNames } from "utils/server/booking";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const today = new Date();
  const NEXT_DAYS = 7;
  const next7Days = moment(today).add(NEXT_DAYS, "days").toDate();

  const hiddenTenantTicketNames = await getHiddenTenantTicketNames(req.user.tenantCode);

  let tickets = await prisma.ticket.findMany({
    where: {
      tenantCode: req.user.tenantCode,
      ...(hiddenTenantTicketNames?.length && { name: { notIn: hiddenTenantTicketNames } }),
    },
    include: { TicketBookingSchedule: { where: { deleted: false } } },
  });

  const TICKET_ORDERS = {
    [TicketType.Daily]: 0,
    [TicketType.Monthly]: 1,
    [TicketType.Hourly]: 2,
  };
  tickets = tickets.sort((t1, t2) => {
    return TICKET_ORDERS[t1.type] - TICKET_ORDERS[t2.type];
  });
  const ticketIds = tickets.map((ticket) => ticket.id);
  let bookings = await prisma.booking.findMany({
    where: {
      tenantCode: req.user.tenantCode,
      date: {
        lte: next7Days,
        gte: today,
      },
      ticketId: { in: ticketIds },
    },
    include: {
      Ticket: true,
    },
  });

  bookings = bookings.filter((booking) => !isOnlineMonthlyBooking(booking));

  const results = [];
  const dates = createContinuousDates(today.toISOString(), NEXT_DAYS + 1);
  for (const date of dates) {
    const totalBookings = bookings.filter((booking) => isSameDay(date, booking.date));
    const checkedInBookings = bookings.filter((booking) => isSameDay(date, booking.date) && booking.status === BookingStatus.CheckedIn);
    const waitingBookings = bookings.filter((booking) => isSameDay(date, booking.date) && booking.status === BookingStatus.Waiting);

    const checkedInPeople = countTotalCheckedInPeople(checkedInBookings);
    const waitingPeople = countTotalPeopleForBookings(waitingBookings);

    let totalMaxBookingPeople = 0;
    let totalAccessiblePeople = 0;

    const ticketStatuses = [];
    for (const ticket of tickets) {
      const ticketTotalBookings = bookings.filter((booking) => isSameDay(date, booking.date) && booking.ticketId === ticket.id);
      const ticketCheckedInBookings = bookings.filter(
        (booking) => isSameDay(date, booking.date) && booking.ticketId === ticket.id && booking.status === BookingStatus.CheckedIn
      );
      const ticketWaitingBookings = bookings.filter(
        (booking) => isSameDay(date, booking.date) && booking.ticketId === ticket.id && booking.status === BookingStatus.Waiting
      );
      const ticketCanCheckInBookings = bookings.filter(
        (booking) =>
          isSameDay(date, booking.date) &&
          booking.ticketId === ticket.id &&
          ([BookingStatus.Successful, BookingStatus.Calling] as string[]).includes(booking.status)
      );
      const ticketCheckedOutBookings = bookings.filter(
        (booking) => isSameDay(date, booking.date) && booking.ticketId === ticket.id && booking.status === BookingStatus.CheckedOut
      );

      const checkedInPeople = countTotalCheckedInPeople(ticketCheckedInBookings);
      const waitingPeople = countTotalPeopleForBookings(ticketWaitingBookings);
      const checkedOutPeople = countTotalPeopleForBookings(ticketCheckedOutBookings);

      const ticketBookingSchedule = getTicketBookingSchedule(date, ticket, false);
      let accessiblePeople = countTotalPeopleForBookings(ticketCanCheckInBookings) + checkedInPeople + waitingPeople;
      ticketBookingSchedule?.invisibleWhenReachedMaxBookingPeople && (accessiblePeople += checkedOutPeople);

      totalMaxBookingPeople += ticketBookingSchedule?.maxBookingPeople || 0;
      totalAccessiblePeople += accessiblePeople;

      ticketStatuses.push({
        name: ticket.name,
        type: ticket.type,
        id: ticket.id,
        maxBookingPeople: ticketBookingSchedule?.maxBookingPeople,
        ticketBookingScheduleId: ticketBookingSchedule?.id,
        totalPeople: countTotalPeopleForBookings(ticketTotalBookings),
        checkedInPeople,
        waitingPeople,
        accessiblePeople,
      });
    }

    results.push({
      date,
      totalMaxBookingPeople,
      totalPeople: countTotalPeopleForBookings(totalBookings),
      checkedInPeople,
      waitingPeople,
      tickets: ticketStatuses,
      totalAccessiblePeople,
    });
  }

  res.status(200).json({
    data: results,
  });
});

export default handler;
