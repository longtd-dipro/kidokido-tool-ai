import { PaymentType, TicketType } from "@prisma/client";
import * as yup from "yup";
import { isNil } from "lodash";

import { MESSAGES } from "constants/messages";
import { AgeUnit } from "models/enums";
import { isAfterTime, isSameOrAfterDay } from "utils/date-time";
import { isMonthlyTicket, isTimesLimitTicket } from "utils/booking";

export const ticketFormDataSchema = yup.object().shape({
  name: yup.string().required(MESSAGES.TICKET_NAME_IS_REQUIRED),
  tenantCode: yup.mixed().when("type", {
    is: ((type: string) => type != TicketType.MasterMonthly),
    then: yup.mixed()
      .transform((value) => value?.code)
      .required(MESSAGES.TICKET_TENANT_IS_REQUIRED),
  }),
  limitTimes: yup.mixed().when("type", {
    is: ((type: string) => isTimesLimitTicket(type)),
    then: yup.number()
      .typeError(MESSAGES.TICKET_LIMIT_TIMES_IS_REQUIRED)
      .test("is-number", MESSAGES.TICKET_LIMIT_TIMES_IS_REQUIRED, (value) => {
        const numValue = Number(value);
        return !isNaN(numValue) && isFinite(numValue);
      })
      .required(MESSAGES.TICKET_LIMIT_TIMES_IS_REQUIRED),
  }),

  enableExpirationRemind: yup.mixed<boolean | string>(),
  expirationRemindBeforeInDay: yup
    .number()
    .nullable()
    .when("enableExpirationRemind", {
      is: "true",
      then: yup
        .number()
        .min(1, MESSAGES.MIN_NUMBER_IS_ONE)
        .typeError(MESSAGES.TICKET_REMIND_BEFORE_IS_REQUIRED)
        .required(MESSAGES.TICKET_REMIND_BEFORE_IS_REQUIRED),
    }),
  expirationRemindAt: yup
    .date()
    .nullable()
    .when("enableExpirationRemind", {
      is: "true",
      then: yup.date().typeError("時刻の形式が正しく入力してください").required(MESSAGES.TICKET_REMIND_AT_IS_REQUIRED),
    }),

  slaveTenantCodes: yup
    .array().when("type", {
      is: TicketType.MasterMonthly,
      then: yup.array()
        .transform((value) => {
          return value?.map(item => item.code);
        })
        .min(1, MESSAGES.TICKET_TENANT_IS_REQUIRED)
        .required(MESSAGES.TICKET_TENANT_IS_REQUIRED),
    }),

  videoUrl: yup
    .mixed()
    .required("遊び方の案内（動画）をアップロードしてください")
    .test("max size 300MB", "300MB以下の動画をアップロードしてください", (value) => {
      if (value?.size) {
        const MAXIMUM = 300; // MB
        const fileSize = value.size * 0.000001; // MB
        return fileSize < MAXIMUM;
      }
      return true;
    }),

  visibility: yup.boolean().typeError(MESSAGES.TICKET_VISIBILITY_IS_REQUIRED).required(MESSAGES.TICKET_VISIBILITY_IS_REQUIRED),
  displayOrder: yup
    .number()
    .nullable()
    .transform(emptyStringToNull)
    .test("is-greater-than-0", "1以上の半角英数字を入力してください", (value) => value >= 1 || (value as any) === "" || isNil(value)),

  childAgeLimitFrom: yup.mixed().when("childAgeLimitFromUnit", {
    is: AgeUnit.Month,
    then: yup
      .number()
      .min(1, MESSAGES.MIN_NUMBER_IS_ONE)
      .max(11, "最大11月齢を入力してください")
      .typeError(MESSAGES.TICKET_CHILD_AGE_IS_REQUIRED)
      .nullable()
      .required(MESSAGES.TICKET_CHILD_AGE_IS_REQUIRED),
    otherwise: yup
      .number()
      .min(1, MESSAGES.MIN_NUMBER_IS_ONE)
      .max(12, "最大12年齢を入力してください")
      .typeError(MESSAGES.TICKET_CHILD_AGE_IS_REQUIRED)
      .nullable()
      .required(MESSAGES.TICKET_CHILD_AGE_IS_REQUIRED),
  }),
  childAgeLimitTo: yup.mixed().when("childAgeLimitToUnit", {
    is: AgeUnit.Month,
    then: yup
      .number()
      .min(1, MESSAGES.MIN_NUMBER_IS_ONE)
      .max(11, "最大11月齢を入力してください")
      .typeError(MESSAGES.TICKET_CHILD_AGE_IS_REQUIRED)
      .nullable()
      .required(MESSAGES.TICKET_CHILD_AGE_IS_REQUIRED),
    otherwise: yup
      .number()
      .min(1, MESSAGES.MIN_NUMBER_IS_ONE)
      .max(12, "最大12年齢を入力してください")
      .typeError(MESSAGES.TICKET_CHILD_AGE_IS_REQUIRED)
      .nullable()
      .required(MESSAGES.TICKET_CHILD_AGE_IS_REQUIRED),
  }),
  childAgeLimitFromUnit: yup.mixed<AgeUnit>().required(),
  childAgeLimitToUnit: yup.mixed<AgeUnit>().required(),

  adultTicketCode: yup
    .string()
    .typeError(MESSAGES.TICKET_ADULT_CODE_IS_REQUIRED)
    .nullable()
    .test("len", MESSAGES.TICKET_CODE_FORMAT, (val) => {
      if (val == undefined) {
        return true;
      }
      return val.length == 0 || (val.length >= 1 && val.length <= 9999);
    })
    .required(MESSAGES.TICKET_ADULT_CODE_IS_REQUIRED),
  childTicketCode: yup
    .string()
    .typeError(MESSAGES.TICKET_CHILD_CODE_IS_REQUIRED)
    .nullable()
    .test("len", MESSAGES.TICKET_CODE_FORMAT, (val) => {
      if (val == undefined) {
        return true;
      }
      return val.length == 0 || (val.length >= 1 && val.length <= 9999);
    })
    .required(MESSAGES.TICKET_CHILD_CODE_IS_REQUIRED),

  maxChildPerAdult: yup
    .number()
    .min(0, MESSAGES.MIN_NUMBER_IS_ZERO)
    .typeError(MESSAGES.TICKET_MAX_CHILD_PER_ADULT_IS_REQUIRED)
    .nullable()
    .required(MESSAGES.TICKET_MAX_CHILD_PER_ADULT_IS_REQUIRED),

  paymentType: yup
    .mixed<PaymentType>()
    .required(MESSAGES.TICKET_PAYMENT_TYPE_IS_REQUIRED)
    .test("is-required", MESSAGES.TICKET_PAYMENT_TYPE_IS_REQUIRED, (value) => !!value),
  canBookInAdvance: yup
    .boolean()
    .typeError(MESSAGES.TICKET_CAN_BOOK_IN_ADVANCE_IS_REQUIRED)
    .nullable()
    .required(MESSAGES.TICKET_CAN_BOOK_IN_ADVANCE_IS_REQUIRED),
  type: yup
    .mixed<TicketType>()
    .required(MESSAGES.TICKET_TYPE_IS_REQUIRED)
    .test("is-required", MESSAGES.TICKET_TYPE_IS_REQUIRED, (value) => !!value),

  requiredAgreement: yup.boolean().typeError(MESSAGES.TICKET_AGREEMENT_IS_REQUIRED).nullable().required(MESSAGES.TICKET_AGREEMENT_IS_REQUIRED),

  totalDaysInUseFromStart: yup
    .mixed()
    .nullable()
    .when("type", {
      is: isMonthlyTicket,
      then: yup
        .number()
        .min(1, MESSAGES.MIN_NUMBER_IS_ONE)
        .test("check-number", "整数で入力してください。", checkOnlyNumber)
        .typeError(MESSAGES.TICKET_TOTAL_DAYS_IN_USE_IS_REQUIRED)
        .required(MESSAGES.TICKET_TOTAL_DAYS_IN_USE_IS_REQUIRED),
    })
    .when("type", {
      is: isTimesLimitTicket,
      then: yup
        .number()
        .min(1, MESSAGES.MIN_NUMBER_IS_ONE)
        .max(60, MESSAGES.MAX_NUMBER_IS_60)
        .test("check-number", "整数で入力してください。", checkOnlyNumber)
        .typeError(MESSAGES.TIMES_LIMIT_TICKET_TOTAL_DAYS_IN_USE_IS_REQUIRED)
        .required(MESSAGES.TIMES_LIMIT_TICKET_TOTAL_DAYS_IN_USE_IS_REQUIRED),
    }),
  startSaleAt: yup
    .mixed()
    .nullable()
    .when("type", {
      is: (type) => (isMonthlyTicket(type) || isTimesLimitTicket(type)),
      then: yup.date().nullable().typeError("日付形式が正しく入力してください"),
    }),
  endSaleAt: yup
    .mixed()
    .nullable()
    .when("type", {
      is: (type) => (isMonthlyTicket(type) || isTimesLimitTicket(type)),
      then: yup
        .date()
        .nullable()
        .typeError("日付形式が正しく入力してください")
        .test("is-before-start-sale-at", MESSAGES.TICKET_DATE_TO_AFTER_DATE_FROM, (value, context) => {
          const startSaleAt = context.parent.startSaleAt;
          return startSaleAt && value ? isSameOrAfterDay(value, startSaleAt) : true;
        }),
    }),
  adultPrice: yup
    .mixed()
    .nullable()
    .when("type", {
      is: isMonthlyTicket,
      then: yup
        .number()
        .min(0, "0以上の半角英数字を入力してください")
        .typeError(MESSAGES.TICKET_PRICE_IS_REQUIRED)
        .nullable()
        .required(MESSAGES.TICKET_PRICE_IS_REQUIRED),
    }),
  childPrice: yup
    .mixed()
    .nullable()
    .when(["type", "timesLimitType"], {
      is: (type, timesLimitType) => (isMonthlyTicket(type) || timesLimitType == TicketType.DailyTimesLimit),
      then: yup
        .number()
        .min(0, "0以上の半角英数字を入力してください")
        .typeError(MESSAGES.TICKET_PRICE_IS_REQUIRED)
        .nullable()
        .required(MESSAGES.TICKET_PRICE_IS_REQUIRED),
    }),

  // start hourly time limit price validation 
  baseChildPeriod: yup
    .number()
    .nullable()
    .when("timesLimitType", {
      is: (timesLimitType) => timesLimitType !== TicketType.HourlyTimesLimit,
      then: yup.number().transform(emptyStringToNull).nullable(),
      otherwise: yup
        .number()
        .min(0, "0以上の半角英数字を入力してください")
        .typeError(MESSAGES.TICKET_CHILD_PERIOD_IS_REQUIRED)
        .nullable()
        .required(MESSAGES.TICKET_CHILD_PERIOD_IS_REQUIRED),
    }),
  baseChildPeriodPrice: yup
    .number()
    .nullable()
    .when("timesLimitType", {
      is: (timesLimitType) => timesLimitType !== TicketType.HourlyTimesLimit,
      then: yup.number().transform(emptyStringToNull).nullable(),
      otherwise: yup
        .number()
        .min(0, "0以上の半角英数字を入力してください")
        .typeError(MESSAGES.TICKET_CHILD_PERIOD_PRICE_IS_REQUIRED)
        .nullable()
        .required(MESSAGES.TICKET_CHILD_PERIOD_PRICE_IS_REQUIRED),
    }),
  baseChildPeriodUnit: yup.string().nullable(),

  extendedChildPeriod: yup
    .mixed()
    .nullable()
    .test("is-negative", "0以上の半角英数字を入力してください", (value) => value >= 0 || value === "" || isNil(value)),

  extendedChildPeriodPrice: yup
    .mixed()
    .nullable()
    .test("is-negative", "0以上の半角英数字を入力してください", (value) => value >= 0 || value === "" || isNil(value)),

  extendedChildPriceUnit: yup.mixed().nullable(),
  // end hourly time limit price validation 

  adultObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),
  adultObicCode1stBooking: yup.string().nullable().max(255, "255文字以内で入力してください"),
  childObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),
  childObicCode1stBooking: yup.string().nullable().max(255, "255文字以内で入力してください"),
  discountAdultObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),
  discountChildObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),

  enableDiscount: yup.boolean().nullable(),
  discountSettings: yup.mixed().when("enableDiscount", {
    is: true,
    then: yup.array().nullable().of(
      yup.object().shape({
        isSkipValidateEmpty: yup.boolean().default(true),
        threshold: yup.number(),
        adultDiscountAmount: yup.number()
          .min(0, "0以上の半角英数字を入力してください")
          .typeError("おとなの割引金額を設定してください")
          .nullable()
          .required("おとなの割引金額を設定してください"),
        adultSmaregiQRCodeUrl: yup.mixed().nullable(),
        adultObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),
        childDiscountAmount: yup.number()
          .min(0, "0以上の半角英数字を入力してください")
          .typeError("子どもの割引金額を設定してください")
          .nullable()
          .required("子どもの割引金額を設定してください"),
        childSmaregiQRCodeUrl: yup.mixed().nullable(),
        childObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),
      })
    )
  }),
  enableHourlyExtraTimeDiscount: yup.mixed().nullable().when("type", {
    is: TicketType.Hourly,
    then: yup.boolean().nullable()
  }),
  hourlyExtraTimeDiscountSettings: yup.mixed().when(["type", "enableHourlyExtraTimeDiscount"], {
    is: (type, enableHourlyExtraTimeDiscount) => [TicketType.Hourly, TicketType.HourlyTimesLimit].includes(type) && enableHourlyExtraTimeDiscount === true,
    then: yup.array().nullable().of(
      yup.object().shape({
        isSkipValidateEmpty: yup.boolean().default(true),
        threshold: yup.number(),
        adultDiscountAmount: yup.number()
          .min(0, "0以上の半角英数字を入力してください")
          .typeError("おとなの割引金額を設定してください")
          .nullable()
          .required("おとなの割引金額を設定してください"),
        adultSmaregiQRCodeUrl: yup.mixed().nullable(),
        adultObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),
        childDiscountAmount: yup.number()
          .min(0, "0以上の半角英数字を入力してください")
          .typeError("子どもの割引金額を設定してください")
          .nullable()
          .required("子どもの割引金額を設定してください"),
        childSmaregiQRCodeUrl: yup.mixed().nullable(),
        childObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),
      })
    )
  }),

});

export const ticketJsonDataSchema = yup.object().shape({
  name: yup.string().required(),
  type: yup.mixed<TicketType>().required(),
  tenantCode: yup.mixed().when("type", {
    is: ((type: string) => type != TicketType.MasterMonthly),
    then: yup.mixed()
      .required(MESSAGES.TICKET_TENANT_IS_REQUIRED),
  }),
  slaveTenantCodes: yup
    .array().when("type", {
      is: TicketType.MasterMonthly,
      then: yup.array()
        .transform((value) => {
          return value?.map(item => item.code);
        })
        .min(1, MESSAGES.TICKET_TENANT_IS_REQUIRED)
        .required(MESSAGES.TICKET_TENANT_IS_REQUIRED),
    }),
  visibility: yup.boolean(),
  displayOrder: yup
    .number()
    .nullable()
    .transform(emptyStringToNull)
    .test("is-greater-than-0", "1以上の半角英数字を入力してください", (value) => value >= 1 || (value as any) === "" || isNil(value)),

  childAgeLimitFrom: yup.number().required(),
  childAgeLimitTo: yup.number().required(),

  adultTicketCode: yup
    .string()
    .typeError(MESSAGES.TICKET_ADULT_CODE_IS_REQUIRED)
    .nullable()
    .test("len", MESSAGES.TICKET_CODE_FORMAT, (val) => {
      if (val == undefined) {
        return true;
      }
      return val.length == 0 || (val.length >= 1 && val.length <= 9999);
    })
    .required(MESSAGES.TICKET_ADULT_CODE_IS_REQUIRED),
  childTicketCode: yup
    .string()
    .typeError(MESSAGES.TICKET_CHILD_CODE_IS_REQUIRED)
    .nullable()
    .test("len", MESSAGES.TICKET_CODE_FORMAT, (val) => {
      if (val == undefined) {
        return true;
      }
      return val.length == 0 || (val.length >= 1 && val.length <= 9999);
    })
    .required(MESSAGES.TICKET_CHILD_CODE_IS_REQUIRED),

  maxChildPerAdult: yup.number().required(),

  paymentType: yup.mixed<PaymentType>().required(),
  canBookInAdvance: yup.boolean().required(),

  TicketDetail: yup.object().shape({
    totalDaysInUseFromStart: yup.number().nullable(),
    adultPrice: yup.number().nullable(),
    childPrice: yup.number().nullable(),

    enableDiscount: yup.string().nullable(),
    requiredAgreement: yup.boolean().nullable(),

    limitTimes: yup.number().nullable(),
    extraTimes: yup.number().nullable(),
  }),

  TicketDiscountSetting: yup.object().nullable().shape({
    setting: yup.array().nullable(),
    hourlyExtraTimeSetting: yup.object().nullable(),
  }),
});

export const ticketBookingFrameSchema = yup.object().shape({
  startSaleAt: yup.date().nullable().typeError("日付形式が正しく入力してください").required(MESSAGES.TICKET_START_SALE_AT_IS_REQUIRED),
  dateFrom: yup
    .date()
    .nullable()
    .typeError("日付形式が正しく入力してください")
    .required(MESSAGES.TICKET_DATE_FROM_TO_IS_REQUIRED)
    .test("is-before-date-start-sale", MESSAGES.TICKET_DATE_FROM_AFTER_START_SALE, (value, context) => {
      const startSaleAt = context.parent.startSaleAt;
      return isSameOrAfterDay(value, startSaleAt);
    }),

  dateTo: yup
    .date()
    .nullable()
    .typeError("日付形式が正しく入力してください")
    .required(MESSAGES.TICKET_DATE_FROM_TO_IS_REQUIRED)
    .test("is-before-date-from", MESSAGES.TICKET_DATE_TO_AFTER_DATE_FROM, (value, context) => {
      const dateFrom = context.parent.dateFrom;
      return isSameOrAfterDay(value, dateFrom);
    }),

  canBookingBeforeInDay: yup.number().required(),
  canBookingFrom: yup.date().nullable().required("販売開始時間を設定してください").typeError("日付形式が正しく入力してください"),
  canBookingUtil: yup
    .date()
    .nullable()
    .required(MESSAGES.TICKET_CAN_BOOKING_UTIL_IS_REQUIRED)
    .typeError("日付形式が正しく入力してください")
    .test("is-before-can-book-from", "販売〆切時間は販売開始時間より後の時間を設定してください", (value, context) => {
      const canBookingFrom = context.parent.canBookingFrom;
      if (!canBookingFrom) {
        return true;
      }
      return isAfterTime(value, canBookingFrom);
    }),
  canCancelOrChangeBeforeInDay: yup.number().required(),
  canCancelOrChangeUtil: yup.date().nullable().required(MESSAGES.TICKET_CAN_CANCEL_OR_CHANGE_UTIL_IS_REQUIRED).typeError("日付形式が正しく入力してください"),

  isLimitMaxBookingPeople: yup
    .boolean()
    .typeError(MESSAGES.TICKET_WHETHER_OR_NOT_SETTING_MAX_BOOKING_PEOPLE_IS_REQUIRED)
    .required(MESSAGES.TICKET_WHETHER_OR_NOT_SETTING_MAX_BOOKING_PEOPLE_IS_REQUIRED),
  maxBookingPeople: yup
    .mixed()
    .nullable()
    .when("isLimitMaxBookingPeople", {
      is: true,
      then: yup
        .number()
        .min(0, "0以上の半角英数字を入力してください")
        .typeError(MESSAGES.TICKET_MAX_BOOKING_PEOPLE_IS_REQUIRED)
        .required(MESSAGES.TICKET_MAX_BOOKING_PEOPLE_IS_REQUIRED),
    }),

  maxBookingTimes: yup.number().typeError(MESSAGES.TICKET_MAX_BOOKING_TIMES_IS_REQUIRED).nullable().required(MESSAGES.TICKET_MAX_BOOKING_TIMES_IS_REQUIRED),

  enableRemind: yup.mixed<boolean | string>(),
  remindBeforeInDay: yup
    .number()
    .nullable()
    .when("enableRemind", {
      is: "true",
      then: yup
        .number()
        .min(1, MESSAGES.MIN_NUMBER_IS_ONE)
        .typeError(MESSAGES.TICKET_REMIND_BEFORE_IS_REQUIRED)
        .required(MESSAGES.TICKET_REMIND_BEFORE_IS_REQUIRED),
    }),
  remindAt: yup
    .date()
    .nullable()
    .when("enableRemind", {
      is: "true",
      then: yup.date().typeError("時刻の形式が正しく入力してください").required(MESSAGES.TICKET_REMIND_AT_IS_REQUIRED),
    }),

  baseAdultPeriod: yup
    .number()
    .nullable()
    .when("ticketType", {
      is: (type) => isMonthlyTicket(type) || isTimesLimitTicket(type),
      then: yup.number().transform(emptyStringToNull).nullable(),
      otherwise: yup
        .number()
        .min(0, "0以上の半角英数字を入力してください")
        .typeError(MESSAGES.TICKET_ADULT_PERIOD_IS_REQUIRED)
        .nullable()
        .required(MESSAGES.TICKET_ADULT_PERIOD_IS_REQUIRED),
    }),
  baseChildPeriod: yup
    .number()
    .nullable()
    .when("ticketType", {
      is: (type) => isMonthlyTicket(type) || isTimesLimitTicket(type),
      then: yup.number().transform(emptyStringToNull).nullable(),
      otherwise: yup
        .number()
        .min(0, "0以上の半角英数字を入力してください")
        .typeError(MESSAGES.TICKET_CHILD_PERIOD_IS_REQUIRED)
        .nullable()
        .required(MESSAGES.TICKET_CHILD_PERIOD_IS_REQUIRED),
    }),
  baseAdultPeriodPrice: yup
    .number()
    .nullable()
    .when("ticketType", {
      is: (type) => isMonthlyTicket(type) || isTimesLimitTicket(type),
      then: yup.number().transform(emptyStringToNull).nullable(),
      otherwise: yup
        .number()
        .min(0, "0以上の半角英数字を入力してください")
        .typeError(MESSAGES.TICKET_ADULT_PERIOD_PRICE_IS_REQUIRED)
        .nullable()
        .required(MESSAGES.TICKET_ADULT_PERIOD_PRICE_IS_REQUIRED),
    }),
  baseChildPeriodPrice: yup
    .number()
    .nullable()
    .when("ticketType", {
      is: (type) => isMonthlyTicket(type) || isTimesLimitTicket(type),
      then: yup.number().transform(emptyStringToNull).nullable(),
      otherwise: yup
        .number()
        .min(0, "0以上の半角英数字を入力してください")
        .typeError(MESSAGES.TICKET_CHILD_PERIOD_PRICE_IS_REQUIRED)
        .nullable()
        .required(MESSAGES.TICKET_CHILD_PERIOD_PRICE_IS_REQUIRED),
    }),
  baseAdultPeriodUnit: yup.string().nullable(),
  baseChildPeriodUnit: yup.string().nullable(),

  extendedAdultPeriod: yup
    .mixed()
    .nullable()
    .test("is-negative", "0以上の半角英数字を入力してください", (value) => value >= 0 || value === "" || isNil(value)),
  extendedChildPeriod: yup
    .mixed()
    .nullable()
    .test("is-negative", "0以上の半角英数字を入力してください", (value) => value >= 0 || value === "" || isNil(value)),
  extendedAdultPeriodPrice: yup
    .mixed()
    .nullable()
    .test("is-negative", "0以上の半角英数字を入力してください", (value) => value >= 0 || value === "" || isNil(value)),

  extendedChildPeriodPrice: yup
    .mixed()
    .nullable()
    .test("is-negative", "0以上の半角英数字を入力してください", (value) => value >= 0 || value === "" || isNil(value)),

  extendedAdultPeriodUnit: yup.mixed().nullable(),
  extendedChildPriceUnit: yup.mixed().nullable(),

  baseAdultObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),
  baseChildObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),
  extendedAdultObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),
  extendedChildObicCode: yup.string().nullable().max(255, "255文字以内で入力してください"),
});

export const ticketBookingFramesJsonSchema = yup.array().of(ticketBookingFrameSchema.omit(["isLimitMaxBookingPeople", "canBookingFrom"]));

function emptyStringToNull(value, originalValue) {
  if (typeof originalValue === "string" && originalValue === "") {
    return null;
  }
  return value;
}

function checkOnlyNumber(value) {
  if (value) {
    const ONLY_NUMBER_REGEX = /^[0-9]+$/;
    const cleanedNumber = `${value}`.replace(/,/g, "");
    return ONLY_NUMBER_REGEX.test(cleanedNumber);
  }
  return true;
}
