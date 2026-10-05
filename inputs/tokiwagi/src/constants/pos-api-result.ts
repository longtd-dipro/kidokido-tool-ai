export const POS_API_RESULT_CODE = {
  E00000000: "E00000000",
  E00000400: "E00000400",
  E00000401: "E00000401",
  E00000500: "E00000500",
};

export const POS_API_ERROR_MESSAGE = {
  API_KEY_NOT_FOUND: "Not found api key",
  INVALID_API_KEY: "Invalid api key",

  BAR_CODE_IS_REQUIRED: "Barcode field is required",
  INVALID_BAR_CODE: "This barcode is invalid",
  INVALID_DATE_BAR_CODE: "This barcode is invalid date",
  INVALID_STATUS_BAR_CODE: "This barcode is invalid status",
  INVALID_PAYMENT_BAR_CODE: "This barcode is invalid payment",
  ALREADY_USED_BAR_CODE: "This barcode has been already used",

  INVALID_DATE_TIME_FORMAT: "Invalid date time format",
  INVALID_PAY_TIME_AT: "Invalid pay time",
  PAY_TIME_AT_IS_REQUIRED: "payTimeAt field is required",

  BOOKING_HAS_NOT_CHECKED_IN: "This booking has not checked in yet",
  BOOKING_HAS_NOT_CHECKED_OUT: "This booking has not checked out yet",
};
