export enum AgeUnit {
  Month,
  Year,
}

export enum FormStep {
  S1_UPDATE,
  S10_CANNOT_UPDATE,

  S2_REVIEW,
  S20_REFUND_CONFIRM,

  S3_PAYMENT,
  S4_CONFIRM,
  S5_COMPLETED,
}

export enum VACANCY_STATUS_ICON {
  X,
  O,
  Hyphen,
}

export enum ActivityType {
  SearchUser = "search-user",
  DownloadUser = "download-user",
  SearchBooking = "search-booking",
  DownloadBooking = "download-booking",
  SearchRevenue = "search-revenue",
  DownloadRevenue = "download-revenue",
}

export enum ActionType {
  Search,
  Download,
}

export enum RevenueStatus {
  ALREADY_RECHECKIN = "already-recheckin",
  NOT_RECHECKIN = "not-recheckin",
  NOT_USED = "not-used",
}