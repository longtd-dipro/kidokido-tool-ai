import moment from "moment";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { JP_SHORT_DATE, VACANCY_STATUS } from "constants/common";
import OImg from "statics/images/user/circle-blue.svg";
import { Tenant, Ticket } from "models/Entity";
import XImg from "statics/images/user/x-red.svg";
import XSmallImg from "statics/images/user/x-red-small.svg";
import OSmallImg from "statics/images/user/circle-blue-small.svg";
import TriangleImage from "statics/images/triangle-pc.svg";
import TriangleMobileImage from "statics/images/triangle-mobile.svg";
import { ROUTE } from "constants/route";
import CalendarIcon from "statics/images/user/calendar.svg";
import { TenantVacancy, TicketVacancy } from "models/Vacancy";
import { checkShouldHideTicketVacancy } from "utils/vacancy-status";
import { checkTenantIsInSaleTime, getTenantByCode } from "utils/tenant";

import styles from "./index.module.scss";
import DetailVacancyDialog from "./DetailVacancyDialog";

export interface Props {
  inDay: {
    status: string;
    tickets: Ticket[];
  };
  useOneDayTicketRef: any;
  tenants: Tenant[];
}

export default function InDayVacancy({ inDay, useOneDayTicketRef, tenants }: Props) {
  const nowDate = moment(new Date()).format(JP_SHORT_DATE);
  const [inDayTenantVacancies, setInDayTenantVacancies] = useState<TenantVacancy[]>([]);
  const [isShowPopupDialog, setIsShowPopupDialog] = useState<boolean>(false);
  const [isShowPopupTenantDialog, setIsShowPopupTenantDialog] = useState<boolean>(false);
  const [selectedTenantVacancy, setSelectedTenantVacancy] = useState<TenantVacancy>(undefined);
  const [selectedTicketVacancy, setSelectedTicketVacancy] = useState<TicketVacancy>(undefined);
  const router = useRouter();

  const isTicketFullOrNotAvailable = (ticketVacancy: TicketVacancy) => {
    return ticketVacancy.status === VACANCY_STATUS.FULL || ticketVacancy.status === VACANCY_STATUS.NOT_AVAILABLE || ticketVacancy.canNotBookMore;
  };

  const handleShowVacancyDetail = (vacancy: TenantVacancy) => {
    if (vacancy.status !== VACANCY_STATUS.NOT_AVAILABLE) {
      setSelectedTenantVacancy(vacancy);
      showTenantVacancyDialog();
    }
  };

  const isOpenTenantVacancy = (tenantVacancy: TenantVacancy) => {
    return selectedTenantVacancy === tenantVacancy;
  };

  const showPopupDialog = (ticketVacancy: TicketVacancy) => {
    setSelectedTicketVacancy(ticketVacancy);

    if (ticketVacancy.status === VACANCY_STATUS.FULL) {
      showFullDialog();
    } else if (ticketVacancy.status === VACANCY_STATUS.AVAILABLE) {
      router.push({ pathname: ROUTE.USE_IN_DAY_BOOKING, query: { tenantCode: ticketVacancy.tenantCode } });
    }
  };

  const handleRedirect = () => {
    router.push({ pathname: ROUTE.USE_IN_DAY_BOOKING, query: { tenantCode: selectedTicketVacancy.tenantCode } });
  };

  const showFullDialog = () => {
    setIsShowPopupDialog(true);
  };

  const hideFullDialog = () => {
    setIsShowPopupDialog(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showTenantVacancyDialog = () => {
    setIsShowPopupTenantDialog(true);
  };

  const hideTenantVacancyDialog = () => {
    setIsShowPopupTenantDialog(false);
    setSelectedTenantVacancy(undefined);
  };

  useEffect(() => {
    let results = [];
    for (const tenant in inDay) {
      results.push({ tenantCode: tenant, ...inDay[tenant] });
    }
    setInDayTenantVacancies(results);
  }, [inDay]);

  const renderTenantVacancyStatus = (vacancy: TenantVacancy) => {
    const statusIcons = {
      [VACANCY_STATUS.AVAILABLE]: OImg,
      [VACANCY_STATUS.FULL]: TriangleImage,
      [VACANCY_STATUS.NOT_AVAILABLE]: XImg,
    };

    const tenant = getTenantByCode(vacancy.tenantCode, tenants);
    const isTenantInSaleTime = checkTenantIsInSaleTime(tenant);
    if (isTenantInSaleTime === false) {
      return <div className={"h-full p-4 w-[200px] text-[#0068B7] text-center xs:inline-block xs:w-[7.5rem]"}>営業時間外</div>;
    }

    const statusIcon = statusIcons[vacancy.status];
    return (
      <div
        className={`${isOpenTenantVacancy(vacancy) ? styles.active : ""} 
        h-full p-4 w-[200px] text-[#0068B7] text-center cursor-pointer xs:inline-block xs:w-[7.5rem]`}
        onClick={() => handleShowVacancyDetail(vacancy)}
      >
        <Image src={statusIcon} alt="icon" />
      </div>
    );
  };

  return (
    <>
      <h2 ref={useOneDayTicketRef} className="my-6 mt-32 xs:mt-3 md:mt-16 text-2xl font-bold text-center text-blue-color">
        当日利用の待ち時間
      </h2>
      <div className="flex w-[825px] xs:max-w-[335px] md:w-full flex-col justify-center items-center mx-auto">
        {/* Heading */}
        <div className="w-full h-full flex items-center bg-[#FAFAFA]">
          <h2 className="p-4 grow border-r-[1px] border-solid border-white text-[#0068B7] xs:hidden md:hidden">店舗名</h2>
          <div
            className="inline-block justify-center w-[200px] grow-0 text-[#0068B7] 
          text-center xs:py-3 xs:w-full xs:flex xs:items-center xs:justify-start xs:gap-3 xs:text-base xs:!h-[48px]
          md:py-3 md:w-full md:flex md:items-center md:justify-start md:gap-6 md:text-lg"
          >
            <div className="hidden xs:block md:ml-3 md:flex md:justify-center md:items-center">
              <Image src={CalendarIcon} alt="calender" />
            </div>
            {nowDate}
          </div>
        </div>

        {/* Body */}
        {inDayTenantVacancies.length > 0 &&
          inDayTenantVacancies.map((item, index) => (
            <div key={index} className="w-full flex h-full items-center border-l-[1px] border-b-[1px] border-r-[1px] border-[#D9D9D9] last:rounded-bl-md">
              <h2 className={"relative p-4 grow w-[620px] xs:w-[120px] line-clamp-1"}>
                {item.tenantName}
                <div
                  className="absolute border-r-[1px] md:border-r-0 border-solid border-[#D9D9D9] top-[-3px] 
                xs:top-0 xs:bottom-0 right-[-1px] bottom-[-4px] left-[5px]"
                ></div>
              </h2>

              {renderTenantVacancyStatus(item)}
            </div>
          ))}

        {/* Desktop */}
        <div className="flex flex-col justify-center gap-[1.25rem] mt-12 xs:mt-4 md:gap-5 font-light xs:hidden">
          <div className="flex gap-2">
            <Image src={OImg} alt="o" />
            <span>すぐにご入場できます</span>
          </div>
          <div className="flex gap-2">
            <Image src={TriangleImage} alt="triangle" />
            <span>入場制限中。お待ちいただきます</span>
          </div>
          <div className="flex gap-2">
            <Image src={XImg} alt="x" />
            <span>完売</span>
          </div>
        </div>

        {/* Mobile */}
        <div className="xs:mt-4 font-semibold text-sm xs:flex-col xs:flex xs:gap-y-2 hidden">
          <div className="flex gap-2">
            <Image src={OSmallImg} alt="o" />
            <span>すぐにご入場できます</span>
          </div>
          <div className="flex gap-2">
            <Image src={TriangleMobileImage} alt="triangleMobile" />
            <span>入場制限中。お待ちいただきます</span>
          </div>
          <div className="flex gap-2">
            <Image src={XSmallImg} alt="x" />
            <span>完売</span>
          </div>
        </div>
      </div>

      {/* Detail Tenant Vacancy Popup*/}
      {isShowPopupTenantDialog && (
        <DetailVacancyDialog
          onDismiss={hideTenantVacancyDialog}
          selectedTenantVacancy={selectedTenantVacancy}
          nowDate={nowDate}
          checkShouldHideTicketVacancy={checkShouldHideTicketVacancy}
          showPopupDialog={showPopupDialog}
          isTicketFullOrNotAvailable={isTicketFullOrNotAvailable}
          isShowPopupDialog={isShowPopupDialog}
          handleRedirect={handleRedirect}
          hideFullDialog={hideFullDialog}
          selectedTicketVacancy={selectedTicketVacancy}
        />
      )}
    </>
  );
}
