/* eslint-disable @next/next/no-img-element */
import { TicketBookingSchedule, TicketType } from "@prisma/client";

import { Ticket } from "models/Entity";
import { PRICE_UNIT_OPTIONS } from "constants/ticket";
import { isMonthlyTicket, isTimesLimitTicket } from "utils/booking";

interface Props {
  ticket: Ticket;
  ticketBookingSchedule: TicketBookingSchedule;
  isEnabledSmaregi: boolean;
}

function findPriceUnitLabel(unit: string): string {
  return PRICE_UNIT_OPTIONS.find(({ value }) => value === unit).label;
}

export default function GroupTicketPrice({ ticket, ticketBookingSchedule, isEnabledSmaregi }: Props) {
  return (
    <>
      {Boolean(isMonthlyTicket(ticket.type) || isTimesLimitTicket(ticket.type)) && (
        <div className="flex w-full mb-2">
          {ticket.type === TicketType.HourlyTimesLimit ? (
            <>
              {Boolean(ticketBookingSchedule?.baseAdultPeriodUnit) && (
                <>
                  <p className="w-1/3">ベース利用時間</p>
                  <div className="font-bold mdonly:pl-8">
                    <span>
                      子ども: {+ticketBookingSchedule.baseChildPeriodPrice}{" "}
                      円 /{+ticketBookingSchedule.baseChildPeriod}
                      {findPriceUnitLabel(ticketBookingSchedule.baseChildPeriodUnit)}
                    </span>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <p className="w-1/3">指定期間利用販売金額</p>
              <div className="font-bold mdonly:pl-8 flex-1 flex flex-col gap-3 min-w-0">
                {Boolean(ticket.type !== TicketType.DailyTimesLimit) && (
                  <div className="flex flex-nowrap gap-x-4 items-center min-w-0">
                    <span className="block whitespace-nowrap w-[140px] shrink-0">
                      おとな: {+ticket.TicketDetail.adultPrice} 円
                    </span>
                    {Boolean(isEnabledSmaregi && ticket.TicketDetail.adultSmaregiQRCodeUrl) && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-medium whitespace-nowrap w-[180px]">
                          決済バーコード:
                        </span>
                        <img
                          className="w-[220px] h-[150px] object-contain"
                          src={ticket.TicketDetail.adultSmaregiQRCodeUrl as string}
                          alt="Adult Smaregi QR Code"
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-nowrap gap-x-4 items-center min-w-0">
                  <span className="block whitespace-nowrap w-[140px] shrink-0">
                    子ども: {+ticket.TicketDetail.childPrice} 円
                  </span>
                  {isEnabledSmaregi && (
                    <div>
                      {ticket.TicketDetail.childSmaregiQRCodeUrl1stBooking && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-medium whitespace-nowrap w-[180px]">
                            決済バーコード（初回）：
                          </span>
                          <img
                            className="w-[220px] h-[150px] object-contain"
                            src={ticket.TicketDetail.childSmaregiQRCodeUrl1stBooking as string}
                            alt="Child Smaregi QR Code"
                          />
                        </div>
                      )}
                      {ticket.TicketDetail.childSmaregiQRCodeUrl && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-medium whitespace-nowrap w-[180px]">
                            決済バーコード（2回目以降）：
                          </span>
                          <img
                            className="w-[220px] h-[150px] object-contain"
                            src={ticket.TicketDetail.childSmaregiQRCodeUrl as string}
                            alt="Child Smaregi QR Code"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {Boolean(ticket.type === TicketType.HourlyTimesLimit && ticketBookingSchedule?.extendedChildPeriodUnit) && (
        <div className="flex w-full">
          <p className="w-1/3 mdonly:min-w-[206px]">単日利用パス販売金額</p>
          <div className="flex font-bold w-2/3">
            <div className="min-w-[400px] mdonly:min-w-[200px]">
              <p>延長金額時間</p>
              <div>
                <span>
                  子ども: {+ticketBookingSchedule.extendedChildPeriodPrice} 円
                  / {+ticketBookingSchedule.extendedChildPeriod}
                  {findPriceUnitLabel(ticketBookingSchedule.extendedChildPeriodUnit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
