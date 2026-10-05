import { PaymentType, TicketType } from "@prisma/client";
import moment from "moment";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import BookingVacancies from "components/BookingVacancies";
import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import Spinner from "components/common/Spinner";
import { getBookingDaysFromQuery } from "constants/booking";
import { JP_SHORT_DATE, ROLE, VACANCY_STATUS } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { Ticket } from "models/Entity";
import { fetchBookingVacanciesStatus } from "services/api-client/booking.service";
import CalendarIcon from "statics/images/calendar-gray.svg";
import CircleOutlineIcon from "statics/images/circle-outline.svg";
import CrossRedIcon from "statics/images/cross-red.svg";
import TriangleIcon from "statics/images/triangle-pc.svg";
import { checkShouldHideTicketVacancy } from "utils/vacancy-status";
import { OnlineTicketVacancy, TicketVacancy } from "models/Vacancy";
import { fetchTickets } from "services/api-client/admin/ticket.service";

import styles from "./index.module.scss";

function BookingManagementDetail() {
  const { data: session } = useSession();
  const router = useRouter();

  const tenantCode = session?.user?.tenantCode!;
  const bookingDays = getBookingDaysFromQuery(router.query);

  const [errMsg, setErrMsg] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const [onlineTickets, setOnlineTickets] = useState<Ticket[]>([]);
  const [useInDayBookingVacancies, setUseInDayBookingVacancies] = useState<TicketVacancy[]>([]);

  const [hoveredUseInDayBookingVacancy, setHoveredUseInDayBookingVacancy] = useState<TicketVacancy>();
  const [selectedOnlineBookingVacancy, setSelectedOnlineBookingVacancy] = useState<OnlineTicketVacancy>();

  const maxBookingPeople = selectedOnlineBookingVacancy?.maxBookingPeople;
  const totalPeople = selectedOnlineBookingVacancy?.totalBookingPeople;
  const remainPeople = maxBookingPeople - totalPeople;
  const nextDayTicketRemainingPeople = maxBookingPeople ? (remainPeople <= 0 ? 0 : remainPeople) : 0;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const [tickets, response] = await Promise.all([
        fetchTickets({ tenantCode, canBookInAdvance: true, paymentType: PaymentType.Online, ticketTypes: [TicketType.Daily], excludeExpiredSchedule: true }),
        fetchBookingVacanciesStatus({ tenantCodes: [tenantCode], includeTodayOneDayOnlineForInDayVacancy: true }),
      ]);

      const inDayStatus = response.inDayTenantStatus[tenantCode];
      setUseInDayBookingVacancies(inDayStatus?.tickets || []);
      setOnlineTickets(tickets);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const getTotalUseInDayBookingPeople = ({ totalAccumulativeBookingPeople, totalBookingPeople }: TicketVacancy) => {
    return totalAccumulativeBookingPeople || totalBookingPeople;
  };

  const getTotalUseInDayMaxBookingPeople = ({ totalAccumulativeMaxBookingPeople, maxBookingPeople }: TicketVacancy) => {
    return totalAccumulativeMaxBookingPeople || maxBookingPeople;
  };

  const getTotalRemainingUseInDayBookingPeople = (vacancy: TicketVacancy) => {
    if (vacancy.canNotBookMore) {
      return 0;
    }
    const result = getTotalUseInDayMaxBookingPeople(vacancy) - getTotalUseInDayBookingPeople(vacancy);
    return result < 0 ? 0 : result;
  };

  const getVacancyStatusImageSrc = (status: string) => {
    const options = {
      [VACANCY_STATUS.AVAILABLE]: CircleOutlineIcon,
      [VACANCY_STATUS.NOT_AVAILABLE]: CrossRedIcon,
      [VACANCY_STATUS.FULL]: TriangleIcon,
    };

    return options[status];
  };

  return (
    <AdminLayout>
      {/*Error*/}
      <Error message={errMsg} />
      <div className={`admin ${styles.adminVacancies}`}>
        <div className="ad-section-container mb-[37px] py-[17px] px-[30px]">
          <div className="font-bold text-[24px] leading-[32px] mb-[16px]">当日利用</div>
          <div className="flex gap-[21px]">
            <div className="grow">
              <div className={styles.tenantTodayStatusHeader}>
                <span className="xs:w-[20px] xs:h-[20px] flex">
                  <Image src={CalendarIcon} alt="" width={28} height={28}></Image>
                </span>
                <span>{moment().format(JP_SHORT_DATE + "(dddd)")}</span>
              </div>
              <div className={styles.tenantTodayStatusContent}>
                {useInDayBookingVacancies.map((item) => {
                  const { ticketId, ticketName, status } = item;

                  if (checkShouldHideTicketVacancy(item as any)) {
                    return null;
                  }

                  return (
                    <div
                      key={ticketId}
                      className={styles.tenantTodayStatusContentItem}
                      onMouseEnter={() => {
                        setHoveredUseInDayBookingVacancy(item);
                      }}
                    >
                      <div className="grow">
                        <span>{ticketName}</span>
                      </div>
                      <div className="w-[120px] flex">
                        <Image src={getVacancyStatusImageSrc(status)} alt="logo" width={23} height={23} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={`${styles.vacancyStatusBox} w-[280px] rounded-[8px] border border-[#2CABF3] flex items-center h-[244px]`}>
              {hoveredUseInDayBookingVacancy && (
                <div className="px-[20px] font-medium text-[16px] leading-[20px] text-center ">
                  <div className="mb-[24px] flex items-center">
                    <Image src={CalendarIcon} alt="calendar" />
                    &nbsp;
                    <span>{moment().format(JP_SHORT_DATE + "、 dddd")}</span>
                  </div>
                  <div>
                    在庫数/在庫枠:&nbsp;
                    {getTotalUseInDayMaxBookingPeople(hoveredUseInDayBookingVacancy) > 0 ? (
                      <span className={getTotalRemainingUseInDayBookingPeople(hoveredUseInDayBookingVacancy) === 0 ? "text-[#DC0404]" : "text-[#006DC6]"}>
                        {getTotalRemainingUseInDayBookingPeople(hoveredUseInDayBookingVacancy)}/
                        {getTotalUseInDayMaxBookingPeople(hoveredUseInDayBookingVacancy) ?? "-"}
                      </span>
                    ) : (
                      <span>-/-</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="ad-section-container py-[17px] px-[30px]">
          <div className="font-bold text-[24px] leading-[32px] mb-[16px]">事前予約</div>
          <div className="mdup:flex gap-[21px]">
            <div className="grow">
              {onlineTickets.length > 0 && (
                <div className="mb-[32px]">
                  <BookingVacancies
                    showErrorWhenFullVacancy={false}
                    onBook={(vacancy) => {
                      setSelectedOnlineBookingVacancy(vacancy);
                    }}
                    tenantCode={tenantCode}
                    hideFooter={true}
                    calenderIcon={<Image src={CalendarIcon} alt="calendar"></Image>}
                    bookingDays={bookingDays}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className={`${styles.vacancyStatusBox} mdonly:ml-[193px] w-[280px] rounded-[8px] border border-[#2CABF3] flex items-center h-[244px]`}>
                {selectedOnlineBookingVacancy && (
                  <div className="px-[20px] font-medium text-[16px] leading-[20px] text-center">
                    <div className="mb-[24px] flex items-center">
                      <Image src={CalendarIcon} alt="calendar" />
                      &nbsp;
                      <span>{moment(selectedOnlineBookingVacancy.date).format(JP_SHORT_DATE + "、 dddd")}</span>
                    </div>

                    <div className="">
                      在庫数/在庫枠:&nbsp;
                      {maxBookingPeople > 0 ? (
                        <span className={nextDayTicketRemainingPeople === 0 ? "text-[#DC0404]" : "text-[#006DC6]"}>
                          {nextDayTicketRemainingPeople}/{maxBookingPeople ?? "-"}
                        </span>
                      ) : (
                        <span>-/-</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-[68px] flex gap-[32px] justify-center">
                <div className="flex items-center">
                  <span className="xs:w-[10px] xs:h-[10px] inline-flex mr-[21px]">
                    <Image src={CircleOutlineIcon} alt="tenant-logo" width={23} height={23} />
                  </span>
                  <span className="text-[12px] leading-[14px]">一部空きあり</span>
                </div>
                <div className="flex items-center">
                  <span className="xs:w-[10px] xs:h-[10px] inline-flex mr-[21px]">
                    <Image src={CrossRedIcon} alt="tenant-logo" width={23} height={23} />
                  </span>
                  <span className="text-[12px] leading-[14px]">全て完売</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
    </AdminLayout>
  );
}

export default withAuthentication(BookingManagementDetail, [ROLE.ADMIN]);
