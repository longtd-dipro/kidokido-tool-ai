export type CsvHeader = {
  label: string;
  key: string;
};

export const FILE_SIZE = {
  "B": 1,
  "KB": 1024,
  "MB": 1024 * 1024,
  "GB": 1024 * 1024 * 1024
};

export type FILE_SIZE_UNIT = keyof typeof FILE_SIZE;

export enum ExportingBookingRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  STAFF = "STAFF",
}

export enum ExportingRevenueRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  GUEST = "GUEST",
}

export enum SourcePage {
  PRICE_LIST = "price-list",
}