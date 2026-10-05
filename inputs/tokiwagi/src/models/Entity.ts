import {
  Tenant as PrismaTenant,
  User as PrismaUser,
  AdminTenant as PrismaAdminTenant,
  Ticket as PrismaTicket,
  TicketDetail as PrismaTicketDetail,
  TicketDiscountSetting as PrismaTicketDiscountSetting,
  TicketBookingSchedule as PrismaTicketBookingSchedule,
  Booking as PrismaBooking,
  UserTenantFavorite as PrismaUserTenantFavorite,
  BookingChildAgeInfo as PrismaBookingChildAgeInfo,
  Disclaimer as PrismaDisclaimer,
  DisclaimerOption,
  PartialCheckout as PrismaPartialCheckout,
  BookingChildAgeInfo,
  GMOSetting as PrismaGMOSetting,
  Staff as PrismaStaff,
} from "@prisma/client";

export type Tenant = PrismaTenant & {
  AdminTenant?: AdminTenant;
  GMOSetting?: PrismaGMOSetting;
};

export type AdminTenant = PrismaAdminTenant & {
  User?: PrismaUser;
  Tenant?: PrismaTenant;
};

export type Ticket = PrismaTicket & {
  TicketDetail?: PrismaTicketDetail;
  TicketDiscountSetting?: PrismaTicketDiscountSetting;
  TicketBookingSchedule?: PrismaTicketBookingSchedule[];
  Tenant?: Tenant;
  slaveTickets?: Ticket[];
  hasBooking?: boolean;
  slaveTenants?: Tenant[];
};

export type Booking = PrismaBooking & {
  Ticket?: Ticket;
  Tenant?: Tenant;
  User?: PrismaUser;
  BookingChildAgeInfo?: PrismaBookingChildAgeInfo[];
  TicketBookingSchedule?: PrismaTicketBookingSchedule;
  waitingTime?: number;
  waitingDuration?: string;
  PartialCheckout?: PartialCheckout[];
  deadlineDate?: Date;
  usageTimes?: number;
  usageBookings?: Partial<Booking>[];
  extendedPrices?: {
    child?: [];
    parent?: [];
  };
  formattedTotalAmount?: string;
  smaregiTransactionBarcode?: string;
};

export type User = PrismaUser & {
  Booking?: Booking[];
  UserTenantFavorite?: UserTenantFavorite[];
};

export type UserTenantFavorite = PrismaUserTenantFavorite & {
  User?: PrismaUser;
  Tenant?: PrismaTenant;
};

export type Disclaimer = PrismaDisclaimer & {
  DisclaimerOption?: DisclaimerOption[];
};

export type PartialCheckout = PrismaPartialCheckout & {
  BookingChildAgeInfo?: BookingChildAgeInfo;
};

export type GMOSetting = PrismaGMOSetting & {
  Tenant?: Tenant[];
};

export type Staff = PrismaStaff & {
  Tenant?: Tenant;
};
