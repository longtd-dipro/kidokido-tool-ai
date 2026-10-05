import { Grid } from "@mui/material";
import React, { Fragment } from "react";
import { TicketBookingSchedule, TicketType } from "@prisma/client";
import moment from "moment";

import { Ticket } from "models/Entity";
import { formatCurrency } from "utils/number";
import { getAgeLabel, getTicketBookingSchedule } from "utils/ticket";
import { SHORT_DATE } from "constants/common";
import { PRICE_UNIT_OPTIONS } from "constants/ticket";
import { formatBasePeriod } from "utils/date-time";
import { isEnableDiscountTicket } from "utils/discount";
import { DiscountSettingItem } from "models/Discount";

type Props = {
  tickets: Ticket[];
  title: string;
};

export default function PriceTicketMobile({ tickets, title }: Props) {
  const renderHourlyOrDailyTicketPrice = (bookingSchedule: TicketBookingSchedule, ticketType: TicketType, isOnlyAdultTicket: boolean) => {
    return (
      <Grid item xs={9}>
        <div className="w-full h-full border-r-2 border-b-2 border-dotted border-[#979797]">
          {isOnlyAdultTicket ? null : (
            <div className="border-b-2 border-dotted border-[#979797] pl-5 py-[10px]">
              <div className="flex gap-[10px] items-center">
                <div className="font-bold text-sm text-[#0068B7]">子ども</div>
                <div className="font-medium text-xl">{formatCurrency(+bookingSchedule.baseChildPeriodPrice)}</div>
              </div>
              {ticketType === TicketType.Hourly && (
                <span className="block xs:text-xs md:text-xs break-all">
                  (最初の{formatBasePeriod(+bookingSchedule.baseChildPeriod, bookingSchedule.baseChildPeriodUnit, ticketType)})
                </span>
              )}
              {+bookingSchedule.extendedChildPeriod && +bookingSchedule.extendedChildPeriodPrice !== 0 ? (
                <div className="font-light text-xs">
                  ※延長{+bookingSchedule.extendedChildPeriod}
                  {PRICE_UNIT_OPTIONS.find(({ value }) => value === bookingSchedule.extendedChildPeriodUnit)?.label || ""}ごとに
                  {formatCurrency(+bookingSchedule.extendedChildPeriodPrice)}
                </div>
              ) : (
                ""
              )}
            </div>
          )}

          <div>
            <div className="pl-5 py-[10px]">
              <div className="flex gap-[10px] items-center">
                <div className="font-bold text-sm text-[#0068B7]">おとな</div>
                <div className="font-medium text-xl">{formatCurrency(+bookingSchedule.baseAdultPeriodPrice)}</div>
              </div>
              {ticketType === TicketType.Hourly && (
                <span className="block xs:text-xs md:text-xs break-all">
                  {bookingSchedule.baseAdultPeriodUnit !== "Day" ? (
                    <Fragment>(最初の{formatBasePeriod(+bookingSchedule.baseAdultPeriod, bookingSchedule.baseAdultPeriodUnit, ticketType)})</Fragment>
                  ) : (
                    ""
                  )}
                </span>
              )}
              {+bookingSchedule.extendedAdultPeriodPrice && +bookingSchedule.extendedAdultPeriodPrice !== 0 ? (
                <div className="font-light text-xs">
                  ※延長{+bookingSchedule.extendedAdultPeriod}
                  {PRICE_UNIT_OPTIONS.find(({ value }) => value === bookingSchedule.extendedAdultPeriodUnit)?.label || ""}ごとに
                  {formatCurrency(+bookingSchedule.extendedAdultPeriodPrice)}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </Grid>
    );
  };

  const renderMonthlyTicketPrices = (ticket: Ticket) => {
    return (
      <Grid item xs={9}>
        {/* Content Ticket */}
        <div className="w-full h-full border-r-2 border-b-2 border-dotted border-[#979797]">
          <div className="border-b-2 border-dotted border-[#979797] pl-5 py-[10px]">
            <div className="flex gap-[10px] items-center">
              <div className="font-bold text-sm text-[#0068B7]">子ども1人</div>
              <div className="font-medium text-xl">{formatCurrency(+ticket.TicketDetail.childPrice)}</div>
            </div>
          </div>

          {isEnableDiscountTicket(ticket) && (
            <div>
              {(ticket.TicketDiscountSetting.setting as DiscountSettingItem[]).map((setting, index) => {
                return (
                  <div key={index}>
                    <div className="flex gap-[10px] items-center pl-5 py-[10px]">
                      <div className="font-bold text-sm text-[#0068B7]">子ども{setting.threshold}人目</div>
                      <div className="font-medium text-xl">
                        {formatCurrency(Math.max(0, +ticket.TicketDetail.childPrice - +setting.childDiscountAmount))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Grid>
    );
  };

  return (
    <>
      <div className="px-5">
        <div className="bg-blue text-white py-1 rounded-t-[3px] mb-4">
          <h2 className="font-bold text-center">{title}</h2>
        </div>
        {tickets.map((ticket) => {
          const currentDate = moment().utc(true).format(SHORT_DATE);
          const bookingSchedule = getTicketBookingSchedule(currentDate, ticket);
          const isOnlyAdultTicket = ticket.maxChildPerAdult === 0;

          return (
            <>
              <div className="rounded-xl mb-6">
                {/* Heading */}
                <Grid item xs={12}>
                  <div
                    className="text-base font-bold w-full border-b-2 bg-[#F3FAFF] py-[5px] text-center 
                border-dotted border-[#979797]"
                  >
                    <span className="">{ticket.name}</span>
                  </div>
                </Grid>

                <div className="flex flex-col">
                  {/* Content */}
                  <Grid container spacing={0}>
                    <Grid item xs={3}>
                      <div
                        className="text-xs font-bold w-full h-full border-b-2 py-[5px] pt-5 text-center border-l-2 border-r-2
                border-dotted border-[#979797]"
                      >
                        <span className="">パス内容</span>
                      </div>
                    </Grid>

                    <Grid item xs={9}>
                      <div
                        className={`text-xl w-full h-full border-r-2 border-b-2 border-dotted border-[#979797] pt-5 px-[20px] 
                      pb-3`}
                      >
                        <div className="flex gap-x-8">
                          <div className="flex flex-col gap-y-4">{isOnlyAdultTicket ? null : <span className="text-sm font-medium ">対象年齢</span>}</div>

                          <div className="flex flex-col gap-y-4">
                            {isOnlyAdultTicket ? null : (
                              <span className="text-sm">
                                {getAgeLabel(ticket.childAgeLimitFrom)}~{getAgeLabel(ticket.childAgeLimitTo)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Grid>
                  </Grid>

                  {/* Price */}
                  <Grid container spacing={0}>
                    <Grid item xs={3}>
                      <div
                        className="text-xs font-bold w-full h-full border-b-2 py-[5px] pt-5 pl-5 border-l-2 border-r-2
                border-dotted border-[#979797]"
                      >
                        <span className="">価格</span>
                      </div>
                    </Grid>

                    {ticket.type === TicketType.Monthly && renderMonthlyTicketPrices(ticket)}
                    {ticket.type !== TicketType.Monthly && renderHourlyOrDailyTicketPrice(bookingSchedule, ticket.type, isOnlyAdultTicket)}
                  </Grid>
                </div>
              </div>
            </>
          );
        })}
      </div>
    </>
  );
}
