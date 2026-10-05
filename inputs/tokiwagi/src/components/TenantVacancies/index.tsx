import moment from "moment";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import XSmallImg from "statics/images/user/x-red-small.svg";
import OSmallImg from "statics/images/user/circle-blue-small.svg";
import { JAPAN_LOCALE_CODE, SHORT_DATE, VACANCY_STATUS } from "constants/common";
import { Ticket } from "models/Entity";
import BlueCalendarImg from "statics/images/calendar-blue.svg";
import OImg from "statics/images/user/circle-blue.svg";
import XImg from "statics/images/user/x-red.svg";
import { ROUTE } from "constants/route";
import { TenantVacancy, TicketVacancy } from "models/Vacancy";
import TenantVacancyDetailDialog from "components/TenantVacancies/TenantVacancyDetailDialog";
import RequiredLoginDialog from "components/common/RequiredLoginDialog";
import { DEFAULT_ONLINE_BOOKING_ADVANCE_DAYS, ONLINE_BOOKING_ADVANCE_DAYS, shouldShowScrollNote } from "constants/booking";

import styles from "./index.module.scss";
import VacancyItem from "./Vacancy";

export interface Props {
  oneDay: {
    date: Date;
    status: string;
    tickets: Ticket[];
  };
  useMonthlyTicketRef: any;
  bookingDays?: number;
}

export default function TenantVacancies({ oneDay, useMonthlyTicketRef, bookingDays }: Props) {
  const [tenantVacancies, setTenantVacancies] = useState<{ name: string; vacancies: TenantVacancy[] }[]>([]);
  const [selectedVacancy, setSelectedVacancy] = useState<TenantVacancy>(undefined);
  const [isShowTenantVacanciesDetailDialog, setIsShowTenantVacanciesDetailDialog] = useState<boolean>(false);
  const [isShowRequiredLoginDialog, setIsShowRequiredLoginDialog] = useState<boolean>(false);

  const { data: session } = useSession();
  const router = useRouter();

  const currentMonthName = tenantVacancies?.[0]?.vacancies?.[0]?.date
    ? new Date(tenantVacancies[0].vacancies[0].date as Date).toLocaleDateString(JAPAN_LOCALE_CODE, { month: "long" })
    : moment().add(1, "day").toDate().toLocaleDateString(JAPAN_LOCALE_CODE, { month: "long" });

  const weekdayLabels = tenantVacancies?.[0]?.vacancies?.slice(0, 7).map((item) => moment(item.date).format("ddd")) || [];
  const advanceDays = bookingDays ?? ONLINE_BOOKING_ADVANCE_DAYS;
  const showScrollNote = shouldShowScrollNote(advanceDays);
  const hideDayLabel = advanceDays === DEFAULT_ONLINE_BOOKING_ADVANCE_DAYS;

  useEffect(() => {
    let results = [];
    for (const tenant in oneDay) {
      results.push({ name: oneDay[tenant][0]?.tenantName, vacancies: oneDay[tenant].map((item) => ({ ...item, tenant })) });
    }
    setTenantVacancies(results);
  }, [oneDay]);

  useEffect(() => {
    if (selectedVacancy) {
      showTenantVacancyDetailDialog();
    }
  }, [selectedVacancy]);

  const handleIsActiveVacancy = (vacancy: TenantVacancy) => {
    return selectedVacancy === vacancy ? true : false;
  };

  const handleRedirectToBookingPage = (ticketId: number) => {
    const bookingDate = moment(selectedVacancy.date).format(SHORT_DATE);
    router.push({ pathname: ROUTE.BOOKING_PAYMENT_ONLINE, query: { tenantCode: selectedVacancy.tenant, date: bookingDate, ticketId } });
  };

  const handleClickOnlineTicketVacancy = (ticketVacancy: TicketVacancy) => {
    if (ticketVacancy.status === VACANCY_STATUS.AVAILABLE) {
      if (!session) {
        setIsShowRequiredLoginDialog(true);
        return;
      }

      handleRedirectToBookingPage(ticketVacancy.ticketId);
      return;
    }
  };

  const showTenantVacancyDetailDialog = () => {
    setIsShowTenantVacanciesDetailDialog(true);
  };

  const hideTenantVacancyDetailDialog = () => {
    setIsShowTenantVacanciesDetailDialog(false);
    setSelectedVacancy(undefined);
  };

  const handleShowVacancyDetail = (vacancy: TenantVacancy) => {
    if (vacancy.status === VACANCY_STATUS.AVAILABLE) {
      setSelectedVacancy(vacancy);
    }
  };

  return (
    <div className="w-full">
      <h2 ref={useMonthlyTicketRef} className="my-4 mt-12 text-2xl font-bold text-center text-blue-color">
        事前予約の販売状況
      </h2>
      {/*DESKTOP*/}
      <div className="xs:hidden">
        <div
          className={`${styles.heading} ${!showScrollNote ? styles.headingNoNote : ""} vacancies-header flex items-center text-2xl font-medium md:text-base`}
        >
          <div className={`vacancies-ticket-name flex items-center gap-4 shrink-0 ${styles.ticketNameColumn}`}>
            <Image src={BlueCalendarImg} alt="icon" />
            <p className="text-xl md:text-lg">{currentMonthName}</p>
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

        {tenantVacancies.length ? (
          <>
            {tenantVacancies.map((item) => (
              <div key={item.name} className={`flex items-center py-4 pl-4 pr-5 text-color font-medium text-xl md:text-base ${styles.vacancies}`}>
                <div className={`vacancies-ticket-name break-words shrink-0 ${styles.ticketNameColumn} work-break`}>{item.name || ""}</div>
                <div className={styles.vacancyGrid}>
                  {item.vacancies.map((vacancy, index) => {
                    return (
                      <VacancyItem
                        isActive={handleIsActiveVacancy(vacancy)}
                        key={index}
                        vacancy={vacancy}
                        onShowVacancyDetail={() => handleShowVacancyDetail(vacancy)}
                        hideDayLabel={hideDayLabel}
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

        <div className="flex justify-center gap-24 mt-12 font-light md:gap-5">
          <div className="flex gap-2">
            <Image src={OImg} alt="o" />
            <span>販売中</span>
          </div>
          <div className="flex gap-2">
            <Image src={XImg} alt="x" />
            <span>完売</span>
          </div>
        </div>
      </div>

      {/*MOBILE*/}
      <div className="xsup:hidden">
        <div
          className={`${styles.heading} ${!showScrollNote ? styles.headingNoNote : ""} vacancies-header flex justify-between text-2xl font-medium`}
        >
          <div className="flex items-start gap-2">
            <Image src={BlueCalendarImg} alt="icon" />
            <p className="text-base">{currentMonthName}</p>
          </div>
        </div>

        {showScrollNote && (
          <p className={`${styles.scrollNote} font-semibold text-sm`}>
            ※オンライン予約は{advanceDays}日前から可能です。その他の日付は左右にスクロールしてご確認ください。
          </p>
        )}

        {tenantVacancies.length ? (
          <>
            {tenantVacancies.map((item) => (
              <div key={item.name} className={`py-2 px-2 text-color font-medium text-xl pb-4 ${styles.vacancies}`}>
                <h2 className="vacancies-ticket-name ticket-heading text-center mx-auto xs:!text-[16px] xs:mb-2 work-break">{item?.name || ""}</h2>
                <div className={`${styles.weekdayHeaderMobile} mb-2`}>
                  {item.vacancies.slice(0, 7).map((v, index) => (
                    <div key={index} className="text-center">
                      {moment(v.date).format("ddd")}
                    </div>
                  ))}
                </div>
                <div className={styles.vacancyGridMobile}>
                  {item.vacancies.map((vacancy, index) => {
                    return (
                      <VacancyItem
                        isActive={handleIsActiveVacancy(vacancy)}
                        key={index}
                        vacancy={vacancy}
                        onShowVacancyDetail={() => handleShowVacancyDetail(vacancy)}
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

      {/* Detail Tenant Vacancy Popup*/}
      {isShowTenantVacanciesDetailDialog && (
        <TenantVacancyDetailDialog
          onDismiss={hideTenantVacancyDetailDialog}
          selectedTenantVacancy={selectedVacancy}
          onClickOnlineTicketVacancy={handleClickOnlineTicketVacancy}
        />
      )}

      {/* Require Login Dialog */}
      {isShowRequiredLoginDialog && <RequiredLoginDialog onDismiss={() => setIsShowRequiredLoginDialog(false)} />}
    </div>
  );
}
