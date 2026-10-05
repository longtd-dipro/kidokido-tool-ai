import { Grid } from "@mui/material";
import React, { Fragment } from "react";
import moment from "moment";
import { TicketBookingSchedule, TicketType } from "@prisma/client";

import { Ticket } from "models/Entity";
import { SHORT_DATE } from "constants/common";
import { getAgeLabel, getTicketBookingSchedule } from "utils/ticket";
import { PRICE_UNIT_OPTIONS } from "constants/ticket";
import { formatCurrency } from "utils/number";
import { formatBasePeriod } from "utils/date-time";
import { DiscountSettingItem } from "models/Discount";
import { isEnableDiscountTicket } from "utils/discount";
import { isTimesLimitTicket } from "utils/booking";

import styles from "./index.module.scss";

type Props = {
  tickets: Ticket[];
  title: string;
};

export default function PriceTicket({ tickets, title }: Props) {
  const renderHourlyOrDailyTicketPrice = (bookingSchedule: TicketBookingSchedule, ticketType: TicketType, isOnlyAdultTicket: boolean) => {
    const isOnlyChildTicket = isTimesLimitTicket(ticketType);
    return (
      <Grid container xs={5}>
        {
          !isOnlyAdultTicket &&
            (
              <Grid item xs={isOnlyChildTicket ? 12 : 6}>
                <div className="w-full h-full border-r-2 border-b-2 border-dotted border-[#979797] flex flex-col items-center">
                  <div className="pt-4 pb-4">
                    <div className="grow md:text-sm md:font-medium font-bold text-sm text-[#0068B7] text-center">子ども</div>
                    <div className="grow md:text-sm md:font-medium font-medium text-xl text-center mt-[10px]">
                      {formatCurrency(+bookingSchedule.baseChildPeriodPrice)}
                    </div>
                    {([TicketType.Hourly, TicketType.HourlyTimesLimit] as string[]).includes(ticketType) && (
                      <span className="text-center block xs:text-xs md:text-xs break-all">
                    (最初の{formatBasePeriod(+bookingSchedule.baseChildPeriod, bookingSchedule.baseChildPeriodUnit, ticketType)})
                      </span>
                    )}
                    {+bookingSchedule.extendedChildPeriod && +bookingSchedule.extendedChildPeriodPrice !== 0 ? (
                      <div className="grow md:text-sm md:font-medium font-light text-xs text-center mt-[10px]">
                    ※延長{+bookingSchedule.extendedChildPeriod}
                        {PRICE_UNIT_OPTIONS.find(({ value }) => value === bookingSchedule.extendedChildPeriodUnit)?.label || ""}ごとに
                        {formatCurrency(+bookingSchedule.extendedChildPeriodPrice)}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </Grid>
            )
        }
        {
          !isOnlyChildTicket && (
            <Grid item xs={isOnlyAdultTicket ? 12 : 6}>
              <div className="w-full h-full border-r-2 border-b-2 border-dotted border-[#979797] flex flex-col items-center">
                <div className="pt-4 pb-4">
                  <div className="grow md:text-sm md:font-medium font-bold text-sm text-[#0068B7] text-center">おとな</div>
                  <div className="grow md:text-sm md:font-medium font-medium text-xl text-center mt-[10px]">
                    {formatCurrency(+bookingSchedule.baseAdultPeriodPrice)}
                  </div>
                  {([TicketType.Hourly, TicketType.HourlyTimesLimit] as string[]).includes(ticketType) && (
                    <span className="text-center block xs:text-xs md:text-xs break-all">
                      {bookingSchedule.baseAdultPeriodUnit !== "Day" ? (
                        <Fragment>(最初の{formatBasePeriod(+bookingSchedule.baseAdultPeriod, bookingSchedule.baseAdultPeriodUnit, ticketType)})</Fragment>
                      ) : (
                        ""
                      )}
                    </span>
                  )}
                  {+bookingSchedule.extendedAdultPeriod && +bookingSchedule.extendedAdultPeriodPrice !== 0 ? (
                    <div className="grow md:text-sm md:font-medium font-light text-xs text-center mt-[10px]">
                  ※延長{+bookingSchedule.extendedAdultPeriod}
                      {PRICE_UNIT_OPTIONS.find(({ value }) => value === bookingSchedule.extendedAdultPeriodUnit)?.label || ""}ごとに
                      {formatCurrency(+bookingSchedule.extendedAdultPeriodPrice)}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </Grid>
          )
        }
      </Grid>
    );
  };

  const renderMonthlyTicketPrices = (ticket: Ticket) => {
    return (
      <Grid container xs={5}>
        <Grid item xs={12}>
          <div className="w-full h-full border-r-2 border-b-2 border-dotted border-[#979797] py-[30px]">
            <div className="grow md:text-sm md:font-medium font-bold text-sm text-[#0068B7] text-center">子ども1人</div>
            <div className="grow md:text-sm md:font-medium font-medium text-xl text-center mt-[10px] flex gap-3 justify-center">
              <span>{formatCurrency(+ticket.TicketDetail.childPrice)}</span>
            </div>
          </div>
        </Grid>

        {isEnableDiscountTicket(ticket) && (
          <Grid item xs={12}>
            <div className="w-full h-full border-r-2 border-b-2 border-dotted border-[#979797] py-[30px]">
              {(ticket.TicketDiscountSetting.setting as DiscountSettingItem[]).map((setting, index) => {
                return (
                  <div key={index}>
                    <div className="grow md:text-sm md:font-medium font-bold text-sm text-[#0068B7] text-center">
                      子ども{setting.threshold}人目
                    </div>
                    <div className="grow md:text-sm md:font-medium font-medium text-xl text-center mt-[10px] flex gap-3 justify-center">
                      <span>{formatCurrency(Math.max(0, +ticket.TicketDetail.childPrice - +setting.childDiscountAmount))}</span>
                    </div>
                  </div>
                );
              })}

            </div>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <>
      <div className={"mt-7 rounded-xl"}>
        {/* Heading */}
        {tickets.length > 0 && <div className={`${styles.heading} py-[18px] text-center font-medium text-xl mdonly:text-xl}`}>{title}</div>}
        <div className="">
          {tickets.map((ticket) => {
            const currentDate = moment().utc(true).format(SHORT_DATE);
            const bookingSchedule = getTicketBookingSchedule(currentDate, ticket);
            const isOnlyAdultTicket = ticket.maxChildPerAdult === 0;

            return (
              <>
                <Grid container spacing={0} key={ticket.id}>
                  {/* Ticket */}
                  <Grid item xs={3.5}>
                    <div
                      className="text-xl font-bold w-full h-full border-r-2 border-b-2 border-l-2
                border-dotted border-[#979797] pt-[30px] px-[30px] mdonly:pt-5 mdonly:px-[10px] pb-3"
                    >
                      <span className="mdonly:text-lg break-words">{ticket.name}</span>
                    </div>
                  </Grid>

                  {/* Content */}
                  <Grid item xs={3.5}>
                    <div
                      className={`text-xl w-full h-full border-r-2 border-b-2 border-dotted border-[#979797] pt-[30px] px-[30px] 
                      mdonly:pt-5 mdonly:px-[10px] pb-6`}
                    >
                      <div className="flex gap-x-6  md:gap-x-2 text-xl">
                        <div className="flex flex-col gap-y-6 md:gap-y-5 md:w-full md:justify-evenly">
                          {isOnlyAdultTicket ? null : <span className="text-lg font-bold md:text-xs">対象年齢</span>}
                        </div>

                        <div className="flex flex-col gap-y-6 md:gap-y-5 md:w-full md:justify-evenly">
                          {isOnlyAdultTicket ? null : (
                            <span className="text-lg md:text-xs">
                              {getAgeLabel(ticket.childAgeLimitFrom)}~{getAgeLabel(ticket.childAgeLimitTo)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Grid>

                  {/* Price */}
                  <>
                    {([TicketType.Monthly] as string[]).includes(ticket.type) ? 
                      renderMonthlyTicketPrices(ticket): 
                      renderHourlyOrDailyTicketPrice({
                        ...bookingSchedule,
                        ...(ticket.type === TicketType.DailyTimesLimit && {
                          baseChildPeriodPrice: ticket.TicketDetail.childPrice,
                          baseAdultPeriodPrice: ticket.TicketDetail.adultPrice
                        })
                      }, ticket.type, isOnlyAdultTicket)}
                  </>
                </Grid>
              </>
            );
          })}
        </div>
      </div>
    </>
  );
}
