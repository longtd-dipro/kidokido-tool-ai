import moment from "moment";
import Image from "next/legacy/image";
import React, { useEffect, useState } from "react";

import BlueSmallCalendarImg from "statics/images/user/calendar-blue-small.svg";
import OSmallImg from "statics/images/user/circle-blue-small.svg";
import VacancyItem from "components/BookingVacancies/Vacancy";
import Error from "components/common/Error";
import Spinner from "components/common/Spinner";
import { JAPAN_LOCALE_CODE } from "constants/common";
import { ONLINE_BOOKING_ADVANCE_DAYS, shouldShowScrollNote } from "constants/booking";
import { fetchBookingVacanciesStatus } from "services/api-client/booking.service";
import BlueCalendarImg from "statics/images/calendar-2.svg";
import OImg from "statics/images/user/circle-blue.svg";
import XImg from "statics/images/user/x-red.svg";
import XSmallImg from "statics/images/user/x-red-small.svg";
import { isSameDay } from "utils/date-time";
import { convertToOnlineTicketVacancies } from "utils/vacancy-status";
import { OnlineTicketVacancy, PaymentOnlineBookingVacancy } from "models/Vacancy";

import styles from "./index.module.scss";

export interface Props {
  tenantCode: string;
  onBook: (vacancy: OnlineTicketVacancy) => void;
  chosen?: { date: string; ticketId: number };
  hideFooter?: boolean;
  headerBackgroundColor?: string;
  calenderIcon?: React.ReactNode;
  onLoaded?: () => void;
  showErrorWhenFullVacancy?: boolean;
  showErrorWhenNotAvailableVacancy?: boolean;
  bookingDays?: number;
}

const getVacancyMonth = (date?: Date) => {
  const localDate = date ? new Date(date) : moment().add(1, "day").toDate();
  return localDate.toLocaleDateString(JAPAN_LOCALE_CODE, { month: "long" });
};

const getWeekdayLabels = (vacancies?: OnlineTicketVacancy[]) => {
  return (vacancies || []).slice(0, 7).map((vacancy) => moment(vacancy.date).format("ddd"));
};

export default function BookingVacancies({
  tenantCode,
  onBook,
  chosen,
  hideFooter,
  calenderIcon,
  onLoaded,
  showErrorWhenFullVacancy,
  showErrorWhenNotAvailableVacancy,
  bookingDays,
}: Props) {
  const [errMsg, setErrMsg] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingVacancies, setBookingVacancies] = useState<PaymentOnlineBookingVacancy[]>([]);
  const [chosenDate, setChosenDate] = useState<string>(null);
  const [chosenTicketId, setChosenTicketId] = useState<number>(null);

  const [currentMonthName, setCurrentMonthName] = useState<string>(getVacancyMonth());

  useEffect(() => {
    if (tenantCode) {
      setLoading(true);
      setBookingVacancies([]);
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantCode, bookingDays]);

  useEffect(() => {
    setChosenDate(chosen?.date);
    setChosenTicketId(chosen?.ticketId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen]);

  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const tenantVacancies = await fetchBookingVacanciesStatus({ tenantCodes: [tenantCode], sortTicketsBy: "displayOrder.asc", bookingDays });
      const tenantOnlineTicketVacancies = tenantVacancies.oneDayOnlineTenantStatus[tenantCode];
      const bookingVacancies = convertToOnlineTicketVacancies(tenantOnlineTicketVacancies);
      setBookingVacancies(bookingVacancies);
      setCurrentMonthName(getVacancyMonth(bookingVacancies?.[0]?.vacancies?.[0]?.date));
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
      onLoaded && onLoaded();
    }
  };

  const handleChooseVacancy = (vacancy: OnlineTicketVacancy) => {
    onBook(vacancy);
    setChosenDate(vacancy.date);
    setChosenTicketId(vacancy.ticketId);
  };

  const checkWasChosen = (vacancy, ticketId) => {
    return (chosenDate === vacancy.date && chosenTicketId === ticketId) || (isSameDay(chosen?.date, vacancy.date) && chosen?.ticketId === ticketId);
  };

  const weekdayLabels = getWeekdayLabels(bookingVacancies?.[0]?.vacancies);

  const advanceDays = bookingDays ?? ONLINE_BOOKING_ADVANCE_DAYS;
  const showScrollNote = shouldShowScrollNote(advanceDays);

  return (
    <div className="w-full">
      {/*DESKTOP*/}
      <div className="xs:hidden">
        <div
          className={`${styles.heading} ${!showScrollNote ? styles.headingNoNote : ""}
          vacancies-header flex items-center text-2xl font-medium md:text-base`}
        >
          <div className={`vacancies-ticket-name flex items-center gap-4 shrink-0 ${styles.ticketNameColumn}`}>
            {calenderIcon || <Image src={BlueCalendarImg} alt="calendar" width={24} height={24} />}
            <p className="text-xl md:text-lg font-semibold">{currentMonthName}</p>
          </div>
          <div className={styles.weekdayHeader}>
            {weekdayLabels.map((label, index) => (
              <div key={index} className="text-center">
                {label}
              </div>
            ))}
          </div>
        </div>

        {showScrollNote && (
          <p className={`${styles.scrollNote} font-semibold text-lg md:text-base`}>
            ※オンライン予約は{advanceDays}日前から可能です。
          </p>
        )}

        {!loading && bookingVacancies.length ? (
          <>
            {bookingVacancies.map(({ ticketId, vacancies }) => (
              <div key={ticketId} className={`flex items-start py-4 pl-4 pr-5 text-color font-medium text-xl md:text-base ${styles.vacancies}`}>
                <div className={`vacancies-ticket-name break-words shrink-0 pt-2 ${styles.ticketNameColumn}`}>{vacancies[0].ticketName}</div>
                <div className={styles.vacancyGrid}>
                  {vacancies.map((vacancy) => {
                    return (
                      <VacancyItem
                        showErrorWhenFullVacancy={showErrorWhenFullVacancy}
                        showErrorWhenNotAvailableVacancy={showErrorWhenNotAvailableVacancy}
                        key={vacancy.date}
                        vacancy={vacancy}
                        onChooseVacancy={handleChooseVacancy}
                        wasChosen={checkWasChosen(vacancy, ticketId)}
                        hideDayLabel
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        ) : (
          ""
        )}

        {loading && (
          <div className="flex justify-center mt-4">
            <Spinner />
          </div>
        )}

        <span className="text-left block leading-7 mt-4 md:text-xs text-sm">
          ※事前予約が完売でも、当日利用で購入できます。ただし、当日の販売数にも限りがございますので、ご了承ください。
        </span>

        {!hideFooter && (
          <>
            {/* DESKTOP */}
            <div className="flex justify-center gap-24 mt-12 font-light md:hidden">
              <div className="flex gap-2">
                <Image src={OImg} alt="o" />
                <span>販売中</span>
              </div>
              <div className="flex gap-2">
                <Image src={XImg} alt="x" />
                <span>完売</span>
              </div>
            </div>
            {/* TABLET */}
            <div className="flex justify-center gap-12 mt-8 font-semibold text-sm mdup:hidden">
              <div className="flex gap-2">
                <Image src={OSmallImg} alt="o" />
                <span>販売中</span>
              </div>
              <div className="flex gap-2">
                <Image src={XSmallImg} alt="x" />
                <span>完売</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/*MOBILE*/}
      <div className="xsup:hidden">
        <div
          className={`${styles.heading} ${!showScrollNote ? styles.headingNoNote : ""} vacancies-header flex justify-between text-2xl font-medium`}
        >
          <div className="flex items-center gap-2">
            <Image src={BlueSmallCalendarImg} alt="icon" />
            <p className="text-base font-semibold">{currentMonthName}</p>
          </div>
        </div>

        {showScrollNote && (
          <p className={`${styles.scrollNote} font-semibold text-sm`}>
            ※オンライン予約は{advanceDays}日前から可能です。その他の日付は左右にスクロールしてご確認ください。
          </p>
        )}

        {!loading && bookingVacancies.length ? (
          <>
            {bookingVacancies.map(({ ticketId, vacancies }) => (
              <div key={ticketId} className={`py-2 text-color font-medium text-xl pb-4 ${styles.vacancies}`}>
                <h2 className="vacancies-ticket-name usr-title-line ticket-heading mx-auto xs:!text-[16px] xs:mb-2 xs:max-w-full xs:break-words">
                  {vacancies[0].ticketName}
                </h2>
                <div className={`${styles.weekdayHeaderMobile} mb-2`}>
                  {getWeekdayLabels(vacancies).map((label, index) => (
                    <div key={index} className="text-center">
                      {label}
                    </div>
                  ))}
                </div>
                <div className={styles.vacancyGridMobile}>
                  {vacancies.map((vacancy) => {
                    return (
                      <VacancyItem
                        showErrorWhenNotAvailableVacancy={showErrorWhenNotAvailableVacancy}
                        showErrorWhenFullVacancy={showErrorWhenFullVacancy}
                        key={vacancy.date}
                        vacancy={vacancy}
                        onChooseVacancy={handleChooseVacancy}
                        wasChosen={checkWasChosen(vacancy, ticketId)}
                        hideDayLabel
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        ) : (
          ""
        )}

        {loading && (
          <div className="flex justify-center mt-4">
            <Spinner />
          </div>
        )}

        <span className="text-left block leading-7 mt-3 text-sm">
          ※事前予約が完売でも、当日利用で購入できます。ただし、当日の販売数にも限りがございますので、ご了承ください。
        </span>

        <div className="flex justify-center gap-8 mt-4 text-sm font-semibold">
          <div className="flex gap-2">
            <Image src={OSmallImg} alt="o" />
            <span>販売中</span>
          </div>
          <div className="flex gap-2">
            <Image src={XSmallImg} alt="x" />
            <span>完売</span>
          </div>
        </div>
      </div>

      {/* Error */}
      <Error message={errMsg} />
    </div>
  );
}
