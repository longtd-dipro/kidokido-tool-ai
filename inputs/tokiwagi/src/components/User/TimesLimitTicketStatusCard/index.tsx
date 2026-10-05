import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { BookingStatus } from "@prisma/client";
import moment from "moment";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/legacy/image";

import { JP_SHORT_DATE } from "constants/common";
import { ROUTE } from "constants/route";
import { Booking, Ticket } from "models/Entity";
import {
  calculateDeadlineMonthlyTicket,
  isOnlineYearlyTicket,
  isTimesLimitTicket,
} from "utils/booking";
import { isAfterDay } from "utils/date-time";
import { fetchSupportedTicketsByMasterTicketId } from "services/api-client/ticket.service";
import CloseIcon from "statics/images/close.svg";
import { checkMonthlyTicketAlreadyUsed } from "services/api-client/booking.service";

import styles from "./index.module.scss";
import TimesLimitTicketStamps from "./TimesLimitTicketStamps";

type Props = {
  timesLimitBooking: Booking;
  totalInUseDays: number;
  disabled?: boolean;
};

export default function TimesLimitTicketStatusCard(props: Props) {
  const timesLimitBooking = props.timesLimitBooking;
  const { Tenant, Ticket, date, createdAt, id, usageTimes } =
    timesLimitBooking;
  const useFrom = moment(date);
  const useTo = calculateDeadlineMonthlyTicket(createdAt, Ticket);
  const boughtDate = moment(createdAt);

  const isCheckCancelled = [
    BookingStatus.Cancelled,
    BookingStatus.SystemCancelled,
  ].includes(timesLimitBooking.status as any);
  const isCheckExpired = isAfterDay(moment().toDate(), useTo);
  const isDisabled = isCheckCancelled || isCheckExpired;

  const [isShowSelectTenantDialog, setIsShowSelectTenantDialog] =
    useState<boolean>(false);
  const [supportedTickets, setSupportedTickets] = useState<Ticket[]>([]);

  const router = useRouter();

  const renderStatus = (booking: Booking, deadlineDate: Date) => {
    // @ts-ignore
    const isCancelled = (
      [
        BookingStatus.Cancelled,
        BookingStatus.SystemCancelled,
      ] as BookingStatus[]
    ).includes(booking.status);
    const isExpired = isAfterDay(moment().toDate(), deadlineDate);
    if (isCancelled) {
      return (
        <div
          className={`user-button-outline-blue-medium !cursor-default min-w-[82px] ${styles.bookingExpired}`}
        >
          返金済み
        </div>
      );
    }

    if (isExpired) {
      return (
        <div
          className={`user-button-outline-blue-medium !cursor-default min-w-[82px] ${styles.bookingExpired}`}
        >
          期限終了
        </div>
      );
    }

    return (
      <div
        className={`user-button-outline-blue-medium !cursor-default min-w-[82px] ${styles.bookingAvailable}`}
      >
        利用中
      </div>
    );
  };

  const cardBackground = isDisabled
    ? `${styles.backgroundDisable}`
    : `${
      isOnlineYearlyTicket(Ticket) || isTimesLimitTicket(Ticket?.type)
        ? styles.backgroundEnableYellow
        : styles.backgroundEnableBlue
    }`;

  const selectTenant = async (ticket: Ticket) => {
    if (ticket.masterTicketId != undefined) {
      let supportedTickets = [];
      const alreadyUsed = await checkMonthlyTicketAlreadyUsed(
        timesLimitBooking.id
      );

      if (alreadyUsed) {
        supportedTickets = await fetchSupportedTicketsByMasterTicketId(
          ticket.masterTicketId,
          {
            includeTenant: true,
            hasTodayBookingSchedule: true,
          }
        );
      }

      if (supportedTickets?.length <= 1) {
        gotoUseInDayBooking(ticket.tenantCode);
      } else {
        setSupportedTickets(supportedTickets);
        setIsShowSelectTenantDialog(true);
      }
    } else {
      gotoUseInDayBooking(ticket.tenantCode);
    }
  };

  const gotoUseInDayBooking = (tenantCode: string) => {
    router.push(
      `${ROUTE.USE_IN_DAY_BOOKING}?tenantCode=${tenantCode}&parentBookingId=${id}`
    );
  };

  const onDismissDialog = () => {
    setIsShowSelectTenantDialog(false);
  };

  const totalTimes = Ticket.TicketDetail.limitTimes + (Ticket.TicketDetail.extraTimes || 0);

  return (
    <div
      className={`${styles.card} ${props.disabled ? styles.cardDisabled : ""} ${cardBackground}`}
    >
      <div className={styles.cardHeader}>
        <div className="flex-1">
          <span className="xs:text-xl text-2xl font-bold break-all">
            {Ticket.name}
          </span>
        </div>
        <div>
          {/* MOBILE */}
          <div className="xsup:hidden">
            <div className="flex items-end">
              {renderStatus(timesLimitBooking, useTo)}
            </div>
          </div>
          {/* DESKTOP */}
          {isDisabled ? (
            <div className="xs:hidden opacity-[0.4]">
              <span className="user-button-outline-blue-medium !cursor-default">
                今から利用する
              </span>
            </div>
          ) : (
            <div className="xs:hidden">
              <span
                className="user-button-outline-blue-medium"
                onClick={() => selectTenant(Ticket)}
              >
                今から利用する
              </span>
            </div>
          )}
        </div>
      </div>
      <div className={`${styles.cardBody} xs:flex-col xs:gap-5 font-bold`}>
        <div className="flex-grow max-w-full">
          <div className="text-[14px]">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="mb-[10px]">
                  <span>利用期間:&nbsp;</span>
                  <span>
                    {useFrom.format(JP_SHORT_DATE)}から
                    {moment(useTo).format(JP_SHORT_DATE)}まで
                  </span>
                </div>
                {/* DESKTOP ONLY*/}
              </div>
              <div className="flex items-end ml-1 xs:hidden">{renderStatus(timesLimitBooking, useTo)}</div>
            </div>
            <div className="mb-[10px]">
              <span>利用可能枚数:&nbsp;</span>
              <span>{totalTimes}枚</span>
            </div>
            <div className="mb-[10px]">
              <span>残り利用可能枚数:&nbsp;</span>
              <span>{totalTimes - usageTimes}枚</span>
            </div>
            <div className="mb-[10px]">
              <span>利用店舗:&nbsp;</span>
              <span className="break-all">{Tenant.name}</span>
            </div>

            {/*Bought Date*/}
            <div className="mb-[10px]">
              <span>購入日:&nbsp;</span>
              <span>{boughtDate.format(JP_SHORT_DATE)}</span>
            </div>
        
            <TimesLimitTicketStamps
              usageBookings={timesLimitBooking.usageBookings}
              limitTimes={Ticket.TicketDetail.limitTimes}
              extraTimes={Ticket.TicketDetail.extraTimes}
              usageTimes={usageTimes}
            />
          </div>
        </div>
        {/* MOBILE */}
        {isDisabled ? (
          <div className="flex justify-center xsup:hidden opacity-[0.3]">
            <span className="user-button-outline-blue-medium">
              今から利用する
            </span>
          </div>
        ) : (
          <div className="flex justify-center xsup:hidden">
            <span
              className="user-button-outline-blue-medium"
              onClick={() => selectTenant(Ticket)}
            >
              今から利用する
            </span>
          </div>
        )}
      </div>

      {/*Select Supported Tenant Dialog*/}
      {isShowSelectTenantDialog && (
        <Dialog
          disablePortal
          open={true}
          onClose={onDismissDialog}
          aria-labelledby="responsive-dialog-title"
          className="mx-auto text-color w-[640px] xs:w-full xs:px-5"
        >
          <div className="flex w-full items-start justify-end pt-[20px] px-[20px]">
            <Image
              src={CloseIcon}
              alt="close"
              onClick={onDismissDialog}
              className="cursor-pointer"
            />
          </div>
          <DialogTitle className="!text-2xl !font-bold text-center responsive-dialog-title xs:!text-[18px]">
            利用希望の店舗を選択してください
          </DialogTitle>

          <DialogContent className="mt-2">
            <div className="w-full flex flex-col justify-center">
              {supportedTickets.map((ticket) => {
                return (
                  <div
                    key={ticket.Tenant?.code}
                    className="w-full break-all cursor-pointer p-4 border border-[#D9D9D9] rounded-[8px] bg-[#F3FAFF] hover:bg-[#0068B7] mb-1"
                    onClick={() => gotoUseInDayBooking(ticket.Tenant?.code)}
                  >
                    {ticket.Tenant?.name}
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
