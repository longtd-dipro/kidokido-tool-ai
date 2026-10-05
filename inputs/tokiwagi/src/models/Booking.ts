import { PriceUnit } from "@prisma/client";

import { AgeUnit } from "models/enums";
import { Booking } from "models/Entity";

export type ChildAgeItem = {
  age: number;
  unit: AgeUnit;
};

export type BookingPayload = {
  tenantCode: string;
  ticketId: number;

  date: string;
  childAges: number[];
  subEmail: string;

  adultQuantity: number;
  childQuantity: number;
  adultPrice: number;
  childPrice: number;

  totalAmount?: number;
  cardSeq?: string;
  rememberCard?: boolean;

  parentBookingId?: number;
  isWaiting?: boolean;
  mainBookingId?: number;

  bookingDays?: number;
};

export enum BookingStep {
  InputBooking,
  ShowGuideVideo,
  CheckDisclaimerTerms,
  InputCreditCard,
  Confirmation,
  Completion,
}

export type UserCreditCard = {
  CardName: string;
  CardNo: string;
  CardSeq: string;
  Expire: string;
  HolderName: string;
  ErrInfo?: string;
  ErrCode?: string;
};

export type CreditCardFormData = {
  cardNumber: string;
  holderName: string;
  expiredAt: Date;
  securityCode: number;

  hasCreditCard?: boolean;
  rememberCard?: boolean;
};

export type Coupon = {
  code: string;
  name: string;
  discountAmount: number;
};

export type TicketVacancies = {
  maxBookingPeople?: number;
  ticketBookingScheduleId?: number;
  totalPeople: number;
  checkedInPeople: number;
  waitingPeople: number;
  type: string;
  name: string;
  id: number;
  accessiblePeople?: number;
};

export type BookingVacancy = {
  date: string;
  totalMaxBookingPeople: number;
  totalPeople: number;
  checkedInPeople: number;
  waitingPeople: number;
  tickets: TicketVacancies[];
  totalAccessiblePeople?: number;
};

export type BookingQueueWaitingPayload = {
  ticketId: string;
  ticketName: string;
  waitingBookings: Booking[];
};

export type BookingQueueCallingPayload = {
  ticketId: string;
  ticketName: string;
  callingBookings: Booking[];
};

export type OneDayBookings = {
  [barCode: string]: {
    oneDayMonthlyBookingId: number;
    bookings: Booking[];
  };
};

export type DisclaimerTermCheckboxGroupFormData = {
  title: string;
  options: { content: string; value: boolean }[];
};

export type BookingQuantityFormData = {
  adultQuantity: number;
  childQuantity: number;
  childAges: { id: number; childAgeInMonth: number; isChecked?: boolean }[];
};

export type PriceInfo = {
  basePeriod: number;
  basePeriodUnit: PriceUnit;
  basePeriodPrice: number;

  extendedPeriod?: number;
  extendedPeriodUnit?: PriceUnit;
  extendedPeriodPrice?: number;
};

export type BookingSmaregiQRCodeInfo = {
  adult: { qrUrl: string, amount: number }[];
  child: { qrUrl: string, amount: number }[];
}

export type SmaregiQRCodes = {
  base: BookingSmaregiQRCodeInfo;

  extendedPeriod?: BookingSmaregiQRCodeInfo;

  discount?: BookingSmaregiQRCodeInfo;

  hourlyExtraTimeDiscount?: BookingSmaregiQRCodeInfo;
}

export type ObicCodeEntry = {
  obicCode: string;
  amount: number;
  sourceField: string;
  sourceTierIndex?: number;
};

export type ObicCodeInfo = {
  adult: ObicCodeEntry[];
  child: ObicCodeEntry[];
};

export type ObicCodes = {
  base: ObicCodeInfo;
  extendedPeriod?: ObicCodeInfo;
  discount?: ObicCodeInfo;
  hourlyExtraTimeDiscount?: ObicCodeInfo;
};