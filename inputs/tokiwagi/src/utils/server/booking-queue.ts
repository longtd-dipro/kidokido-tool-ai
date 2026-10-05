import { BookingStatus } from "@prisma/client";

import prisma from "utils/db";
import { getTicketBookingSchedule } from "utils/ticket";
import { newDateKeepLocalTime, getDateOneYearAgo, isSameOrAfterDay } from "utils/date-time";
import { countTotalCheckedInPeople, countTotalPeopleForBookings, isAccumulativeBookingSchedule, isOnlineOneDayTicket } from "utils/booking";
import { Booking } from "models/Entity";
import { sendCallingNotificationEmail } from "utils/email";

// Computes whether the ticket's (or, for an accumulative schedule, the whole tenant's accumulative
// group's) entry capacity is currently full — the same real-world signal that puts bookings into the
// Waiting queue in the first place. Returns null when the ticket has no capacity-limited schedule for
// today (entry-limit queue not in effect for this ticket).
export const getEntryCapacityStatus = async (ticketId: number) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      TicketBookingSchedule: { where: { deleted: false } },
    },
  });

  const today = new Date();
  const ticketBookingSchedule = getTicketBookingSchedule(today.toISOString(), ticket, false);
  if (!ticketBookingSchedule) return null;

  const isAccumulativeWaiting = isAccumulativeBookingSchedule(ticketBookingSchedule);

  let ticketIds;
  let oneDayOnlineAccumulativeTicketIds = [];
  let totalMaxBookingPeople;
  let checkedInAndCallingBookings = [];
  if (isAccumulativeWaiting) {
    const tickets = await prisma.ticket.findMany({
      where: {
        tenantCode: ticket.tenantCode,
        visibility: true,
      },
      include: {
        TicketBookingSchedule: { where: { deleted: false } },
      },
    });

    const accumulativeMaxPeopleTickets = tickets.filter((ticket) => {
      const ticketBookingSchedule = getTicketBookingSchedule(today.toISOString(), ticket, false);
      return isAccumulativeBookingSchedule(ticketBookingSchedule);
    });
    ticketIds = accumulativeMaxPeopleTickets.map((ticket) => ticket.id);
    oneDayOnlineAccumulativeTicketIds = accumulativeMaxPeopleTickets.filter((ticket) => isOnlineOneDayTicket(ticket)).map((ticket) => ticket.id);

    totalMaxBookingPeople = accumulativeMaxPeopleTickets.reduce((acc, ticket) => {
      const ticketBookingSchedule = getTicketBookingSchedule(today.toISOString(), ticket, false);
      return acc + ticketBookingSchedule.maxBookingPeople;
    }, 0);

    const allCheckedInAndCallingBookings = await prisma.booking.findMany({
      where: {
        ticketId: { in: ticketIds },
        date: newDateKeepLocalTime(),
        status: { in: [BookingStatus.CheckedIn, BookingStatus.Calling] },
      },
    });

    let notCheckedInYetOneDayOnlineBookings = [];
    if (oneDayOnlineAccumulativeTicketIds.length > 0) {
      notCheckedInYetOneDayOnlineBookings = await prisma.booking.findMany({
        where: {
          ticketId: { in: oneDayOnlineAccumulativeTicketIds },
          date: newDateKeepLocalTime(),
          status: BookingStatus.Successful,
          checkedOutAt: null,
        },
      });
    }
    checkedInAndCallingBookings = allCheckedInAndCallingBookings.concat(notCheckedInYetOneDayOnlineBookings);
  } else {
    ticketIds = [ticket.id];
    totalMaxBookingPeople = ticketBookingSchedule.maxBookingPeople || Number.MAX_SAFE_INTEGER;

    checkedInAndCallingBookings = await prisma.booking.findMany({
      where: {
        ticketId: { in: ticketIds },
        date: newDateKeepLocalTime(),
        status: { in: [BookingStatus.CheckedIn, BookingStatus.Calling] },
      },
    });
  }

  const checkedInBookings = checkedInAndCallingBookings.filter((booking) => booking.status === BookingStatus.CheckedIn);
  const callingBookings = checkedInAndCallingBookings.filter((booking) => booking.status === BookingStatus.Calling);
  const totalCheckedInAndCallingPeople = countTotalCheckedInPeople(checkedInBookings) + countTotalPeopleForBookings(callingBookings);

  return {
    ticketIds,
    totalMaxBookingPeople,
    totalCheckedInAndCallingPeople,
    isFull: totalCheckedInAndCallingPeople >= totalMaxBookingPeople,
  };
};

export const chooseNextCallingBookingsAndSendNotifications = async (ticketId: number) => {
  const capacityStatus = await getEntryCapacityStatus(ticketId);
  // No capacity-limited schedule today, or still full — nothing to call.
  if (!capacityStatus || capacityStatus.isFull) return;

  const { ticketIds, totalMaxBookingPeople, totalCheckedInAndCallingPeople } = capacityStatus;
  const today = new Date();

  let availableNextCallingPeople = totalMaxBookingPeople - totalCheckedInAndCallingPeople;
  let sameTicketGroupWaitingBookings = await prisma.booking.findMany({
    where: {
      ticketId: { in: ticketIds },
      date: newDateKeepLocalTime(),
      status: BookingStatus.Waiting,
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      {
        waitingOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  // Call next waiting bookings until the remaining available people get fulfilled or there are no waiting bookings anymore
  while (availableNextCallingPeople > 0 && sameTicketGroupWaitingBookings.length > 0) {
    const nextCallingBooking = sameTicketGroupWaitingBookings[0];

    // Calling all bookings have the same barcode despite ticket group
    await prisma.booking.updateMany({
      where: {
        barCode: nextCallingBooking.barCode,
        createdAt: { gte: getDateOneYearAgo(nextCallingBooking.createdAt) },
        status: BookingStatus.Waiting,
      },
      data: {
        status: BookingStatus.Calling,
        callingAt: today,
      },
    });

    sendCallingNotificationEmail(nextCallingBooking as Booking);

    const sameTicketGroupCalledBookings = sameTicketGroupWaitingBookings.filter(
      (booking) => booking.barCode === nextCallingBooking.barCode && isSameOrAfterDay(booking.createdAt, getDateOneYearAgo(nextCallingBooking.createdAt))
    );
    const sameTicketGroupCalledBookingIds = sameTicketGroupCalledBookings.map((booking) => booking.id);
    sameTicketGroupWaitingBookings = sameTicketGroupWaitingBookings.filter((booking) => !sameTicketGroupCalledBookingIds.includes(booking.id));
    const totalCalledPeople = countTotalPeopleForBookings(sameTicketGroupCalledBookings as Booking[]);
    availableNextCallingPeople -= totalCalledPeople;
  }
};
