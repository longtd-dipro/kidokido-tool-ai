import moment from "moment";
import Image from "next/legacy/image";
import { useState } from "react";

import Spinner from "components/common/Spinner";
import InformationDialog from "components/InDayVacancies/InformationDialog";
import { JP_SHORT_DATE, NOT_AVAILABLE_REASON, VACANCY_STATUS } from "constants/common";
import CalendarImg from "statics/images/user/calendar.svg";
import OImg from "statics/images/user/circle-blue.svg";
import TriangleImage from "statics/images/triangle-pc.svg";
import XImg from "statics/images/user/x-red.svg";
import { Ticket } from "models/Entity";
import { TicketVacancy } from "models/Vacancy";
import TicketPriceDialog from "components/CreateBooking/PaymentOfflineBookingForm/TicketPriceDialog";
import { fetchTicketById } from "services/api-client/ticket.service";

import styles from "./UseInDayBookingVacancies.module.scss";

export interface Props {
  bookingVacancies: TicketVacancy[];
  tickets: Ticket[];
  loadingBooking: boolean;
  monthlyTickets?: Ticket[];
  isAllTicketNotAvailable?: boolean;
  onClickAvailableVacancy?: (ticketVacancy: TicketVacancy) => void;
  onError?: (msg) => void;
}

export default function UseInDayBookingVacancies({
  loadingBooking,
  bookingVacancies,
  monthlyTickets,
  tickets,
  isAllTicketNotAvailable,
  onClickAvailableVacancy,
  onError,
}: Props) {
  const [isShowPopupDialog, setIsShowPopupDialog] = useState<boolean>(false);
  const [selectedTicketVacancy, setSelectedTicketVacancy] = useState<TicketVacancy>(undefined);
  const [isShowTicketPriceDialog, setIsShowTicketPriceDialog] = useState<boolean>(false);
  const [selectedTicketToShowPrice, setSelectedTicketToShowPrice] = useState<Ticket>(undefined);

  const currentDate = `${moment().format(JP_SHORT_DATE)} (${moment().format("ddd")})`;

  const handleShowWaitingPopup = (ticketVacancy: TicketVacancy) => {
    setSelectedTicketVacancy(ticketVacancy);
    setIsShowPopupDialog(true);
  };

  const handleClickVacancy = (ticketVacancy: TicketVacancy) => {
    const { status, canNotBookMore } = ticketVacancy;

    if (status === VACANCY_STATUS.FULL && !canNotBookMore) {
      handleShowWaitingPopup(ticketVacancy);
    }

    if (status === VACANCY_STATUS.AVAILABLE) {
      onClickAvailableVacancy(ticketVacancy);
    }
  };

  const handleClickTicket = async (ticketId: number) => {
    let ticket = tickets.find((ticket) => ticket.id === ticketId);
    const monthlyTicket = monthlyTickets.find((item) => item.id === ticketId);

    if (!ticket && !monthlyTicket) {
      try {
        ticket = await fetchTicketById(ticketId);
      } catch (err) {
        const message = err.response?.data?.error || err.message;
        onError(message);
      }
    }

    showTicketPriceDialog();
    setSelectedTicketToShowPrice(ticket || monthlyTicket);
  };

  const showTicketPriceDialog = () => {
    setIsShowTicketPriceDialog(true);
  };

  const hideTicketPriceDialog = () => {
    setIsShowTicketPriceDialog(false);
  };

  return (
    <div className="w-full">
      <div className={`${styles.heading} flex justify-between text-2xl font-medium`}>
        <div className="flex items-center gap-4">
          <Image src={CalendarImg} alt="icon" />
          <p className="text-2xl font-medium xs:text-base xs:leading-7 md:text-lg">{currentDate}</p>
        </div>
      </div>
      {!loadingBooking && bookingVacancies?.length ? (
        <>
          {isAllTicketNotAvailable ? (
            <p className="text-center my-4 mt-6">お取り扱い時間外です。</p>
          ) : (
            bookingVacancies.map((ticketVacancy) => {
              const { status, ticketName, ticketId, reason, canNotBookMore } = ticketVacancy;

              const isNotInBookingSchedule = status === VACANCY_STATUS.NOT_AVAILABLE && reason === NOT_AVAILABLE_REASON.NO_BOOKING_SCHEDULE;
              const isInBookingTime = status === VACANCY_STATUS.NOT_AVAILABLE && reason !== NOT_AVAILABLE_REASON.NO_BOOKING_SCHEDULE;
              const isMonthlyBooking = ticketId === monthlyTickets[0]?.id;

              return (
                (!isNotInBookingSchedule || isMonthlyBooking) && (
                  <div
                    key={ticketId}
                    className={`flex justify-between items-center
                    py-1 px-4 text-color font-medium text-xl xs:text-base md:text-base ${styles.vacancies}`}
                  >
                    <div onClick={() => handleClickTicket(ticketId)} className="cursor-pointer break-all flex-1">
                      {ticketName}
                    </div>
                    <div
                      className="flex justify-center items-center gap-4 cursor-pointer w-[100px] h-[80px] xs:h-[50px] xs:w-[60px]"
                      onClick={() => handleClickVacancy(ticketVacancy)}
                    >
                      <div className="md:w-4 md:h-4 flex w-[23px]">
                        {status === VACANCY_STATUS.FULL ? (
                          <Image src={TriangleImage} alt={"TriangleImage"} />
                        ) : (
                          <Image src={isInBookingTime || (status === VACANCY_STATUS.FULL && canNotBookMore) ? XImg : OImg} alt="icon" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              );
            })
          )}
        </>
      ) : (
        ""
      )}

      {loadingBooking && (
        <div className="flex justify-center mt-4">
          <Spinner />
        </div>
      )}

      {isShowPopupDialog && (
        <InformationDialog
          onDismiss={() => {
            setSelectedTicketVacancy(undefined);
            setIsShowPopupDialog(false);
          }}
          message="現在の待ち時間"
          text="予約する"
          people={selectedTicketVacancy.waitingBookingsCount}
          minutes={selectedTicketVacancy.waitingTimeInMinutes}
        />
      )}

      {isShowTicketPriceDialog && <TicketPriceDialog onDismiss={hideTicketPriceDialog} ticket={selectedTicketToShowPrice} />}
    </div>
  );
}
