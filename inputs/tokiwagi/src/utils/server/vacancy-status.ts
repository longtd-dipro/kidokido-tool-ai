import { BookingStatus, PaymentStatus, TicketType } from "@prisma/client";
import { isNil, map, orderBy, uniqBy } from "lodash";
import moment from "moment";

import prisma from "utils/db";
import { createContinuousDates, isAfterTime, isBeforeTime, isSameDay, newDateKeepLocalTime } from "utils/date-time";
import { getAppSettingByKey } from "utils/app-setting";
import { APP_SETTING_KEY } from "constants/settings";
import { calculateWaitingTimeForBookingGroups, parseWaitingTimeSettings } from "utils/waiting-booking";
import { NOT_AVAILABLE_REASON, SIMULATE_COMING_USER_BOOKING_BARCODE, VACANCY_STATUS } from "constants/common";
import { getTicketBookingSchedule } from "utils/ticket";
import {
  countTotalCheckedOutPeople,
  countTotalPeopleExcludePartialCheckedOut,
  countTotalPeopleForBookings,
  isAccumulativeBookingSchedule,
  isInDayTicket,
  isOnlineMonthlyBooking,
  isOnlineOneDayTicket,
  isOnlineTimesLimitBooking,
} from "utils/booking";
import { Booking, Ticket } from "models/Entity";
import { TenantVacancy, TicketVacancy } from "models/Vacancy";
import { BOOKED_OR_CHECKED_IN_BOOKING_STATUES, ONLINE_BOOKING_ADVANCE_DAYS } from "constants/booking";
import { sortTenantsByFirstCharacterThenCreatedAt } from "utils/tenant";
import { convertToArray } from "utils/array";

export const getTenantInDayTicketsVacancy = async (tenantCode: string): Promise<TenantVacancy> => {
  const tickets = await getTenantTicketsForVacancy([tenantCode]);
  const inDayStatus = await getInDayVacancy(tickets);
  return inDayStatus[tenantCode];
};

export const getTenantTicketsForVacancy = async (tenantCodes: string[] | undefined, orderBy?: any): Promise<Ticket[]> => {
  const today = new Date();
  const tickets = await prisma.ticket.findMany({
    where: {
      type: { in: [TicketType.Daily, TicketType.Hourly, TicketType.Monthly, TicketType.HourlyTimesLimit, TicketType.DailyTimesLimit] },
      tenantCode: {
        in: convertToArray(tenantCodes),
      },
      visibility: true,
    },
    orderBy,
    include: {
      Tenant: true,
      TicketBookingSchedule: {
        where: {
          deleted: false,
          dateTo: {
            gte: today,
          },
        },
      },
    },
  });
  return tickets;
};

export const getInDayVacancy = async (allTickets: Ticket[], includeTodayOneDayOnlineForInDayVacancy?: Boolean): Promise<{ [key: string]: TenantVacancy }> => {
  const inDayTenantStatus: { [key: string]: TenantVacancy } = {};

  const today = new Date();
  const inDayTickets = allTickets.filter((ticket) => isInDayTicket(ticket));
  const oneDayOnlineTickets = allTickets.filter((ticket) => isOnlineOneDayTicket(ticket));

  let inDayTenants = orderBy(
    map(
      uniqBy(inDayTickets, (ticket) => ticket.tenantCode),
      (ticket) => ticket.Tenant
    ),
    "createdAt",
    "desc"
  );
  inDayTenants = sortTenantsByFirstCharacterThenCreatedAt(inDayTenants);

  let allTodayBookings = await prisma.booking.findMany({
    where: {
      date: newDateKeepLocalTime(),
      status: {
        in: BOOKED_OR_CHECKED_IN_BOOKING_STATUES,
      },
      paymentStatus: { in: [PaymentStatus.Pending, PaymentStatus.Completed] },
      ticketId: {
        in: inDayTickets.concat(oneDayOnlineTickets).map((ticket) => ticket.id),
      },
    },
    include: { Ticket: true },
  });

  allTodayBookings = allTodayBookings.filter((booking) => !isOnlineMonthlyBooking(booking) && !isOnlineTimesLimitBooking(booking));

  const waitingTimeSettingsValue = await getAppSettingByKey(APP_SETTING_KEY.WAITING_TIME_IN_MINUTES);
  const waitingTimeSettingsInMinutes = parseWaitingTimeSettings(waitingTimeSettingsValue);

  for (const tenant of inDayTenants) {
    inDayTenantStatus[tenant.code] = {
      tenantName: tenant.name,
      status: VACANCY_STATUS.NOT_AVAILABLE,
      tickets: [],
    };

    let tenantTickets = inDayTickets.filter((ticket) => ticket.tenantCode === tenant.code);
    if (includeTodayOneDayOnlineForInDayVacancy) {
      tenantTickets = tenantTickets.concat(oneDayOnlineTickets.filter((ticket) => ticket.tenantCode === tenant.code));
    }
    const tenantTicketIds = tenantTickets.map((ticket) => ticket.id);
    const tenantBookings = allTodayBookings.filter((booking) => booking.tenantCode == tenant.code && tenantTicketIds.includes(booking.ticketId));

    // Pre-calculate some states for accumulative Max Booking People Tickets
    const allTenantTickets = allTickets.filter((ticket) => ticket.tenantCode === tenant.code);
    const allTenantTodayBookings = allTodayBookings.filter((booking) => booking.tenantCode === tenant.code);
    const accumulativeTicketsStatus = getAccumulativeTicketsStatus(allTenantTickets, allTenantTodayBookings);
    const { isAccumulativeFull, accumulativeMaxPeopleTicketIds, totalAccumulativeBookedOrCheckedInPeople, totalAccumulativeMaxBookingPeople } =
      accumulativeTicketsStatus;

    const allWaitingBookings = allTodayBookings.filter((booking) => booking.status === BookingStatus.Waiting);
    const accumulativeWaitingBookings = allWaitingBookings.filter((booking) => accumulativeMaxPeopleTicketIds.includes(booking.ticketId));

    let accumulativeCheckedOutBookings: Booking[];

    // Calculate vacancy status for each ticket
    for (const ticket of tenantTickets) {
      const vacancyStatus: TicketVacancy = {
        tenantCode: tenant.code,
        ticketId: ticket.id,
        ticketName: ticket.name,
        ticketType: ticket.type,
      };

      const ticketBookingSchedule = getTicketBookingSchedule(today.toISOString(), ticket, false);
      if (ticketBookingSchedule) {
        if (ticketBookingSchedule.canBookingFrom && isBeforeTime(new Date(), ticketBookingSchedule.canBookingFrom)) {
          // Check booking from time
          vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
          vacancyStatus.reason = NOT_AVAILABLE_REASON.NOT_TIME_YET;
        } else if (ticketBookingSchedule.canBookingUtil && isAfterTime(new Date(), ticketBookingSchedule.canBookingUtil)) {
          // Check booking until time
          vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
          vacancyStatus.reason = NOT_AVAILABLE_REASON.EXPIRED;
        } else {
          const maxBookingPeople = ticketBookingSchedule.maxBookingPeople;
          if (isNil(maxBookingPeople)) {
            // Max booking people not setting
            vacancyStatus.status = VACANCY_STATUS.AVAILABLE;
          } else {
            if (accumulativeMaxPeopleTicketIds.includes(ticket.id)) {
              // Accumulative ticket
              const totalBookedOrCheckedInPeople = countTotalPeopleExcludePartialCheckedOut(tenantBookings.filter((booking) => booking.ticketId === ticket.id));
              vacancyStatus.isAccumulativeMaxBookingPeople = true;
              vacancyStatus.maxBookingPeople = maxBookingPeople;
              vacancyStatus.totalBookingPeople = totalBookedOrCheckedInPeople;
              vacancyStatus.totalAccumulativeMaxBookingPeople = totalAccumulativeMaxBookingPeople;
              vacancyStatus.totalAccumulativeBookingPeople = totalAccumulativeBookedOrCheckedInPeople;

              if (isOnlineOneDayTicket(ticket)) {
                // Online one day accumulative ticket can not book more for today
                vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
                vacancyStatus.reason = NOT_AVAILABLE_REASON.CAN_NOT_BOOK_MORE;
                vacancyStatus.canNotBookMore = true;
              } else {
                // In day accumulative ticket
                vacancyStatus.status = isAccumulativeFull ? VACANCY_STATUS.FULL : VACANCY_STATUS.AVAILABLE;
                if (vacancyStatus.status === VACANCY_STATUS.FULL) {
                  // This booking for simulating user is booking
                  const simulateUserBooking = { barCode: SIMULATE_COMING_USER_BOOKING_BARCODE, status: BookingStatus.Waiting };
                  const waitingTimeInfo = calculateWaitingTimeForBookingGroups(
                    [...accumulativeWaitingBookings, simulateUserBooking],
                    waitingTimeSettingsInMinutes,
                    true
                  );
                  vacancyStatus.waitingBookingsCount = Object.keys(waitingTimeInfo.waitingTimes).length;
                  vacancyStatus.waitingTimeInMinutes = waitingTimeInfo.totalWaitingBookingsTime;
                }

                // Check for invisibleWhenReachedMaxBookingPeople
                if (ticketBookingSchedule.invisibleWhenReachedMaxBookingPeople) {
                  vacancyStatus.invisibleWhenReachedMaxBookingPeople = ticketBookingSchedule.invisibleWhenReachedMaxBookingPeople;

                  if (!accumulativeCheckedOutBookings) {
                    accumulativeCheckedOutBookings = await prisma.booking.findMany({
                      where: {
                        date: newDateKeepLocalTime(),
                        status: BookingStatus.CheckedOut,
                        ticketId: {
                          in: accumulativeMaxPeopleTicketIds,
                        },
                      },
                    });
                  }

                  const ticketCheckedInBookings = tenantBookings.filter(
                    (booking) => booking.ticketId === ticket.id && booking.status === BookingStatus.CheckedIn
                  );
                  const totalPartialCheckedOutPeople = countTotalCheckedOutPeople(ticketCheckedInBookings);
                  const ticketCheckedOutBookings = accumulativeCheckedOutBookings.filter((booking) => booking.ticketId === ticket.id);
                  const totalCheckedOutPeople = countTotalCheckedOutPeople(ticketCheckedOutBookings) + totalPartialCheckedOutPeople;

                  if (totalBookedOrCheckedInPeople + totalCheckedOutPeople >= maxBookingPeople) {
                    vacancyStatus.canNotBookMore = true;
                    vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
                    vacancyStatus.reason = NOT_AVAILABLE_REASON.CAN_NOT_BOOK_MORE;
                  }
                }
              }
            } else {
              // Independent ticket
              if (maxBookingPeople === 0) {
                vacancyStatus.canNotBookMore = true;
                vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
                vacancyStatus.reason = NOT_AVAILABLE_REASON.CAN_NOT_BOOK_MORE;
              } else {
                const totalBookedOrCheckedInPeople = countTotalPeopleExcludePartialCheckedOut(
                  tenantBookings.filter((booking) => booking.ticketId === ticket.id)
                );
                vacancyStatus.maxBookingPeople = maxBookingPeople;
                vacancyStatus.totalBookingPeople = totalBookedOrCheckedInPeople;

                if (isOnlineOneDayTicket(ticket)) {
                  // Online one day accumulative ticket can not book more for today
                  vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
                  vacancyStatus.reason = NOT_AVAILABLE_REASON.CAN_NOT_BOOK_MORE;
                  vacancyStatus.canNotBookMore = true;
                } else {
                  vacancyStatus.status = totalBookedOrCheckedInPeople >= maxBookingPeople ? VACANCY_STATUS.FULL : VACANCY_STATUS.AVAILABLE;

                  if (vacancyStatus.status === VACANCY_STATUS.FULL) {
                    const waitingBookings = allWaitingBookings.filter((booking) => booking.ticketId === ticket.id);
                    // This booking for simulating user is booking
                    const simulateUserBooking = { barCode: SIMULATE_COMING_USER_BOOKING_BARCODE, status: BookingStatus.Waiting };
                    const waitingTimeInfo = calculateWaitingTimeForBookingGroups([...waitingBookings, simulateUserBooking], waitingTimeSettingsInMinutes, true);
                    vacancyStatus.waitingBookingsCount = Object.keys(waitingTimeInfo.waitingTimes).length;
                    vacancyStatus.waitingTimeInMinutes = waitingTimeInfo.totalWaitingBookingsTime;
                  }

                  // Check for invisibleWhenReachedMaxBookingPeople
                  if (ticketBookingSchedule.invisibleWhenReachedMaxBookingPeople) {
                    vacancyStatus.invisibleWhenReachedMaxBookingPeople = ticketBookingSchedule.invisibleWhenReachedMaxBookingPeople;

                    const checkedOutBookings = await prisma.booking.findMany({
                      where: {
                        date: newDateKeepLocalTime(),
                        status: BookingStatus.CheckedOut,
                        ticketId: ticket.id,
                      },
                    });

                    const ticketCheckedInBookings = tenantBookings.filter(
                      (booking) => booking.ticketId === ticket.id && booking.status === BookingStatus.CheckedIn
                    );
                    const totalPartialCheckedOutPeople = countTotalCheckedOutPeople(ticketCheckedInBookings);
                    const totalCheckedOutPeople = countTotalCheckedOutPeople(checkedOutBookings) + totalPartialCheckedOutPeople;

                    if (totalBookedOrCheckedInPeople + totalCheckedOutPeople >= maxBookingPeople) {
                      vacancyStatus.canNotBookMore = true;
                      vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
                      vacancyStatus.reason = NOT_AVAILABLE_REASON.CAN_NOT_BOOK_MORE;
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        // Booking schedule for ticket not setting
        vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
        vacancyStatus.reason = NOT_AVAILABLE_REASON.NO_BOOKING_SCHEDULE;
      }

      inDayTenantStatus[tenant.code].tickets.push(vacancyStatus);
    }

    updateTenantVacancyStatus(inDayTenantStatus[tenant.code]);
  }

  return inDayTenantStatus;
};

const NUM_OF_NEXT_DAYS = ONLINE_BOOKING_ADVANCE_DAYS;
export const getNextDaysOneDayOnlineVacancy = async (
  tickets: Ticket[],
  bookingDays: number = NUM_OF_NEXT_DAYS
): Promise<{ [key: string]: TenantVacancy[] }> => {
  const numOfNextDays = bookingDays;
  const nextDaysOneDayOnlineTenantStatus: { [key: string]: TenantVacancy[] } = {};

  const oneDayOnlineTickets = tickets.filter((ticket) => isOnlineOneDayTicket(ticket));

  let oneDayOnlineTenants = orderBy(
    map(
      uniqBy(oneDayOnlineTickets, (ticket) => ticket.tenantCode),
      (ticket) => ticket.Tenant
    ),
    "createdAt",
    "desc"
  );
  oneDayOnlineTenants = sortTenantsByFirstCharacterThenCreatedAt(oneDayOnlineTenants);

  const today = new Date();
  const tomorrow = moment(today).add(1, "days").toDate();
  const nextDays = moment(tomorrow)
    .add(numOfNextDays - 1, "days")
    .toDate();
  const startDate = tomorrow;
  const oneDayOnlineBookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: startDate,
        lte: nextDays,
      },
      status: {
        in: [BookingStatus.Successful, BookingStatus.CheckedIn],
      },
      paymentStatus: PaymentStatus.Completed,
      ticketId: {
        in: oneDayOnlineTickets.map((ticket) => ticket.id),
      },
    },
  });

  for (const tenant of oneDayOnlineTenants) {
    nextDaysOneDayOnlineTenantStatus[tenant.code] = [];
    const tenantTickets = oneDayOnlineTickets.filter((ticket) => ticket.tenantCode === tenant.code);

    const dates = createContinuousDates(startDate.toISOString(), numOfNextDays);
    for (const date of dates) {
      const tenantDayStatus: TenantVacancy = {
        tenantName: tenant.name,
        date,
        status: VACANCY_STATUS.NOT_AVAILABLE,
        tickets: [],
      };

      for (const ticket of tenantTickets) {
        const ticketBookingSchedule = getTicketBookingSchedule(date, ticket, false);
        const vacancyStatus: TicketVacancy = {
          tenantCode: tenant.code,
          ticketId: ticket.id,
          ticketName: ticket.name,
          ticketType: ticket.type,
        };

        if (ticketBookingSchedule) {
          if (ticketBookingSchedule.canBookingFrom && isBeforeTime(new Date(), ticketBookingSchedule.canBookingFrom)) {
            // Check booking from time
            vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
            vacancyStatus.reason = NOT_AVAILABLE_REASON.NOT_TIME_YET;
          } else if (ticketBookingSchedule.canBookingUtil && isAfterTime(new Date(), ticketBookingSchedule.canBookingUtil)) {
            // Check booking until time
            vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
            vacancyStatus.reason = NOT_AVAILABLE_REASON.EXPIRED;
          } else {
            // Check maxBookingPeople
            const maxBookingPeople = ticketBookingSchedule.maxBookingPeople;
            if (isNil(maxBookingPeople)) {
              // Max booking people not setting
              vacancyStatus.status = VACANCY_STATUS.AVAILABLE;
            } else if (maxBookingPeople === 0) {
              vacancyStatus.canNotBookMore = true;
              vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
              vacancyStatus.reason = NOT_AVAILABLE_REASON.CAN_NOT_BOOK_MORE;
            } else {
              const dateBookings = oneDayOnlineBookings.filter((booking) => {
                return booking.ticketId === ticket.id && isSameDay(booking.date, date);
              });
              const totalBookingPeople = countTotalPeopleForBookings(dateBookings);
              vacancyStatus.status = totalBookingPeople >= maxBookingPeople ? VACANCY_STATUS.FULL : VACANCY_STATUS.AVAILABLE;
              vacancyStatus.maxBookingPeople = maxBookingPeople;
              vacancyStatus.totalBookingPeople = totalBookingPeople;
              if (vacancyStatus.status === VACANCY_STATUS.FULL) {
                vacancyStatus.invisibleWhenReachedMaxBookingPeople = ticketBookingSchedule.invisibleWhenReachedMaxBookingPeople;
              }
            }
          }
        } else {
          // Booking schedule for ticket not setting
          vacancyStatus.status = VACANCY_STATUS.NOT_AVAILABLE;
          vacancyStatus.reason = NOT_AVAILABLE_REASON.NO_BOOKING_SCHEDULE;
        }

        tenantDayStatus.tickets.push(vacancyStatus);
      }

      // Set tenant vacancy day status
      updateTenantVacancyStatus(tenantDayStatus);
      nextDaysOneDayOnlineTenantStatus[tenant.code].push(tenantDayStatus);
    }
  }

  return nextDaysOneDayOnlineTenantStatus;
};

const updateTenantVacancyStatus = (tenantVacancy) => {
  if (tenantVacancy.tickets.some((ticketStatus) => ticketStatus.status === VACANCY_STATUS.AVAILABLE)) {
    // At least one ticket is available then the whole tenant is available
    tenantVacancy.status = VACANCY_STATUS.AVAILABLE;
  } else if (tenantVacancy.tickets.every((ticketStatus) => ticketStatus.status === VACANCY_STATUS.NOT_AVAILABLE)) {
    // All tickets are not available then the whole tenant is not available
    tenantVacancy.status = VACANCY_STATUS.NOT_AVAILABLE;

    // All tickets are not available with the reason of NO_BOOKING_SCHEDULE then the whole tenant reason is NO_BOOKING_SCHEDULE
    if (tenantVacancy.tickets.every((ticketStatus) => ticketStatus.reason === NOT_AVAILABLE_REASON.NO_BOOKING_SCHEDULE)) {
      tenantVacancy.reason = NOT_AVAILABLE_REASON.NO_BOOKING_SCHEDULE;
    } else if (
      tenantVacancy.tickets.every(
        (ticketStatus) => ticketStatus.reason === NOT_AVAILABLE_REASON.EXPIRED || ticketStatus.reason === NOT_AVAILABLE_REASON.NOT_TIME_YET
      )
    ) {
      tenantVacancy.reason = NOT_AVAILABLE_REASON.EXPIRED;
    } else if (tenantVacancy.tickets.every((ticketStatus) => ticketStatus.reason === NOT_AVAILABLE_REASON.CAN_NOT_BOOK_MORE)) {
      tenantVacancy.reason = NOT_AVAILABLE_REASON.CAN_NOT_BOOK_MORE;
    }
  } else {
    tenantVacancy.status = VACANCY_STATUS.FULL;
  }
};

function getAccumulativeTicketsStatus(tickets: Ticket[], bookings: Booking[]) {
  const today = new Date();
  const accumulativeMaxPeopleTickets = tickets.filter((ticket) => {
    const ticketBookingSchedule = getTicketBookingSchedule(today.toISOString(), ticket, false);
    return isAccumulativeBookingSchedule(ticketBookingSchedule);
  });
  const accumulativeMaxPeopleTicketIds = accumulativeMaxPeopleTickets.map((ticket) => ticket.id);

  const totalAccumulativeMaxBookingPeople = accumulativeMaxPeopleTickets.reduce((acc, ticket) => {
    const ticketBookingSchedule = getTicketBookingSchedule(today.toISOString(), ticket, false);
    return acc + (ticketBookingSchedule?.maxBookingPeople || 0);
  }, 0);

  const allBookedOrCheckedInBookings = bookings.filter(
    (booking) => accumulativeMaxPeopleTicketIds.includes(booking.ticketId) && (BOOKED_OR_CHECKED_IN_BOOKING_STATUES as any).includes(booking.status)
  );

  const totalAccumulativeBookedOrCheckedInPeople = countTotalPeopleExcludePartialCheckedOut(allBookedOrCheckedInBookings);

  const isAccumulativeFull = totalAccumulativeBookedOrCheckedInPeople >= totalAccumulativeMaxBookingPeople;

  return {
    isAccumulativeFull,
    accumulativeMaxPeopleTicketIds,
    totalAccumulativeBookedOrCheckedInPeople,
    totalAccumulativeMaxBookingPeople,
  };
}
