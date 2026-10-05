// Type definitions for the Smaregi Platform API client.

import { SmaregiRounding, SmaregiTaxDivision, SmaregiWith, SmaregiWithDetail } from "./smaregi.const";

/** In-memory OAuth token cache (client-credentials). */
export type TokenCache = { accessToken: string; expiresAt: number };

/** A single line of a 仮販売 (temporary sale). */
export type SmaregiTemporaryDetail = {
  transactionDetailId: string;
  transactionDetailDivision: string;
  productName: string;
  salesPrice: string;
  quantity: string;
  taxDivision: SmaregiTaxDivision;
  categoryId?: string;
};

/** Payload to create a 仮販売 (temporary sale). */
export type SmaregiTemporaryInput = {
  preRegistrationName: string;
  subtotal: string;
  total: string;
  storeId: string;
  terminalTranId: string;
  terminalTranDateTime: string;
  details: SmaregiTemporaryDetail[];
};

/** A single line of a 確定販売 (confirmed/already-settled sale) — same shape as a 仮販売 line. */
export type SmaregiConfirmedDetail = SmaregiTemporaryDetail;

/** One entry of a transaction's `payments` array — records which payment method covered the sale. */
export type SmaregiPaymentInput = {
  paymentMethodId: string;
  paidAmount: number;
};

/** Payload to create a 確定販売 (confirmed sale) for revenue already collected outside the register. */
export type SmaregiConfirmedInput = {
  subtotal: string;
  total: string;
  storeId: string;
  terminalTranId: string;
  terminalTranDateTime: string;
  details: SmaregiConfirmedDetail[];
  payments?: SmaregiPaymentInput[];
  taxInclude: string;
  taxRate: string;
  taxRounding: SmaregiRounding;
};

/** A payment method (`/pos/payment_methods`) as returned by Smaregi. Only the fields the app reads
 * are modelled; other fields (unitPrice, displayFlag, ...) are accessible via the index signature. */
export type SmaregiPaymentMethod = {
  paymentMethodId: string;
  paymentMethodCode?: string;
  paymentMethodName?: string;
  [key: string]: any;
};

/** A department/category (`/pos/categories`) as returned by Smaregi. Only the fields the app reads
 * are modelled; other fields (categoryCode, level, displaySequence, ...) are accessible via the index
 * signature. */
export type SmaregiCategory = {
  categoryId: string;
  categoryName?: string;
  categoryGroupId?: string;
  [key: string]: any;
};

/** `with_*` flags for `getTransaction`. */
export type TransactionWithFlags = {
  with_details?: SmaregiWithDetail;
  with_payments?: SmaregiWith;
  with_coupons?: SmaregiWith;
  with_discounts?: SmaregiWith;
};

/**
 * A single coupon applied to a transaction (取引クーポン), returned in the `coupons` array when
 * `with_coupons=all`. Available on Premium / Premium Plus / Food Business / Retail Business plans.
 * All amounts are strings, as Smaregi returns them.
 */
export type SmaregiTransactionCoupon = {
  /** Transaction coupon ID. */
  transactionCouponId: string;
  /** Terminal transaction coupon ID. */
  terminalTranCouponId: string;
  /** Coupon ID. */
  couponId: string;
  /** Coupon name. */
  couponName: string;
  /** Coupon category — 0: Standard, 1: giftee. */
  couponDivision: string;
  /** Coupon number entered on the terminal. */
  mountNumber: string;
  /**
   * Benefit type:
   * 1: Discount, 2: Price reduction, 3: Product grant,
   * P1: 0 points, P2: Point overwrite, P3: Point addition, P4: Points ×N,
   * M1: 0 miles, M2: Mile overwrite, M3: Mile addition, M4: Miles ×N.
   */
  awardType: string;
  /**
   * Benefit value: discount amount [yen] when awardType is a discount, discount rate [%] when a
   * price reduction, or 0 for a product grant.
   */
  awardCount: string;
  /** Total coupon discount/reduction amount applied in this transaction [yen]. */
  discountPrice: string;

  serialNumber: string;
  awardValue: string;
};

export type SmaregiTransactionDiscount = {
  transactionHeadId: string;
  transactionDetailId: string;
  transactionDiscountDivision: string;
  discountDivision: string;
  discountDivisionName: string;
  /**
   * Benefit type:
   * 1: Discount, 2: Price reduction, 3: Product grant,
   * P1: 0 points, P2: Point overwrite, P3: Point addition, P4: Points ×N,
   * M1: 0 miles, M2: Mile overwrite, M3: Mile addition, M4: Miles ×N.
   */
  awardType: string;
  awardValue: string;
  /** Total coupon discount/reduction amount applied in this transaction [yen]. */
  discountPrice: string;
};

/**
 * Transaction head returned by `getTransaction`. Only the fields the app reads are modelled; the
 * index signature keeps the many other Smaregi head fields accessible without `any` casts breaking.
 */
export type SmaregiTransaction = {
  transactionHeadId?: string;
  contractId?: string;
  storeId?: string;
  /** 仮販売 barcode(s) this transaction settled (comma-separated). */
  barcode?: string;
  subtotal?: string;
  total?: string;
  couponDiscount?: string;
  coupons?: SmaregiTransactionCoupon[];
  discount?: SmaregiTransactionDiscount[];
  [key: string]: any;
};
