import { Button } from "@mui/material";
import moment from "moment";
import { useState } from "react";

import ErrorDialog from "components/common/ErrorDialog";
import { VACANCY_STATUS } from "constants/common";
import { MESSAGES } from "constants/messages";
import { OnlineTicketVacancy } from "models/Vacancy";
import { renderTicketOnlineVacancyStatusIcon } from "utils/vacancy-status-ui";

import styles from "./Vacancy.module.scss";

export interface Props {
  vacancy: OnlineTicketVacancy;
  wasChosen: boolean;
  onChooseVacancy: (vacancy: OnlineTicketVacancy) => void;
  showErrorWhenFullVacancy: boolean;
  showErrorWhenNotAvailableVacancy?: boolean;
  hideDayLabel?: boolean;
}

export default function VacancyItem({
  vacancy,
  onChooseVacancy,
  wasChosen,
  showErrorWhenFullVacancy,
  showErrorWhenNotAvailableVacancy = true,
  hideDayLabel = false,
}: Props) {
  const { date, status } = vacancy;
  const dateLabel = moment(date).format("MM/DD");
  const dayLabel = moment(date).format("ddd");
  const isSaturday = moment(date).day() === 6;
  const isSunday = moment(date).day() === 0;

  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();

  const isFull = status === VACANCY_STATUS.FULL;
  const isAvailableBookingSchedule = status === VACANCY_STATUS.AVAILABLE;

  const handleChooseVacancy = () => {
    if (isFull && showErrorWhenFullVacancy) {
      setErrMsg(MESSAGES.FULLY_PAYMENT_ONLINE_BOOKING);
      showErrorDialog();
      return;
    }

    if (!isAvailableBookingSchedule) {
      setErrMsg(MESSAGES.NOT_AVAILABLE_BOOKING_SCHEDULE);
      showErrorWhenNotAvailableVacancy && showErrorDialog();
      return;
    }

    onChooseVacancy(vacancy);
  };

  const hideErrorDialog = () => {
    setIsShowErrorDialog(false);
  };

  const showErrorDialog = () => {
    setIsShowErrorDialog(true);
  };

  return (
    <div>
      {/*DESKTOP*/}
      <div className="xs:hidden md:hidden bar-bg">
        <Button
          variant="outlined"
          className={`flex flex-col gap-1 w-[80px] h-[64px] !p-0  ${styles.normal} ${wasChosen && styles.active} ${isSaturday && styles.saturday} ${
            isSunday && styles.sunday
          }`}
          color="primary"
          onClick={handleChooseVacancy}
          size="small"
        >
          {!hideDayLabel && <p className="vacancies-date-label text-[#000000] text-sm">{dayLabel}</p>}
          <p className="vacancies-date-label text-[#000000] text-sm">{dateLabel}</p>
          {vacancy && renderTicketOnlineVacancyStatusIcon(vacancy)}
        </Button>
      </div>

      {/*TABLET*/}
      <div className="xs:hidden mdup:hidden bar-bg ">
        <Button
          variant="outlined"
          className={`flex flex-col gap-1 !p-0 !min-w-[50px] w-[50px] h-[54px]  ${styles.normal} ${wasChosen && styles.active} ${
            isSaturday && styles.saturday
          } ${isSunday && styles.sunday}`}
          color="primary"
          onClick={handleChooseVacancy}
          size="small"
        >
          {!hideDayLabel && <p className="vacancies-date-label text-[10px] text-[#000000]">{dayLabel}</p>}
          <p className="vacancies-date-label text-xs text-[#000000]">{dateLabel}</p>
          <span className="leading-[16px]">
            {vacancy && renderTicketOnlineVacancyStatusIcon(vacancy, true)}
          </span>
        </Button>
      </div>

      {/*MOBILE*/}
      <div className="flex flex-col items-center justify-center gap-1 w-full xsup:hidden">
        {!hideDayLabel && (
          <div className="text-sm font-semibold text-[#000000]">
            <p>{dayLabel}</p>
          </div>
        )}
        <Button
          variant="outlined"
          className={`flex flex-col items-center justify-center !p-0 !min-w-[44px] !w-full max-w-[56px] h-[54px] !font-medium !text-xs text-black ${
            styles.normal
          } ${wasChosen && styles.active} ${isSaturday && styles.saturday} ${isSunday && styles.sunday}`}
          color="primary"
          onClick={handleChooseVacancy}
          size="small"
        >
          <p className="mb-1 !text-xs text-[#000000]">{dateLabel}</p>
          {vacancy && renderTicketOnlineVacancyStatusIcon(vacancy, true)}
        </Button>
      </div>

      {/*Error*/}
      {isShowErrorDialog && <ErrorDialog message={errMsg} text="戻る" onDismiss={hideErrorDialog} />}
    </div>
  );
}
