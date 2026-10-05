// Centralised Smaregi Platform API constants. Use these instead of inline string literals.

/** Tax type sent to Smaregi (`taxDivision`). */
export enum SmaregiTaxDivision {
  TaxIncluded = "0", // 税込
  TaxExcluded = "1", // 税抜
  NonTaxable = "2", // 非課税
}

/** Transaction webhook `action`. */
export enum SmaregiTransactionAction {
  Created = "created",
  Edited = "edited",
  Canceled = "canceled",
  Disposed = "disposed",
  BulkUpdate = "bulk-update",
  BulkDeleted = "bulk-deleted",
}

/** Actions that mean a previously-charged transaction was reversed. */
export const SMAREGI_REFUND_ACTIONS: SmaregiTransactionAction[] = [
  SmaregiTransactionAction.Canceled,
  SmaregiTransactionAction.Disposed,
];

/** Where a processed transaction record originated (audit / observability). */
export enum SmaregiTransactionSource {
  Webhook = "Webhook",
  Reconcile = "Reconcile",
  // Confirmed sale created directly for a prepaid booking (src/utils/server/smaregiSync.ts). Its
  // `created`/`canceled` webhooks always no-op (no 仮販売 mapping row to resolve), so this is the
  // only place that ever records it into `SmaregiTransaction`.
  PrepaidBooking = "PrepaidBooking",
}

/** `with_details` query value. */
export enum SmaregiWithDetail {
  All = "all",
  Summary = "summary",
  None = "none",
}

/** Generic `with_*` query value (payments / coupons / …). */
export enum SmaregiWith {
  All = "all",
  None = "none",
}

export enum SmaregiRounding {
  NoRounding = "0",
  RoundingDown = "1",
  RoudingUp = "2"
}
/** OAuth. */
export const SMAREGI_GRANT_TYPE = "client_credentials";
export const SMAREGI_TOKEN_TYPE = "Bearer";

/** Refresh the cached access token this long before it actually expires. */
export const TOKEN_EXPIRY_SAFETY_MS = 60 * 1000;

/** Transaction webhook event header (lower-cased by Next) + its expected value. */
export const SMAREGI_EVENT_HEADER = "smaregi-event";
export const SMAREGI_TRANSACTIONS_EVENT = "pos:transactions";

/** Synthetic coupon used when only the transaction-head couponDiscount is available. */
export enum SmaregiFallbackCoupon {
  Code = "SMAREGI",
  Name = "Smaregi Coupon",
  DiscountPrefix = "値引クーポン"
}

/** POS API endpoint paths (appended to `serverConfig.smaregi.apiBaseUrl`). */
export const SMAREGI_API = {
  STORES: "/stores",
  TRANSACTIONS: "/transactions",
  transaction: (transactionId: string) => `/transactions/${transactionId}`,
  transactionCancel: (transactionId: string) => `/transactions/${transactionId}/cancel`,
  TRANSACTIONS_TEMPORARIES: "/transactions/temporaries",
  temporaryTransaction: (id: string) => `/transactions/temporaries/${id}`,
  temporaryTransactionStatus: (id: string) => `/transactions/temporaries/${id}/status`,
  PAYMENT_METHODS: "/payment_methods",
  CATEGORIES: "/categories",
} as const;

/** 仮販売 (temporary sale) fixed fields. */
export const SMAREGI_TEMPORARY = {
  // POST /transactions/temporaries only accepts these two head values.
  TRANSACTION_HEAD_DIVISION: "1",
  STATUS: "0",
  // transactionDetailDivision = 1:通常 for every line.
  DETAIL_DIVISION: "1",
} as const;

/**
 * Fixed terminalId for 仮販売 (the API requires terminalId; we don't keep it in DB/env for now).
 * Change here if the store's terminal id differs.
 */
export const SMAREGI_TEMPORARY_TERMINAL_ID = "999999999";

/**
 * 確定販売 (confirmed/already-settled sale) fixed fields, for revenue collected outside the
 * register (e.g. paid online via GMO at booking time).
 */
export const SMAREGI_CONFIRMED = {
  TRANSACTION_HEAD_DIVISION: "1",
  DETAIL_DIVISION: "1",
  // Consumption tax rate (%) stamped on every 確定販売 detail row so Smaregi computes 内消費税 instead of
  // recording it as 0 — taxDivision alone only marks the price as tax-included, it doesn't carry a rate.
  TAX_RATE: "10",
} as const;

/**
 * The `payment_methods` code/name used to tag confirmed-sale (確定販売) revenue as prepaid
 * (collected via GMO at booking time, not at the register). Resolved/created once per Smaregi
 * contract via `resolvePrepaidPaymentMethodId` (`services/smaregi/smaregi.service.ts`).
 */
export const SMAREGI_PREPAID_PAYMENT_METHOD = {
  CODE: "prepaid",
  NAME: "【事前決済】",
} as const;

/**
 * Category (部門, `/pos/categories`) every 仮販売/確定販売 detail line is tagged with, so revenue shows
 * up under this Category in Smaregi's reporting. Resolved/created once per Smaregi contract via
 * `resolvePlayAreaCategoryId` (`services/smaregi/smaregi.service.ts`) — same cache-per-contract
 * pattern as `resolvePrepaidPaymentMethodId`.
 */
export const SMAREGI_PLAY_AREA_CATEGORY = {
  NAME: "あそび場",
} as const;

/**
 * `GET /pos/categories` has no name filter — only `category_code`/`level`. `resolvePlayAreaCategoryId`
 * lists categories with this limit and filters by `categoryName` client-side.
 */
export const SMAREGI_CATEGORIES_LIST_LIMIT = 1000;

/** Query-param keys used against the transactions endpoints. */
export const SMAREGI_QUERY = {
  STORE_ID: "store_id",
  BARCODE: "barcode",
  UPD_DATE_TIME_FROM: "upd_date_time-from",
  UPD_DATE_TIME_TO: "upd_date_time-to",
  TRANSACTION_DATE_TIME_FROM: "transaction_date_time-from",
  TRANSACTION_DATE_TIME_TO: "transaction_date_time-to",
  WITH_DETAILS: "with_details",
  WITH_PAYMENTS: "with_payments",
  WITH_COUPONS: "with_coupons",
  WITH_DISCOUNTS: "with_discounts",
  LIMIT: "limit",
  PAGE: "page",
  PAYMENT_METHOD_CODE: "payment_method_code",
} as const;

/** productCode encoding: `<barCode>_<audienceLetter><kindLetter><lineIndex>`. */
export enum SmaregiAudienceLetter {
  Adult = "a",
  Child = "c",
}

export enum SmaregiBarcodeKindLetter {
  Base = "b",
  ExtendedPeriod = "e",
  Discount = "d",
  HourlyExtraTimeDiscount = "x",
}

export enum SmaregiTemporaryTransactionStatus {
  Normal = "0",
  Completed = "1",
  Canceled = "2",
}