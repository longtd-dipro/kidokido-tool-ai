import moment from "moment";
import { TicketBookingSchedule, TicketType } from "@prisma/client";

import { JP_SHORT_DATE, SHORT_TIME } from "constants/common";
import { BEFORE_ONE_OR_ZERO_DAY_OPTIONS, MAX_BOOKING_TIMES_OPTIONS } from "constants/ticket";
import { isMonthlyTicket, isTimesLimitTicket } from "utils/booking";

import BookingSchedulePrice from "./BookingSchedulePrice";

interface Props {
  item: TicketBookingSchedule;
  ticketType: TicketType;
  isEnabledSmaregi: boolean;
}

export default function BookingScheduleRow({ item, ticketType, isEnabledSmaregi }: Props) {
  return (
    <div className="mx-4 my-8">
      <div className="flex w-full">
        <p className="w-1/3">公開日設定</p>
        <p className="font-bold mdonly:pl-8">{moment(item.startSaleAt).format(JP_SHORT_DATE)}</p>
      </div>
      <div className="flex w-full">
        <p className="w-1/3">開催日程</p>
        <p className="font-bold mdonly:pl-8">
          {moment(item.dateFrom).format(JP_SHORT_DATE)} ~{" "}
          {moment(item.dateTo).format(JP_SHORT_DATE)}
        </p>
      </div>
      <div className="flex w-full">
        <p className="w-1/3">〆切日付</p>
        <p className="font-bold mdonly:pl-8">{moment(item.canBookingUtil).format(SHORT_TIME)}</p>
        <p className="ml-6 font-bold">
          {BEFORE_ONE_OR_ZERO_DAY_OPTIONS.find(({ value }) => value === item.canBookingBeforeInDay).label}
        </p>
      </div>
      <div className="flex w-full">
        <p className="w-1/3">キャンセル・変更可能期間</p>
        <p className="font-bold mdonly:pl-8">{moment(item.canCancelOrChangeUtil).format(SHORT_TIME)}</p>
        <p className="ml-6 font-bold">
          {BEFORE_ONE_OR_ZERO_DAY_OPTIONS.find(({ value }) => value === item.canCancelOrChangeBeforeInDay).label}
        </p>
      </div>
      <div className="flex w-full">
        <p className="w-1/3">予約できる回数</p>
        <p className="font-bold mdonly:pl-8">
          {MAX_BOOKING_TIMES_OPTIONS.find(({ value }) => value === item.maxBookingTimes).label}
        </p>
      </div>
      <div className="flex w-full">
        <p className="w-1/3">指定人数設定</p>
        <p className="font-bold mdonly:pl-8">
          {item.maxBookingPeople ? `${item.maxBookingPeople} 人` : "予約日の当日"}
        </p>
      </div>
      {Boolean(!isMonthlyTicket(ticketType) && !isTimesLimitTicket(ticketType) && item.baseChildPeriodPrice) && (
        <div className="flex w-full">
          <p className="w-1/3 mdonly:min-w-[206px]">単日利用パス販売金額</p>
          <BookingSchedulePrice item={item} isEnabledSmaregi={isEnabledSmaregi} />
        </div>
      )}
      {item.enableRemind && (
        <div className="flex w-full mt-2">
          <p className="w-1/3">予約リマインド</p>
          <div className="flex font-bold mdonly:pl-8">
            <p className="min-w-[400px] mdonly:min-w-[200px]">開催日 : {item.remindBeforeInDay}</p>
            <p>日前の: {moment(item.remindAt).format(SHORT_TIME)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
