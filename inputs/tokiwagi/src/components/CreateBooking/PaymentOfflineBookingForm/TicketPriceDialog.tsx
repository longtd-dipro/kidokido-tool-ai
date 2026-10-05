import { Dialog, DialogContent } from "@mui/material";
import Image from "next/legacy/image";
import moment from "moment";

import { Ticket } from "models/Entity";
import CloseIcon from "statics/images/close.svg";
import { formatCurrency } from "utils/number";
import { getTicketBookingSchedule } from "utils/ticket";
import { SHORT_DATE } from "constants/common";
import { isHourlyTicket, isOnlineMonthlyTicket, isOnlyAdultTicket } from "utils/booking";
import { formatBasePeriod, formatExtendPeriod } from "utils/date-time";
import { DiscountSettingItem } from "models/Discount";

export interface Props {
  ticket: Ticket;
  onDismiss: () => void;
}

export default function TicketPriceDialog({ ticket, onDismiss }: Props) {
  const renderHourlyOrDailyTicketPrice = (ticket: Ticket) => {
    const currentDate = moment().utc(true).format(SHORT_DATE);
    const bookingSchedule = getTicketBookingSchedule(currentDate, ticket);

    const hasExtendedChildPrice = bookingSchedule?.extendedChildPeriod && +bookingSchedule?.extendedChildPeriodPrice !== 0;
    const childBasePeriod = formatBasePeriod(+bookingSchedule.baseChildPeriod, bookingSchedule.baseChildPeriodUnit, ticket.type);
    const childExtendPeriod = formatExtendPeriod(+bookingSchedule.extendedChildPeriod, bookingSchedule.extendedChildPeriodUnit);

    const hasExtendedAdultPrice = bookingSchedule?.extendedAdultPeriod && +bookingSchedule?.extendedAdultPeriodPrice !== 0;
    const adultBasePeriod = formatBasePeriod(+bookingSchedule.baseAdultPeriod, bookingSchedule.baseAdultPeriodUnit, ticket.type);
    const adultExtendPeriod = formatExtendPeriod(+bookingSchedule.extendedAdultPeriod, bookingSchedule.extendedAdultPeriodUnit);

    return (
      <div>
        {/* Child */}
        {!isOnlyAdultTicket(ticket) && (
          <div className="flex justify-between items-center mt-8 xs:flex-col xs:mt-6">
            <p className="text-blue-color font-bold text-sm xs:mb-2">子ども</p>
            <div className="text-center min-w-[150px]">
              <p className="font-semibold text-[20px]">{formatCurrency(+bookingSchedule.baseChildPeriodPrice)}</p>
              {isHourlyTicket(ticket) && <p className="font-light text-xs py-1">(最初の{childBasePeriod})</p>}
              {hasExtendedChildPrice && (
                <p className="font-light text-xs">
                  ※延長{childExtendPeriod}ごとに{formatCurrency(+bookingSchedule.extendedChildPeriodPrice)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Adult */}
        <div className="flex justify-between items-center mt-8 xs:flex-col xs:mt-6">
          <p className="text-blue-color font-bold text-sm xs:mb-2">おとな</p>
          <div className="text-center min-w-[150px]">
            <p className="font-semibold text-[20px]">{formatCurrency(+bookingSchedule.baseAdultPeriodPrice)}</p>
            {isHourlyTicket(ticket) && <p className="font-light text-xs py-1">(最初の{adultBasePeriod})</p>}
            {hasExtendedAdultPrice && (
              <p className="font-light text-xs">
                ※延長{adultExtendPeriod}ごとに{formatCurrency(+bookingSchedule.extendedAdultPeriodPrice)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyTicketPrice = (ticket: Ticket) => {
    return (
      <div>
        {/* Child */}
        {!isOnlyAdultTicket(ticket) && (
          <div className="flex justify-between items-center mt-8 xs:flex-col xs:mt-6">
            <p className="text-blue-color font-bold text-sm xs:mb-2">子ども1人</p>
            <div className="text-center">
              <p className="font-semibold text-[20px]">{formatCurrency(+ticket.TicketDetail.childPrice)}</p>
            </div>
          </div>
        )}

        {/* Child */}
        {
          ticket.TicketDetail.enableDiscount && (ticket.TicketDiscountSetting?.setting as DiscountSettingItem[])?.length > 0 && (
            (ticket.TicketDiscountSetting.setting as DiscountSettingItem[]).map((discountSetting, index) => (
              <div key={index} className="flex justify-between items-center mt-8 xs:flex-col xs:mt-6">
                <p className="text-blue-color font-bold text-sm xs:mb-2">子ども{Number(discountSetting.threshold)}人</p>
                <div className="text-center">
                  <p className="font-semibold text-[20px]">
                    {formatCurrency(Number(ticket.TicketDetail.childPrice) - Number(discountSetting.childDiscountAmount))}</p>
                </div>
              </div>
            ))
          )
        }
      </div>
    );
  };

  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[540px] xsup:w-full mx-auto xs:mx-5">
      <div className="flex flex-col items-center gap-[10px] justify-center pt-[20px] px-[20px] pb-[40px] xs:pb-[20px]">
        <div className="flex max-w-[600px] w-full flex-row items-start justify-end ">
          <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
        </div>

        <DialogContent className="px-20 w-full xs:px-4">
          <div>
            <h3 className="text-[24px] leading-[28px] text-center font-semibold text-color xs:text-xl">{ticket.name}</h3>
            {isOnlineMonthlyTicket(ticket) && renderMonthlyTicketPrice(ticket)}
            {!isOnlineMonthlyTicket(ticket) && renderHourlyOrDailyTicketPrice(ticket)}
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
