import moment from "moment";
import { TicketType } from "@prisma/client";

import { Ticket } from "models/Entity";
import {
  PAYMENT_TYPE_OPTIONS,
  SETTING_BOOKING_IN_ADVANCE_OPTIONS,
  VISIBILITY_OPTIONS,
  YES_NO_OPTIONS,
} from "constants/ticket";
import { MAX_LENGTH_TICKET_CODE, SHORT_TIME } from "constants/common";
import { getAgeLabel, getTicketTypeLabel } from "utils/ticket";
import {
  DiscountSettingItem,
  HourlyExtraTimeDiscountSetting,
} from "models/Discount";
import {
  isEnableDiscountTicket,
  isEnableExtraTimeDiscountHourlyTicket,
} from "utils/discount";
import { isMasterMonthlyTicket, isTimesLimitTicket } from "utils/booking";
import { useSmaregiEnabled } from "libs/hooks/useSmaregiEnabled";

import styles from "./index.module.scss";
import BookingScheduleRow from "./components/BookingScheduleRow";
import DiscountSetting from "./components/DiscountSetting";
import GroupTicketPrice from "./components/GroupTicketPrice";

interface Props {
  ticket: Ticket;
}

export default function ViewTicket({ ticket }: Props) {
  const ticketBookingSchedule = ticket.TicketBookingSchedule?.[0];
  const { isEnabledSmaregi } = useSmaregiEnabled(ticket?.tenantCode);

  const sortedSchedules = [...ticket.TicketBookingSchedule].sort(
    (a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime(),
  );

  return (
    <div className={styles.detail}>
      <div className="flex flex-col items-center justify-center w-4/5 mdonly:w-4/5 mx-auto">
        <h1 className="text-xl font-bold">商品詳細</h1>
        <div className="w-full mt-4 font-medium">
          <h2 className={`${styles.heading} pb-2 text-xl`}>商品の基本情報</h2>
          <div className="mx-4 my-8">
            <div className="flex w-full">
              <p className="w-1/3">商品名</p>
              <p className="font-bold mdonly:pl-8 flex-1 break-all">
                {ticket.name}
              </p>
            </div>
            <div className="flex w-full">
              <p className="w-1/3">商品のタイプ</p>
              <p className="font-bold mdonly:pl-8">
                {getTicketTypeLabel(ticket)}
              </p>
            </div>
            <div className="flex w-full">
              <p className="w-1/3">施設名</p>
              <p className="font-bold mdonly:pl-8 flex-1 break-all">
                {isMasterMonthlyTicket(ticket)
                  ? ticket.slaveTickets?.map((slaveTicket, index) => (
                    <p
                      key={slaveTicket.Tenant.code}
                      className={
                        index === ticket.slaveTickets.length - 1
                          ? "!mb-0"
                          : "!mb-2"
                      }
                    >
                      {slaveTicket.Tenant.name}
                    </p>
                  ))
                  : ticket.Tenant.name}
              </p>
            </div>
            {isTimesLimitTicket(ticket.type) && (
              <>
                <div className="flex w-full">
                  <p className="w-1/3">支払い回数</p>
                  <p className="font-bold mdonly:pl-8">
                    {ticket.TicketDetail.limitTimes}
                  </p>
                </div>
                <div className="flex w-full">
                  <p className="w-1/3">特典付き回数</p>
                  <p className="font-bold mdonly:pl-8">
                    {ticket.TicketDetail.extraTimes}
                  </p>
                </div>
                {ticketBookingSchedule.enableExpirationRemind && (
                  <div className="flex w-full">
                    <p className="w-1/3">利用期間終了リマインダ</p>
                    <div className="flex font-bold mdonly:pl-8">
                      <p className="min-w-[400px] mdonly:min-w-[200px]">
                        開催日 :{" "}
                        {ticketBookingSchedule.expirationRemindBeforeInDay}
                      </p>
                      <p>
                        日前の:{" "}
                        {moment(
                          ticketBookingSchedule.expirationRemindAt,
                        ).format(SHORT_TIME)}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="flex w-full">
              <p className="w-1/3">公開ステータス</p>
              <p className="font-bold mdonly:pl-8">
                {
                  VISIBILITY_OPTIONS.find(
                    (item) => item.value === ticket.visibility,
                  ).label
                }
              </p>
            </div>
            <div className="flex w-full">
              <p className="w-1/3">商品順番設定</p>
              <p className="font-bold mdonly:pl-8">{ticket.displayOrder}</p>
            </div>
            <div className="flex w-full">
              <p className="w-1/3">対象年齢</p>
              <p className="font-bold mdonly:pl-8">{`${getAgeLabel(ticket.childAgeLimitFrom)} ~ ${getAgeLabel(ticket.childAgeLimitTo)}`}</p>
            </div>
            <div className="flex w-full">
              <p className="w-1/3">1組の予約構成</p>
              <p className="font-bold mdonly:pl-8">{`1おとな、${ticket.maxChildPerAdult}子ども`}</p>
            </div>
            <div className="flex w-full">
              <p className="w-1/3">おとなの商品コード</p>
              <p className="font-bold mdonly:pl-8">
                {ticket.adultTicketCode &&
                  ticket.adultTicketCode
                    .toString()
                    .padStart(MAX_LENGTH_TICKET_CODE, "0")}
              </p>
            </div>
            <div className="flex w-full">
              <p className="w-1/3">子どもの商品コード</p>
              <p className="font-bold mdonly:pl-8">
                {ticket.childTicketCode &&
                  ticket.childTicketCode
                    .toString()
                    .padStart(MAX_LENGTH_TICKET_CODE, "0")}
              </p>
            </div>
            <div className="flex w-full">
              <p className="w-1/3">精算タイプ</p>
              <p className="font-bold mdonly:pl-8">
                {
                  PAYMENT_TYPE_OPTIONS.find(
                    (item) => item.value === ticket.paymentType,
                  ).label
                }
              </p>
            </div>
            <div className="flex w-full">
              <p className="w-1/3">事前予約設定</p>
              <p className="font-bold mdonly:pl-8">
                {
                  SETTING_BOOKING_IN_ADVANCE_OPTIONS.find(
                    (item) => item.value === ticket.canBookInAdvance,
                  ).label
                }
              </p>
            </div>

            <GroupTicketPrice
              ticket={ticket}
              ticketBookingSchedule={ticketBookingSchedule}
              isEnabledSmaregi={isEnabledSmaregi}
            />

            <div className="flex w-full mb-2">
              <p className="w-1/3">
                {ticket.type === TicketType.Hourly
                  ? "ベース金額の割引"
                  : "割引"}
              </p>
              <div className="font-bold mdonly:pl-8 w-2/3">
                <p>
                  {
                    YES_NO_OPTIONS.find(
                      (item) =>
                        item.value === !!ticket.TicketDetail.enableDiscount,
                    ).label
                  }
                </p>
                {isEnableDiscountTicket(ticket) && (
                  <DiscountSetting
                    items={
                      ticket.TicketDiscountSetting
                        ?.setting as DiscountSettingItem[]
                    }
                    isEnabledSmaregi={isEnabledSmaregi}
                  />
                )}
              </div>
            </div>

            {ticket.type === TicketType.Hourly && (
              <div className="flex w-full mb-2">
                <p className="w-1/3">延長金額の割引</p>
                <div className="font-bold mdonly:pl-8 w-2/3">
                  <p>
                    {
                      YES_NO_OPTIONS.find(
                        (item) =>
                          item.value ===
                          !!(
                            ticket.TicketDiscountSetting
                              ?.hourlyExtraTimeSetting as HourlyExtraTimeDiscountSetting
                          )?.enable,
                      ).label
                    }
                  </p>
                  {isEnableExtraTimeDiscountHourlyTicket(ticket) && (
                    <DiscountSetting
                      items={
                        (
                          ticket.TicketDiscountSetting
                            .hourlyExtraTimeSetting as HourlyExtraTimeDiscountSetting
                        ).setting as DiscountSettingItem[]
                      }
                      isEnabledSmaregi={isEnabledSmaregi}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="flex w-full">
              <p className="w-1/3">遊び方の案内 (動画)</p>
              <p className="w-2/3 font-bold mdonly:pl-8 break-all">
                {ticket.videoUrl}
              </p>
            </div>
          </div>
        </div>

        {!isMasterMonthlyTicket(ticket) && (
          <div className="w-full mt-4 mb-4 font-medium">
            <h2 className={`${styles.heading} pb-2 text-xl`}>
              在庫・予約枠の日付、場所、定員の詳細
            </h2>
            {sortedSchedules.map((item) => (
              <BookingScheduleRow
                key={item.id}
                item={item}
                ticketType={ticket.type}
                isEnabledSmaregi={isEnabledSmaregi}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
