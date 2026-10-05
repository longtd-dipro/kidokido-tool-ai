import { PaymentType, PriceUnit, TicketType } from "@prisma/client";

import { AgeUnit } from "models/enums";

export const PROMOTION_TICKET_TYPE_NAME = "招待券タイプ";
export const TIMES_LIMIT_TICKET_TYPE_NAME = "回数券タイプ";

export const PAYMENT_TYPE_OPTIONS = [
  { value: PaymentType.Offline, label: "退場時に精算" },
  { value: PaymentType.Online, label: "事前決済あり" },
];

export const TIMES_LIMIT_PAYMENT_TYPE_OPTIONS = [
  { value: PaymentType.Offline, label: "退場時に精算", disabled: true },
  { value: PaymentType.Online, label: "事前決済あり" },
];

export const TICKET_TYPE_OPTIONS = [
  { value: TicketType.Hourly, label: "時間制タイプ" },
  { value: TicketType.Daily, label: "ワンデータイプ" },
  { value: TicketType.Monthly, label: "指定期間利用タイプ" },
  { value: TicketType.MasterMonthly, label: "指定期間利用のマスタータイプ" },
  { value: PROMOTION_TICKET_TYPE_NAME, label: PROMOTION_TICKET_TYPE_NAME },
  { value: TIMES_LIMIT_TICKET_TYPE_NAME, label: TIMES_LIMIT_TICKET_TYPE_NAME },
];

export const TIMES_LIMIT_TICKET_TYPE_OPTIONS = [
  { value: TicketType.DailyTimesLimit, label: "ワンデーパス" },
  { value: TicketType.HourlyTimesLimit, label: "時間制" },
];

export const VISIBILITY_OPTIONS = [
  { value: true, label: "公開" },
  { value: false, label: "非公開" },
];

export const YES_NO_OPTIONS = [
  { value: true, label: "あり" },
  { value: false, label: "なし" },
];

export const SETTING_BOOKING_IN_ADVANCE_OPTIONS = [
  { value: true, label: "事前予約可能" },
  { value: false, label: "当日利用のみ" },
];

export const TIMES_LIMIT_SETTING_BOOKING_IN_ADVANCE_OPTIONS = [
  { value: false, label: "事前予約可能", disabled: true },
  { value: true, label: "当日利用のみ" },
];

export const MAX_BOOKING_TIMES_OPTIONS = [
  { value: 1, label: "一回" },
  { value: 0, label: "回数制限なし" },
];

export const PRICE_UNIT_OPTIONS = [
  { value: PriceUnit.Day, label: "日間" },
  { value: PriceUnit.Hour, label: "時間" },
  { value: PriceUnit.Minute, label: "分間" },
];

export const BEFORE_ONE_OR_ZERO_DAY_OPTIONS = [
  { value: 0, label: "利用日の当日" },
  { value: 1, label: "利用日の前日" },
];

export const AGE_UNIT_OPTIONS = [
  { value: AgeUnit.Month, label: "ヶ月" },
  { value: AgeUnit.Year, label: "歳" },
];

export const MONTHLY_YEARLY_THRESHOLD = 33;

export const INPUT_PRICE_UNIT_OPTIONS = PRICE_UNIT_OPTIONS.filter((option) => option.value !== PriceUnit.Hour);

export const GROUP_TICKET_TYPES: TicketType[] = [TicketType.Monthly, TicketType.MasterMonthly, TicketType.DailyTimesLimit, TicketType.HourlyTimesLimit];