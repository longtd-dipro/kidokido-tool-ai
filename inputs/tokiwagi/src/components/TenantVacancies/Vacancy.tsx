/* eslint-disable max-len */
import { Button } from "@mui/material";
import moment from "moment";

import { TenantVacancy } from "models/Vacancy";
import { renderTicketOnlineVacancyStatusIcon } from "utils/vacancy-status-ui";

import styles from "./Vacancy.module.scss";

export interface Props {
  vacancy: TenantVacancy;
  isActive: boolean;
  onShowVacancyDetail: () => void;
  hideDayLabel?: boolean;
}

export default function VacancyItem({ vacancy, onShowVacancyDetail, isActive }: Props) {
  const { date } = vacancy;
  const dateLabel = moment(date).format("MM/DD");
  const isSaturday = moment(date).day() === 6;
  const isSunday = moment(date).day() === 0;

  return (
    <div>
      {/*DESKTOP + TABLET*/}
      <div className="xs:hidden md:hidden bar-bg flex flex-col items-center">
        <Button
          variant="outlined"
          className={
            `flex flex-col w-[72px] h-[64px] md:w-[50px] md:h-[54px] ${isActive && styles.active} ${styles.normal} ${isSaturday && styles.saturday} ${isSunday && styles.sunday}`
          }
          color="primary"
          size="small"
          onClick={() => onShowVacancyDetail()}
        >
          <p className="!text-[#313131] text-sm md:text-xs font-medium">{dateLabel}</p>
          {vacancy && renderTicketOnlineVacancyStatusIcon(vacancy)}
        </Button>
      </div>

      {/*TABLET*/}
      <div className="xs:hidden mdup:hidden bar-bg">
        <Button
          variant="outlined"
          className={
            `flex flex-col gap-1 !p-0 !min-w-[50px] w-[50px] h-[54px] ${isActive && styles.active} ${styles.normal} ${isSaturday && styles.saturday} ${isSunday && styles.sunday}`
          }
          color="primary"
          size="small"
          onClick={() => onShowVacancyDetail()}
        >
          <p className="!text-[#313131] text-sm md:text-xs font-medium">{dateLabel}</p>
          {vacancy && renderTicketOnlineVacancyStatusIcon(vacancy)}
        </Button>
      </div>

      {/*MOBILE*/}
      <div className="flex flex-col items-center justify-center gap-1 xsup:hidden">
        <Button
          variant="outlined"
          className={
            `flex flex-col items-center justify-center !p-0 !min-w-[44px] !w-full max-w-[56px] h-[54px] !font-medium !text-xs text-black ${styles.normal} ${isActive && styles.active} ${isSaturday && styles.saturday} ${isSunday && styles.sunday}`
          }
          color="primary"
          onClick={() => onShowVacancyDetail()}
          size="small"
        >
          <p className="mb-1 !text-xs text-[#000000]">{dateLabel}</p>
          {vacancy && renderTicketOnlineVacancyStatusIcon(vacancy, true)}
        </Button>
      </div>
    </div>
  );
}
