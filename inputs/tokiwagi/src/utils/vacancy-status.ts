import { NOT_AVAILABLE_REASON, VACANCY_STATUS } from "constants/common";
import { OnlineTicketVacancy, TenantVacancy, TicketVacancy } from "models/Vacancy";
import { VACANCY_STATUS_ICON } from "models/enums";

export const checkShouldHideTicketVacancy = (ticketVacancy: TicketVacancy) => {
  return ticketVacancy.status === VACANCY_STATUS.NOT_AVAILABLE && ticketVacancy.reason === NOT_AVAILABLE_REASON.NO_BOOKING_SCHEDULE;
};

export const convertToOnlineTicketVacancies = (onlineOneDayTicketVacancies: { date: string; tickets: TicketVacancy[] }[]) => {
  const ticketIds = onlineOneDayTicketVacancies?.[0]?.tickets.map((item) => item.ticketId) || [];

  const results = [];

  for (const ticketId of ticketIds) {
    let vacancies = [];
    for (const onlineOneDayTicketVacancy of onlineOneDayTicketVacancies) {
      const vacancy = onlineOneDayTicketVacancy.tickets.find((item) => item.ticketId === ticketId);
      vacancy["date"] = onlineOneDayTicketVacancy.date;

      vacancies.push(vacancy);
    }

    const isAllDaysNotAvailable = vacancies.every((vacancy) => vacancy.status === VACANCY_STATUS.NOT_AVAILABLE);

    !isAllDaysNotAvailable && results.push({ ticketId, vacancies });
  }

  return results;
};

export const checkIsTodayOnlineOneDayTicketVacancyAvailable = (vacancy: OnlineTicketVacancy) => {
  const { isAccumulativeMaxBookingPeople, totalAccumulativeBookingPeople, totalAccumulativeMaxBookingPeople, maxBookingPeople, totalBookingPeople } = vacancy;

  if (isAccumulativeMaxBookingPeople) {
    if (totalBookingPeople >= maxBookingPeople) {
      return false;
    }

    return totalAccumulativeBookingPeople < totalAccumulativeMaxBookingPeople;
  }

  return totalBookingPeople < maxBookingPeople;
};

export const isTicketVacancyFullOrNotAvailable = (ticketVacancy: TicketVacancy) => {
  return ticketVacancy.status === VACANCY_STATUS.FULL || ticketVacancy.status === VACANCY_STATUS.NOT_AVAILABLE;
};

export const getOnlineTicketVacancyStatusIcon = (vacancy: TenantVacancy | OnlineTicketVacancy): VACANCY_STATUS_ICON => {
  const { status, reason } = vacancy;
  let result = null;

  if (reason === NOT_AVAILABLE_REASON.NO_BOOKING_SCHEDULE) {
    result = VACANCY_STATUS_ICON.Hyphen;
  } else {
    if (status === VACANCY_STATUS.AVAILABLE) {
      result = VACANCY_STATUS_ICON.O;
    } else {
      result = VACANCY_STATUS_ICON.X;
    }
  }

  return result;
};
