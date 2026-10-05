import { Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import { PickersDay } from "@mui/x-date-pickers";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { BookingStatus, TicketBookingSchedule } from "@prisma/client";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/legacy/image";

import { JP_SHORT_DATE, SHORT_DATE } from "constants/common";
import { ROUTE } from "constants/route";
import { Booking, Ticket, Tenant } from "models/Entity";
import { calculateRemainingDaysOfMonthlyBooking, isOnlineYearlyTicket } from "utils/booking";
import { isAfterDay, isBeforeDay, isSameOrAfterDay, isSameOrBeforeDay } from "utils/date-time";
import { getAgeLabel } from "utils/ticket";
import { fetchSupportedTicketsByMasterTicketId } from "services/api-client/ticket.service";
import CloseIcon from "statics/images/close.svg";
import ArrowUpBlueIcon from "statics/images/user/arrow-up-blue.svg";
import ArrowDownBlueIcon from "statics/images/user/arrow-down-blue.svg";
import { checkMonthlyTicketAlreadyUsed } from "services/api-client/booking.service";

import styles from "./index.module.scss";

type Props = {
  monthlyBooking: Booking;
  totalInUseDays: number;
  disabled?: boolean;
};

export default function MonthlyStatusTicketCard(props: Props) {
  const monthlyBooking = props.monthlyBooking;
  const { Tenant, Ticket, date, childQuantity, deadlineDate, createdAt, id } = monthlyBooking;
  const useFrom = moment(date);
  const useTo = deadlineDate;
  const boughtDate = moment(createdAt);

  const remainingDays = calculateRemainingDaysOfMonthlyBooking(monthlyBooking, deadlineDate);
  const isCheckCancelled = [BookingStatus.Cancelled, BookingStatus.SystemCancelled].includes(monthlyBooking.status as any);
  const isCheckExpired = isAfterDay(moment().toDate(), deadlineDate);
  const isDisabled = isCheckCancelled || isCheckExpired;
  const [currentDate] = useState(moment(new Date()).format(SHORT_DATE));
  const [supportedTenants, setSupportedTenants] = useState<Tenant[]>([]);
  const [isSupportedTenantsListExpandable, setIsSupportedTenantsListExpandable] = useState<boolean>(false);
  const [isSupportedTenantsListExpanded, setIsSupportedTenantsListExpanded] = useState<boolean>(false);
  const [displaySupportedTenants, setDisplaySupportedTenants] = useState<Tenant[]>([]);

  const [isShowSelectTenantDialog, setIsShowSelectTenantDialog] = useState<boolean>(false);
  const [supportedTickets, setSupportedTickets] = useState<Ticket[]>([]);

  const router = useRouter();

  useEffect(() => {
    if (monthlyBooking.Ticket?.masterTicketId) {
      fetchSupportedTenants(monthlyBooking.Ticket?.masterTicketId);
    }
  }, [monthlyBooking]);

  const fetchSupportedTenants = async (masterTicketId: number) => {
    let supportedTicketsWithTenant = await fetchSupportedTicketsByMasterTicketId(masterTicketId, {
      includeTenant: true
    });

    // pick ticket associated to booking to top
    const boughtTicket = supportedTicketsWithTenant.find(ticket => ticket.id === monthlyBooking.ticketId);
    if (boughtTicket) {
      supportedTicketsWithTenant = [boughtTicket].concat(supportedTicketsWithTenant.filter(ticket => ticket.id !== boughtTicket.id));
    }

    const supportedTenants = supportedTicketsWithTenant.map((ticket: Ticket) => ticket.Tenant);
    setSupportedTenants(supportedTenants);
    if (supportedTenants.length > 1) {
      setIsSupportedTenantsListExpandable(true);
      // Only show the first tenant and hide the others for expanding
      setDisplaySupportedTenants([supportedTenants[0]]);
    }
  };

  const onSupportedTenantsListToggle = () => {
    if (isSupportedTenantsListExpanded) {
      setDisplaySupportedTenants([supportedTenants[0]]);
    } else {
      setDisplaySupportedTenants(supportedTenants);
    }
    setIsSupportedTenantsListExpanded(!isSupportedTenantsListExpanded);
  };

  const renderStatus = (booking: Booking, deadlineDate: Date) => {
    // @ts-ignore
    const isCancelled = [BookingStatus.Cancelled, BookingStatus.SystemCancelled].includes(booking.status);
    const isExpired = isAfterDay(moment().toDate(), deadlineDate);
    if (isCancelled) {
      return <div className={`user-button-outline-blue-medium !cursor-default min-w-[82px] ${styles.bookingExpired}`}>返金済み</div>;
    }

    if (isExpired) {
      return <div className={`user-button-outline-blue-medium !cursor-default min-w-[82px] ${styles.bookingExpired}`}>期限終了</div>;
    }

    return <div className={`user-button-outline-blue-medium !cursor-default min-w-[82px] ${styles.bookingAvailable}`}>利用中</div>;
  };

  // Check Booking monthly in bookingSchedule
  const isCheckBookingInCalender = useMemo(() => {
    return (day: moment.Moment, ticketBookingSchedules: TicketBookingSchedule[]) => {
      if (isBeforeDay(day, useFrom) || isAfterDay(day, useTo)) {
        return false;
      }

      const result = ticketBookingSchedules.some(
        (ticketBookingSchedule) => isSameOrAfterDay(day, ticketBookingSchedule.dateFrom) && isSameOrBeforeDay(day, ticketBookingSchedule.dateTo)
      );
      return result;
    };
  }, [useFrom, useTo]);

  // Check Booking between useFrom and useTo
  const isWithinBookingPeriod = (day: moment.Moment) => {
    return day.isBetween(useFrom, useTo, "day", "[]");
  };

  const cardBackground =
    isDisabled
      ? `${styles.backgroundDisable}`
      : `${isOnlineYearlyTicket(Ticket) ? styles.backgroundEnableYellow : styles.backgroundEnableBlue}`;

  const getChildAgeChainingLabels = (booking: Booking) => {
    if (!booking) return "";

    const childAgeInMonths = booking.BookingChildAgeInfo.map((item) => item.childAgeInMonth);

    const result = childAgeInMonths.map((childAgeInMonth) => getAgeLabel(childAgeInMonth)).join("・");
    return result;
  };

  const selectTenant = async (ticket: Ticket) => {
    if (ticket.masterTicketId != undefined) {
      let supportedTickets = [];
      const alreadyUsed = await checkMonthlyTicketAlreadyUsed(monthlyBooking.id);

      if (alreadyUsed) {
        supportedTickets = await fetchSupportedTicketsByMasterTicketId(ticket.masterTicketId, {
          includeTenant: true,
          hasTodayBookingSchedule: true
        });
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
    router.push(`${ROUTE.USE_IN_DAY_BOOKING}?tenantCode=${tenantCode}&parentBookingId=${id}`);
  };

  const onDismissDialog = () => {
    setIsShowSelectTenantDialog(false);
  };

  return (
    <div className={`${styles.card} ${props.disabled ? styles.cardDisabled : ""} ${cardBackground}`}>
      <div className={styles.cardHeader}>
        <div className="flex-1">
          <span className="xs:text-xl text-2xl font-bold break-all">{Ticket.name}</span>
        </div>
        <div>
          {/* MOBILE */}
          <div className="xsup:hidden">
            <div className="flex items-end">{renderStatus(monthlyBooking, useTo)}</div>
          </div>
          {/* DESKTOP */}
          {isDisabled ? (
            <div className="xs:hidden opacity-[0.4]">
              <span className="user-button-outline-blue-medium !cursor-default">今から利用する</span>
            </div>
          ) : (
            <div className="xs:hidden">
              <span className="user-button-outline-blue-medium" onClick={() => selectTenant(Ticket)}>今から利用する</span>
            </div>
          )}
        </div>
      </div>
      <div className={`${styles.cardBody} xs:flex-col xs:gap-5`}>
        <div className="flex-grow max-w-full">
          <div className="text-[14px]">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="mb-[10px]">
                  <span className="font-medium">利用店舗:&nbsp;</span>
                  <span className="font-light break-all">{Tenant.name}</span>
                </div>
                <div className="mb-[10px]">
                  <span className="font-medium">お持ちの枚数:&nbsp;</span>
                  <span className="font-light">{childQuantity}枚</span>
                </div>
              </div>
              {/* DESKTOP ONLY*/}
              <div className="flex items-end ml-1 xs:hidden">{renderStatus(monthlyBooking, useTo)}</div>
            </div>

            <div className="mb-[10px]">
              <span className="font-medium">お子様の年齢:&nbsp;</span>
              <span className="font-light">{getChildAgeChainingLabels(monthlyBooking)}</span>
            </div>
            {/*Bought Date*/}
            <div className="mb-[10px]">
              <span className="font-medium">購入日:&nbsp;</span>
              <span className="font-light">
                {boughtDate.format(JP_SHORT_DATE)}
              </span>
            </div>
            <div className="mb-[10px]">
              <span className="font-medium">利用期間:&nbsp;</span>
              <span className="font-light">
                {useFrom.format(JP_SHORT_DATE)}から{moment(useTo).format(JP_SHORT_DATE)}まで
              </span>
            </div>
            {/*Remaining available days*/}
            <div className="mb-[10px]">
              <span className="font-medium">残り利用可能日数:&nbsp;</span>
              <span className="font-light">{remainingDays > 0 ? remainingDays : 0}日</span>
            </div>

            {displaySupportedTenants.length > 0 &&
              <>
                {/*Supported Tenants*/}
                <div className="flex mb-[10px] xs:flex-col">
                  <span className="font-medium">利用可能な店舗:&nbsp;</span>
                  <div className="flex-1 flex font-light ml-2 xs:ml-0 xs:mt-1">
                    <div className={"px-1 flex flex-col gap-2 xs:flex-1"}>
                      {displaySupportedTenants.map((tenant) => <p key={tenant.code} className="break-all">・{tenant.name}</p>)}
                      {isSupportedTenantsListExpandable &&
                        <p className="cursor-pointer flex justify-start" onClick={onSupportedTenantsListToggle}>
                          <Image src={isSupportedTenantsListExpanded ? ArrowUpBlueIcon : ArrowDownBlueIcon} alt="icon" />
                          <span className="ml-1 text-[#0068B7]">{isSupportedTenantsListExpanded ? "少なくする" : "もっと見る"}</span>
                        </p>
                      }
                    </div>
                  </div>
                </div>

                {/*Note*/}
                <div className="flex mb-[10px]">
                  <div><span className="font-bold">※</span></div>
                  <div className="flex-1 flex flex-col ml-1">
                    <span className="font-bold">全日年間パスの初回利用の場合、ご購入店舗でのみご予約可能です。</span>
                    <span className="font-bold">2回目以降のご利用はその他店舗でご予約いただけます</span>
                  </div>
                </div>
              </>
            }
          </div>
        </div>

        {/* MOBILE */}
        {isDisabled ? (
          <div className="flex justify-center xsup:hidden opacity-[0.3]">
            <span className="user-button-outline-blue-medium">今から利用する</span>
          </div>
        ) : (
          <div className="flex justify-center xsup:hidden">
            <span className="user-button-outline-blue-medium" onClick={() => selectTenant(Ticket)}>今から利用する</span>
          </div>
        )}
      </div>
      {/* Calendar Booking Monthly */}
      <div className="flex flex-col justify-center items-center">
        <div className="mt-10 max-w-lg shadow-md rounded-lg overflow-hidden">
          {!isDisabled && (
            <div className="calender-booking">
              <StaticDatePicker
                orientation="portrait"
                renderInput={(params) => <TextField {...params} inputProps={{ readonly: true }} />}
                displayStaticWrapperAs="desktop"
                value={currentDate}
                shouldDisableDate={(day: moment.Moment) => {
                  if (!isCheckBookingInCalender(day, Ticket.TicketBookingSchedule)) {
                    return true;
                  }
                  if (!isWithinBookingPeriod(day)) {
                    return true;
                  }

                  return false;
                }}
                disableHighlightToday={true}
                onChange={() => {}}
                renderDay={(day, __, pickerDayProps) => {
                  const isStartDate = day.isSame(useFrom, "day");
                  const useToMoment = moment(useTo);
                  const isEndDate = day.isSame(useToMoment, "day");
                  const isBluePicker = isCheckBookingInCalender(day, Ticket.TicketBookingSchedule) ? "bluePickerMUI" : "";
                  const isYellowPicker = isStartDate || isEndDate ? "yellowPickerMUI" : "";
                  const customClassDatePicker = `${pickerDayProps.className} ${pickerDayProps.disabled ? "disablePickerMUI" : ""} 
                  ${isYellowPicker ? isYellowPicker : isBluePicker}`;
                  return <PickersDay sx={{ color: "#313131" }} className={`${customClassDatePicker}`} {...pickerDayProps} />;
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Circle Note */}
      {!isCheckExpired && !isCheckCancelled && (
        <div className="flex justify-center items-center gap-3 mt-3 xs:flex-col xs:items-start  ">
          <div className="flex items-center gap-2 xs:w-[196px] xs:mx-auto">
            <div className="w-8 h-8 bg-[#ffe732] rounded-full"></div>
            <span className="text-xs">開始・終了日</span>
          </div>

          <div className="flex items-center gap-2 xs:w-[196px] xs:mx-auto">
            <div className="w-8 h-8 bg-[#0068b7] rounded-full"></div>
            <span className="text-xs">フリーパスご利用可能日</span>
          </div>
        </div>
      )}

      {/*Select Supported Tenant Dialog*/}
      {isShowSelectTenantDialog && (
        <Dialog disablePortal open={true} onClose={onDismissDialog}
          aria-labelledby="responsive-dialog-title" className="mx-auto text-color w-[640px] xs:w-full mx-auto xs:px-5">
          <div className="flex w-full items-start justify-end pt-[20px] px-[20px]">
            <Image src={CloseIcon} alt="close" onClick={onDismissDialog} className="cursor-pointer" />
          </div>
          <DialogTitle className="!text-2xl !font-medium text-center responsive-dialog-title xs:!text-[18px]">利用希望の店舗を選択してください</DialogTitle>

          <DialogContent className="mt-2">
            <div className="w-full flex flex-col justify-center">
              {supportedTickets.map(ticket => {
                return <div key={ticket.Tenant?.code}
                  className="w-full break-all cursor-pointer p-4 border border-[#D9D9D9] rounded-[8px] bg-[#F3FAFF] hover:bg-[#0068B7] mb-1"
                  onClick={() => gotoUseInDayBooking(ticket.Tenant?.code)}>{ticket.Tenant?.name}
                </div>;
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
