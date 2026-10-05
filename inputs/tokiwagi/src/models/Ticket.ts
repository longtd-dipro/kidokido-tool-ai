import { PaymentType, PriceUnit, TicketType } from "@prisma/client";

import { AgeUnit } from "models/enums";
import { DiscountSettingItem, HourlyExtraTimeDiscountSetting } from "models/Discount";

export type HourlyTimesLimitTicketAdditionalInfo = {
  baseAdultPeriod: number;
  baseAdultPeriodUnit: PriceUnit;
  baseAdultPeriodPrice: number;
  baseAdultSmaregiQRCodeUrl: string;
  baseChildPeriod: number;
  baseChildPeriodUnit: PriceUnit;
  baseChildPeriodPrice: number;
  baseChildSmaregiQRCodeUrl: string;

  extendedAdultPeriod: number;
  extendedAdultPeriodUnit: PriceUnit;
  extendedAdultPeriodPrice: number;
  extendedAdultSmaregiQRCodeUrl: string;
  extendedChildPeriod: number;
  extendedChildPeriodUnit: PriceUnit;
  extendedChildPeriodPrice: number;
  extendedChildSmaregiQRCodeUrl: string;
}

export type TicketFormData = HourlyTimesLimitTicketAdditionalInfo & {
  name: string;
  tenantCode: string | any;
  slaveTenantCodes: string[] | any;

  adultTicketCode: number | any;
  childTicketCode: number | any;

  limitTimes: number | any;
  extraTimes: number | any;

  enableExpirationRemind?: boolean | string;
  expirationRemindBeforeInDay?: number;
  expirationRemindAt?: Date | string;

  visibility: boolean | string;
  displayOrder: number | any;

  childAgeLimitFrom: number | any;
  childAgeLimitTo: number | any;
  childAgeLimitFromUnit: AgeUnit;
  childAgeLimitToUnit: AgeUnit;

  maxChildPerAdult: number | any;

  paymentType: PaymentType | string;
  canBookInAdvance: boolean | string;
  type: string;
  timesLimitType: string;

  videoUrl: string | any;

  totalDaysInUseFromStart: number;
  adultPrice: number;
  adultSmaregiQRCodeUrl: string;
  adultObicCode?: string;
  adultSmaregiQRCodeUrl1stBooking: string;
  adultObicCode1stBooking?: string;
  childPrice: number;
  childSmaregiQRCodeUrl: string;
  childObicCode?: string;
  childSmaregiQRCodeUrl1stBooking: string;
  childObicCode1stBooking?: string;
  startSaleAt: Date | string;
  endSaleAt: Date | string;

  enableDiscount: string | boolean;
  discountSettings: DiscountSettingItem[];
  enableHourlyExtraTimeDiscount: string | boolean;
  hourlyExtraTimeDiscountSettings: DiscountSettingItem[];
  discountAdultSmaregiQRCodeUrl?: string;
  discountAdultObicCode?: string;
  discountChildSmaregiQRCodeUrl?: string;
  discountChildObicCode?: string;

  requiredAgreement: string | boolean;

  cancelOrChangeAvailableUtil: Date | string;

  id?: number;
  masterTicketId?: number;
};

export type TicketDetailPayload = {
  totalDaysInUseFromStart?: number;
  adultPrice?: number;
  adultSmaregiQRCodeUrl?: string;
  adultObicCode?: string;
  adultSmaregiQRCodeUrl1stBooking?: string;
  adultObicCode1stBooking?: string;
  childPrice?: number;
  childSmaregiQRCodeUrl?: string;
  childObicCode?: string;
  childSmaregiQRCodeUrl1stBooking?: string;
  childObicCode1stBooking?: string;

  enableDiscount: boolean;

  requiredAgreement: boolean;

  startSaleAt: Date | string;
  endSaleAt: Date | string;

  limitTimes?: number;
  extraTimes?: number;

  discountAdultSmaregiQRCodeUrl?: string;
  discountAdultObicCode?: string;
  discountChildSmaregiQRCodeUrl?: string;
  discountChildObicCode?: string;
};

export type TicketPayload = HourlyTimesLimitTicketAdditionalInfo & {
  name: string;
  tenantCode: string;
  slaveTenantCodes: string[];

  adultTicketCode: number;
  childTicketCode: number;

  visibility: boolean | string;

  childAgeLimitFrom: number;
  childAgeLimitTo: number;

  maxChildPerAdult: number;

  paymentType: PaymentType | string;
  canBookInAdvance: boolean | string;
  type: TicketType | string;

  videoUrl?: string;

  TicketDetail?: TicketDetailPayload;

  TicketDiscountSetting?: {
    setting?: DiscountSettingItem[];
    hourlyExtraTimeSetting?: HourlyExtraTimeDiscountSetting;
  }

  id?: number;
  masterTicketId?: number;

  enableExpirationRemind?: boolean | string;
  expirationRemindBeforeInDay?: number;
  expirationRemindAt?: Date | string;
};

export type FrameFormData = {
  startSaleAt: Date | string;
  dateFrom: Date | string;
  dateTo: Date | string;
  timeFrom: Date | string;
  timeTo: Date | string;

  canBookingBeforeInDay: number;
  canBookingFrom: Date | string;
  canBookingUtil: Date | string;
  canCancelOrChangeBeforeInDay: number;
  canCancelOrChangeUtil: Date | string;

  maxBookingPeople: number;
  maxBookingPeopleAccumulative: boolean;
  invisibleWhenReachedMaxBookingPeople?: boolean;
  maxBookingTimes: number | string;

  enableRemind: boolean | string;
  remindBeforeInDay?: number;
  remindAt?: Date | string;

  baseAdultPeriod: number | any;
  baseAdultPeriodUnit: PriceUnit;
  baseAdultPeriodPrice: number | any;
  baseAdultSmaregiQRCodeUrl?: string | File;
  baseAdultObicCode?: string;
  baseChildPeriod: number | any;
  baseChildPeriodUnit: PriceUnit;
  baseChildPeriodPrice: number | any;
  baseChildSmaregiQRCodeUrl?: string | File;
  baseChildObicCode?: string;

  extendedAdultPeriod?: number | any;
  extendedAdultPeriodUnit?: PriceUnit;
  extendedAdultPeriodPrice?: number | any;
  extendedAdultSmaregiQRCodeUrl?: string | File;
  extendedAdultObicCode?: string;
  extendedChildPeriod?: number | any;
  extendedChildPeriodUnit?: PriceUnit;
  extendedChildPeriodPrice?: number | any;
  extendedChildSmaregiQRCodeUrl?: string | File;
  extendedChildObicCode?: string;

  ticketType?: TicketType;
  ticketId?: number;

  isLimitMaxBookingPeople: boolean | string;
  shouldImmediatelyValidate?: boolean;
  isValidRangeDate?: boolean;
};
