export const ROUTE = {
  INDEX: "/",
  MAINTENANCE: "/maintenance",

  SIGN_IN: "/signin",
  SIGN_UP: "/signup",
  SIGN_OUT: "/api/auth/signout",
  SIGN_UP_SUCCESS: "/signup-success",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD_SUCCESS: "/reset-password/success",
  FORBIDDEN: "/403",

  BOOKING_SUCCESS: "/booking-success",
  USE_IN_DAY_BOOKING: "/booking/use-in-day",
  TERMS_OF_USE: "/terms-of-use",
  COMMERCIAL_LAW: "/commercial-law",
  PRIVACY_POLICY: "/privacy-policy",

  BOOKING_PAYMENT_ONLINE: "/booking/payment-online",
  BUY_MONTHLY_TICKET: "/booking/buy-monthly-ticket",
  BUY_TIMES_LIMIT_TICKET: "/booking/buy-times-limit-ticket",

  BOOKING_PAYMENT_ONLINE_SUCCESS: "/booking/payment-online-success",
  BUY_MONTHLY_TICKET_SUCCESS: "/booking/payment-online-monthly-ticket-success",
  BOOKING_PAYMENT_ONLINE_FAILURE: "/booking/payment-online-failure",

  PRICE_LIST: "/price-list",
  VACANCY_STATUS: "/vacancy-status",

  // USER
  USER_MY_PAGE: "/user/my-page",
  USER_HISTORY_BOOKINGS: "/user/my-page/booking-history",
  USER_HISTORY_BOOKINGS_DETAIL: "/user/my-page/booking-history/[id]",
  USER_HISTORY_BOOKINGS_DETAIL_UPDATE: "/user/my-page/booking-history/update/[id]",
  USER_HISTORY_BOOKINGS_DETAIL_UPDATE_COMPLETED: "/user/my-page/booking-history/update/completed",

  USER_MONTHLY_TICKET: "/user/my-page/monthly-ticket-status",
  USER_TIMES_LIMIT_TICKET: "/user/my-page/times-limit-ticket-status",

  USER_CHANGE_PASSWORD: "/user/my-page/personal-info/change-password",
  USER_UPDATE_PASSWORD_SUCCESS: "/user/my-page/personal-info/update-password/success",
  USER_UPDATE_INFORMATION_SUCCESS: "/user/my-page/personal-info/update-information/success",
  USER_PERSONAL_INFO: "/user/my-page/personal-info",
  USER_DELETE_ACCOUNT: "/user/my-page/delete-account",
  USER_EDIT_ACCOUNT: "/user/my-page/personal-info/update-information",
  USER_EDIT_CREDIT_CARD: "/user/my-page/personal-info/change-credit-card",
  USER_CHANGE_CREDIT_CARD_SUCCESS: "/user/my-page/personal-info/change-credit-card/success",
  USER_DELETE_CREDIT_CARD_SUCCESS: "/user/my-page/personal-info/change-credit-card/delete",
  USER_FAVORITE_TENANTS: "/user/my-page/favorite-tenants",
  USER_CANCEL_BOOKING_SUCCESS: "/user/my-page/booking-history/cancel-success",
  USER_PARTIAL_CHECKOUT: "/user/my-page/booking-history/partial-checkout",
  USER_PARTIAL_CHECKOUT_SUCCESS: "/user/my-page/booking-history/partial-checkout/success",

  // ADMIN
  ADMIN_INDEX: "/admin",
  DASHBOARD: "/admin/dashboard",
  ADMIN_SIGN_IN: "/admin/signin",
  ADMIN_FORGOT_PASSWORD: "/admin/forgot-password",
  TICKET_MANAGEMENT: "/admin/ticket-management",
  BOOKING_QUEUE: "/admin/booking-queue",
  BOOKING_VACANCIES: "/admin/booking-vacancies",
  CREATE_TICKET: "/admin/ticket-management/create",
  VIEW_TICKET: "/admin/ticket-management/view",
  EDIT_TICKET: "/admin/ticket-management/edit",

  TENANT_MANAGEMENT: "/admin/tenant-management",
  CREATE_TENANT: "/admin/tenant-management/create",
  VIEW_TENANT: "/admin/tenant-management/view",
  EDIT_TENANT: "/admin/tenant-management/edit",

  USER_MANAGEMENT: "/admin/user-management",
  CREATE_USER: "/admin/user-management/create",
  VIEW_USER: "/admin/user-management/view",
  EDIT_USER: "/admin/user-management/edit",

  EMAIL_SETTING_MANAGEMENT: "/admin/email-settings",
  EDIT_EMAIL_SETTING: "/admin/email-settings/edit",

  BOOKING_MANAGEMENT: "/admin/booking-management",
  BOOKING_MANAGEMENT_LIST: "/admin/booking-management",
  BOOKING_MANAGEMENT_DETAILS: "/admin/booking-management/details",
  BOOKING_MANAGEMENT_UPDATE: "/admin/booking-management/update",
  BOOKING_MANAGEMENT_VACANCIES: "/admin/vacancies-status",
  BOOKING_MANAGEMENT_PARTIAL_CHECKOUT: "/admin/booking-management/partial-checkout",

  REVENUES_MANAGEMENT: "/admin/revenue-management",

  TENANT_LIST: "/tenant-list",
  TENANT_DETAIL: "/tenant/[code]",

  NEWS_MANAGEMENT: "/admin/news-management",
  NEWS_MANAGEMENT_EDIT: "/admin/news-management/edit",
  NEWS_MANAGEMENT_CREATE: "/admin/news-management/create",

  WAITING_TIME_MANAGEMENT: "/admin/waiting-time-management",

  DISCLAIMER_MANAGEMENT: "/admin/disclaimer-management",

  GMO_SETTINGS: "/admin/gmo-settings",
  GMO_SETTINGS_VIEW: "/admin/gmo-settings/view",
  GMO_SETTINGS_CREATE: "/admin/gmo-settings/create",
  GMO_SETTINGS_EDIT: "/admin/gmo-settings/edit",

  STAFF_MANAGEMENT: "/admin/staff-management",
  STAFF_MANAGEMENT_CREATE: "/admin/staff-management/create",
  STAFF_MANAGEMENT_EDIT: "/admin/staff-management/edit",

  ADMIN_BARCODE_SCANNER: "/admin/barcode-scanner",
  ADMIN_SCAN_MANAGEMENT: "/admin/scan-management",
};

// Pages that always show the default 403 message (not the IP message), even when
// the block is caused by an IP change. An IP block still forces logout on these.
export const DEFAULT_FORBIDDEN_PAGES: string[] = [
  ROUTE.ADMIN_BARCODE_SCANNER,
  ROUTE.ADMIN_SCAN_MANAGEMENT,
];
