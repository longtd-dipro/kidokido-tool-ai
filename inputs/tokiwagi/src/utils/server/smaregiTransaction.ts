import {
  Booking,
  PaymentStatus,
  PaymentType,
  Prisma,
  SmaregiTemporaryStatus,
  TicketType,
} from "@prisma/client";
import { isNil } from "lodash";

import prisma from "utils/db";
import logger from "utils/logger";
import { Coupon } from "models/Booking";
import { getDateOneYearAgo } from "utils/date-time";
// import { cancelTransaction, getTransaction } from "services/smaregi/smaregi.service";
import { cancelTransaction, getTransaction } from "services/smaregi/smaregi.service";
import {
  SMAREGI_REFUND_ACTIONS,
  SmaregiFallbackCoupon,
  SmaregiTransactionAction,
  SmaregiTransactionSource,
  SmaregiWith,
  SmaregiWithDetail,
} from "services/smaregi/smaregi.const";
import {
  SmaregiTransaction,
  SmaregiTransactionCoupon,
  SmaregiTransactionDiscount,
} from "services/smaregi/smaregi.types";

import { SseEvent, SseLogLevel, registerSseNotification } from "./sse-hub";

/**
 * Shared, idempotent processors for a Smaregi transaction. Bookings are resolved from the head-level
 * 仮販売 `barcode` via the `barcode_smaregi_temporary_transactions` mapping (barcode → group barCode →
 * bookings). Idempotency is keyed on `SmaregiTransaction.transactionHeadId`.
 */

const isRefundAction = (action: string): boolean =>
  (SMAREGI_REFUND_ACTIONS as string[]).includes(action);

const toNumber = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Head-level `barcode` carries the 仮販売 barcode(s) this transaction settled (comma-separated). */
const getSmaregiTransactionBarcodes = (detail: any): string[] =>
  String(detail?.barcode ?? "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

/**
 * Mirrors `performCheckOut`: the real received total is recorded only on the first offline-eligible
 * booking of the group — i.e. any offline booking, or (when the group has none) an HourlyTimesLimit
 * child booking.
 */
const isTotalAmountTarget = (
  booking: any,
  hasOfflineBookings: boolean,
): boolean =>
  booking.Ticket?.paymentType !== PaymentType.Online ||
  (!hasOfflineBookings &&
    booking.Ticket?.type === TicketType.HourlyTimesLimit &&
    !!booking.parentBookingId);

/** Map Smaregi coupon info onto the existing Booking.coupons JSON shape (discountAmount is a string). */
const mapCoupons = (detail: SmaregiTransaction): Coupon[] => {
  const couponList = detail?.coupons;
  if (Array.isArray(couponList) && couponList.length > 0) {
    return couponList.map((c: SmaregiTransactionCoupon) => ({
      code: String(c?.serialNumber),
      name: String(c?.couponName),
      discountAmount: String(
        Math.abs(toNumber(c?.discountPrice ?? c?.awardValue)),
      ),
    })) as unknown as Coupon[];
  }

  const discountList = detail?.discounts;
  if (Array.isArray(discountList) && discountList.length > 0) {
    return discountList.map((c: SmaregiTransactionDiscount) => {
      const discountAmount = String(Math.abs(toNumber(c?.discountPrice ?? c?.awardValue)));
      const formatCouponName = `${SmaregiFallbackCoupon.DiscountPrefix} (${discountAmount})`;
      return {
        code: formatCouponName,
        name: formatCouponName,
        discountAmount,
      } as unknown as Coupon;
    });
  }

  const couponDiscount = toNumber(detail?.couponDiscount);
  if (couponDiscount > 0) {
    return [
      {
        code: SmaregiFallbackCoupon.Code,
        name: SmaregiFallbackCoupon.Name,
        discountAmount: String(couponDiscount),
      } as unknown as Coupon,
    ];
  }
  return [];
};

/**
 * Total discount actually applied to this transaction at the POS = subtotal − total. This captures
 * every kind of POS reduction (coupon, manual 値引き, point usage) in one number. Falls back to the
 * explicit coupon discount fields when `subtotal` is unavailable.
 */
const getSmaregiDiscount = (detail: any): number => {
  const subtotal = toNumber(detail?.subtotal);
  const total = toNumber(detail?.total);
  if (subtotal > 0 && subtotal >= total) return subtotal - total;
  return mapCoupons(detail).reduce(
    (sum, c) => sum + toNumber((c as any).discountAmount),
    0,
  );
};

/** Resolve the bookings of a transaction: 仮販売 barcode(s) → mapping group barCode(s) → bookings. */
const resolveBarcodesFromSmaregiBarcodes = async (
  smaregiBarcodes: string[],
) => {
  if (smaregiBarcodes.length === 0) return [];
  const maps = await prisma.smaregiTemporaryTransaction.findMany({
    where: { temporaryTransactionBarcode: { in: smaregiBarcodes } },
    select: { bookingBarCode: true },
  });
  return Array.from(new Set(maps.map((m) => m.bookingBarCode)));
};

/** Set the mapping rows' status for the given 仮販売 barcode(s).
 *  When status=Completed, also records the real settled transaction head ID so rollback can cancel
 *  the correct transaction even after smaregiTransactionHeadId is overwritten by a later cycle.
 */
const setMappingStatus = async (
  smaregiBarcodes: string[],
  status: SmaregiTemporaryStatus,
  settledTransactionHeadId?: string,
): Promise<void> => {
  if (smaregiBarcodes.length === 0) return;
  // settledTransactionHeadId column added by migration 20260709000000; `as any` until types regenerate.
  await prisma.smaregiTemporaryTransaction.updateMany({
    where: { temporaryTransactionBarcode: { in: smaregiBarcodes } },
    data:
      status === SmaregiTemporaryStatus.Completed
        ? { status, syncedAt: new Date(), ...(settledTransactionHeadId ? { settledTransactionHeadId } as any : {}) }
        : { status },
  });
};

/**
 * Apply a transaction's payment to its bookings.
 *
 * Revenue: `performCheckOut` already wrote the web-computed total onto totalAmount/webTotalAmount.
 * Smaregi only contributes the discount/coupon applied at the POS, so the real booking revenue is
 * `checkoutTotal − POSDiscount`, NOT `checkoutTotal + smaregiTotal` (which double-counted). We derive
 * from the immutable checkout figure (`webTotalAmount`) so re-delivered / edited webhooks stay
 * idempotent. The whole total is attributed to the first offline-eligible booking only.
 *
 * `mode` only controls coupons now: "add" appends, "replace" overwrites.
 */
const applyTransactionToBookings = async (
  bookings: (Booking & { Ticket?: any })[],
  detail: SmaregiTransaction,
  paymentStatus: PaymentStatus,
  mode: "add" | "replace",
): Promise<number[]> => {
  const discount = getSmaregiDiscount(detail);
  const coupons = mapCoupons(detail);
  const hasOfflineBookings = bookings.some(
    (b) => (b as any).Ticket?.paymentType !== PaymentType.Online,
  );
  const affectedBookingIds: number[] = [];
  let totalApplied = false;

  for (const booking of bookings) {
    const updateData: Prisma.BookingUpdateInput = {
      paymentStatus,
      isSmaregiScanned: true,
    };

    if (coupons.length > 0) {
      const current = (booking.coupons as Prisma.JsonArray) ?? [];
      updateData.coupons = (
        mode === "replace"
          ? (coupons as unknown as Prisma.JsonArray)
          : current.concat(coupons as unknown as Prisma.JsonArray)
      ) as Prisma.InputJsonValue;
    }

    if (
      !isNil((booking as any).totalAmount) &&
      isTotalAmountTarget(booking, hasOfflineBookings)
    ) {
      if (!totalApplied) {
        // Base = the immutable checkout web total. Fall back to the current totalAmount only when
        // webTotalAmount is unset (booking had no Smaregi charge lines at checkout).
        const base = toNumber(booking.totalAmount);
        updateData.totalAmount = new Prisma.Decimal(
          Math.max(0, base - discount),
        );
        totalApplied = true;
      } else if (isNil(booking.totalAmount)) {
        updateData.totalAmount = new Prisma.Decimal(0);
      }
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: updateData,
    });
    affectedBookingIds.push(booking.id);
  }

  return affectedBookingIds;
};

/** Created / settle: mark bookings paid + mapping Completed. */
export const processSmaregiTransaction = async (
  contractId: string,
  transactionHeadId: string,
  action: string = SmaregiTransactionAction.Created,
  source: SmaregiTransactionSource = SmaregiTransactionSource.Webhook,
): Promise<void> => {
  const existing = await prisma.smaregiTransaction.findUnique({
    where: { transactionHeadId },
  });
  // Already processed and not a cancellation/edit that requires re-applying — no-op.
  if (existing && !isRefundAction(action)) return;

  const detail = await getTransaction(contractId, transactionHeadId, {
    with_details: SmaregiWithDetail.All,
    with_payments: SmaregiWith.All,
    with_coupons: SmaregiWith.All,
    with_discounts: SmaregiWith.All,
  });

  if (!detail) return;

  const headTotal = toNumber(detail.total);
  const storeId = detail.storeId ? String(detail.storeId) : null;
  const isRefund = isRefundAction(action);
  const smaregiBarcodes = getSmaregiTransactionBarcodes(detail);
  if (smaregiBarcodes.length === 0) return;

  const bookingBarcodes =
    await resolveBarcodesFromSmaregiBarcodes(smaregiBarcodes);
  if (bookingBarcodes.length === 0) return;

  // A 仮販売 settle is only valid while the booking group is still checked out. Smaregi has no
  // reliable way to stop a POS from settling a 仮販売 that was already recalled/opened, so if the
  // booking was Undo-Checked-out in the meantime (status reverted to CheckedIn), this payment is
  // invalid. Instead of applying it, cancel the transaction on Smaregi and mark the 仮販売 mapping
  // Cancelled — keeping the booking system and Smaregi consistent. Refund actions are exempt: they
  // are meant to reverse an already-settled transaction regardless of the current booking status.
  const isTemporaryTransactionReadyForPay = await prisma.smaregiTemporaryTransaction.count({
    where: {
      temporaryTransactionBarcode: { in: smaregiBarcodes as string[] },
      status: SmaregiTemporaryStatus.Normal,
    },
  });
  if (!isTemporaryTransactionReadyForPay) {
    await cancelInvalidSmaregiTransaction(
      contractId,
      transactionHeadId,
      detail,
      source,
      smaregiBarcodes,
      storeId,
      headTotal,
    );
    return;
  }

  const paymentStatus = isRefund
    ? PaymentStatus.Refunded
    : PaymentStatus.Completed;
  const affectedBookingIds: number[] = [];

  for (const barCode of bookingBarcodes) {
    const bookings = await prisma.booking.findMany({
      where: {
        barCode: barCode as string,
        createdAt: { gte: getDateOneYearAgo(new Date()) },
      },
      include: {
        User: true,
        Ticket: {
          include: {
            TicketDetail: true,
            TicketDiscountSetting: true,
            TicketBookingSchedule: { where: { deleted: false } },
          },
        },
        TicketBookingSchedule: true,
      },
    });
    if (bookings.length === 0) continue;
    const ids = await applyTransactionToBookings(
      bookings,
      detail,
      paymentStatus,
      "add",
    );
    affectedBookingIds.push(...ids);

    // Emit event to end user
    const ownerUserId = bookings[0]?.User?.id;
    registerSseNotification(ownerUserId, { event: SseEvent.TRANSACTION_PAID, level: SseLogLevel.INFO });
  }

  await setMappingStatus(
    smaregiBarcodes,
    isRefund ? SmaregiTemporaryStatus.Cancelled : SmaregiTemporaryStatus.Completed,
    isRefund ? undefined : transactionHeadId,
  );
  await upsertSmaregiTransaction(
    transactionHeadId,
    detail,
    action,
    source,
    storeId,
    headTotal,
    affectedBookingIds,
  );
};

/**
 * The 仮販売 was settled at the POS after its booking group had already been Undo-Checked-out, so the
 * payment is invalid. Best-effort cancel it on Smaregi (a `canceled` webhook follows and settles the
 * reversal bookkeeping), mark the 仮販売 mapping Cancelled, and record the transaction as canceled.
 * The Smaregi cancel is wrapped so a remote failure never throws out of the webhook handler — the
 * payment is not applied either way, which is the invariant that matters.
 */
const cancelInvalidSmaregiTransaction = async (
  contractId: string,
  transactionHeadId: string,
  detail: any,
  source: SmaregiTransactionSource,
  smaregiBarcodes: string[],
  storeId: string | null,
  headTotal: number,
): Promise<void> => {
  logger.warn(
    `[smaregi] settle rejected: booking no longer checked out, cancelling transaction ${transactionHeadId}`,
  );
  try {
    await cancelTransaction(contractId, transactionHeadId);
  } catch (error) {
    logger.error(
      `[smaregi] failed to cancel invalid transaction ${transactionHeadId}: ${(error as Error)?.message}`,
    );
  }
  await setMappingStatus(smaregiBarcodes, SmaregiTemporaryStatus.Cancelled);
  await upsertSmaregiTransaction(
    transactionHeadId,
    detail,
    SmaregiTransactionAction.Canceled,
    source,
    storeId,
    headTotal,
    [],
  );
};

const upsertSmaregiTransaction = async (
  transactionHeadId: string,
  detail: any,
  action: string,
  source: string,
  storeId: string | null,
  total: number,
  affectedBookingIds: number[],
) => {
  const data = {
    contractId: detail?.contractId ? String(detail.contractId) : null,
    storeId,
    action,
    total: new Prisma.Decimal(total),
    rawPayload: detail as Prisma.InputJsonValue,
    affectedBookingIds: affectedBookingIds as unknown as Prisma.InputJsonValue,
    source,
    processedAt: new Date(),
  };

  await prisma.smaregiTransaction.upsert({
    where: { transactionHeadId },
    update: data,
    create: { transactionHeadId, ...data },
  });

  logger.info(
    `[smaregi] processed transaction ${transactionHeadId} action=${action} source=${source} ` +
    `bookings=[${affectedBookingIds.join(",")}]`,
  );
};

/* ───────────────────────── non-created webhook actions ───────────────────────── */

/** Actions that reverse a previously-settled transaction. */
const REVERSAL_ACTIONS: string[] = [
  SmaregiTransactionAction.Canceled,
  SmaregiTransactionAction.Disposed,
  SmaregiTransactionAction.BulkDeleted,
];

/** Actions that re-apply an updated transaction. */
const UPDATE_ACTIONS: string[] = [
  SmaregiTransactionAction.Edited,
  SmaregiTransactionAction.BulkUpdate,
];

/**
 * Handle the non-created Smaregi transaction webhook actions. Kept separate from
 * `processSmaregiTransaction` (the create / settle path) so each concern stays isolated:
 *   - edited / bulk-update               → the settled transaction changed: refresh total + coupons.
 *   - canceled / disposed / bulk-deleted → the transaction was reversed: refund the bookings and
 *                                          mark the 仮販売 mapping Cancelled.
 */
export const handleSmaregiTransactionMutation = async (
  contractId: string,
  transactionHeadId: string,
  action: string,
  source: SmaregiTransactionSource = SmaregiTransactionSource.Webhook,
): Promise<void> => {
  if (REVERSAL_ACTIONS.includes(action)) {
    await reverseSmaregiTransaction(
      contractId,
      transactionHeadId,
      action,
      source,
    );
  } else if (UPDATE_ACTIONS.includes(action)) {
    await reapplySmaregiTransaction(
      contractId,
      transactionHeadId,
      action,
      source,
    );
  } else {
    logger.info(
      `[smaregi] mutation skipped: unsupported action=${action} tx=${transactionHeadId}`,
    );
  }
};

/** canceled / disposed / bulk-deleted → refund the bookings and mark the 仮販売 mapping Cancelled. */
const reverseSmaregiTransaction = async (
  contractId: string,
  transactionHeadId: string,
  action: string,
  source: SmaregiTransactionSource,
): Promise<void> => {
  // Resolve barcodes from the stored record first (works even if Smaregi already deleted the tx),
  // then fall back to a live fetch.
  const record = await prisma.smaregiTransaction.findUnique({
    where: { transactionHeadId },
  });
  let detail: any = record?.rawPayload ?? null;
  let barcodes = getSmaregiTransactionBarcodes(detail);

  if (barcodes.length === 0) {
    detail = await getTransaction(contractId, transactionHeadId, {
      with_details: SmaregiWithDetail.None,
      with_payments: SmaregiWith.None,
      with_coupons: SmaregiWith.None,
    }).catch(() => null);
    barcodes = getSmaregiTransactionBarcodes(detail);
  }
  if (barcodes.length === 0) {
    return;
  }

  // If every SmaregiTemporaryTransaction mapping for these barcodes is already Cancelled,
  // this cancel webhook was triggered by our own rollbackBookingFromSmaregi (which pre-marks
  // rows as Cancelled before calling the Smaregi cancel API). Bookings are already handled
  // by the rollback flow — skip the refund update to avoid an unintended paymentStatus=Refunded.
  const mappingStatuses = await prisma.smaregiTemporaryTransaction.findMany({
    where: { temporaryTransactionBarcode: { in: barcodes } },
    select: { status: true },
  });
  if (mappingStatuses.length > 0 && mappingStatuses.every((m) => m.status === SmaregiTemporaryStatus.Cancelled)) {
    await upsertSmaregiTransaction(
      transactionHeadId,
      detail ?? { barcode: barcodes.join(",") },
      action,
      source,
      record?.storeId ?? (detail?.storeId ? String(detail.storeId) : null),
      toNumber(detail?.total),
      [],
    );
    return;
  }

  const bookingBarcodes = await resolveBarcodesFromSmaregiBarcodes(barcodes);
  const affectedBookingIds: number[] = [];

  for (const barCode of bookingBarcodes) {
    const bookings = await prisma.booking.findMany({
      where: {
        barCode: barCode as string,
        createdAt: { gte: getDateOneYearAgo(new Date()) },
      },
      select: { id: true, paymentStatus: true },
    });
    const completedBookings = bookings.filter(
      (b) => b.paymentStatus === PaymentStatus.Completed,
    );
    const completedBookingIds = completedBookings.map((b) => b.id);
    if (completedBookingIds.length > 0) {
      await prisma.booking.updateMany({
        where: { id: { in: completedBookingIds } },
        data: { paymentStatus: PaymentStatus.Refunded },
      });
    }
    affectedBookingIds.push(...bookings.map((b) => b.id));
  }

  await setMappingStatus(barcodes, SmaregiTemporaryStatus.Cancelled);

  await upsertSmaregiTransaction(
    transactionHeadId,
    detail ?? { barcode: barcodes.join(",") },
    action,
    source,
    record?.storeId ?? (detail?.storeId ? String(detail.storeId) : null),
    toNumber(detail?.total),
    affectedBookingIds,
  );
};

/** edited / bulk-update → refresh total + coupons on the linked bookings (replace, not append). */
const reapplySmaregiTransaction = async (
  contractId: string,
  transactionHeadId: string,
  action: string,
  source: SmaregiTransactionSource,
): Promise<void> => {
  const detail: any = await getTransaction(contractId, transactionHeadId, {
    with_details: SmaregiWithDetail.All,
    with_payments: SmaregiWith.All,
    with_coupons: SmaregiWith.All,
  });
  if (!detail) return;

  const barcodes = getSmaregiTransactionBarcodes(detail);
  const bookingBarcodes = await resolveBarcodesFromSmaregiBarcodes(barcodes);
  if (bookingBarcodes.length === 0) return;

  const headTotal = toNumber(detail.total);
  const storeId = detail.storeId ? String(detail.storeId) : null;
  const affectedBookingIds: number[] = [];

  for (const barCode of bookingBarcodes) {
    const bookings = await prisma.booking.findMany({
      where: {
        barCode: barCode as string,
        createdAt: { gte: getDateOneYearAgo(new Date()) },
      },
      include: { Ticket: true },
    });
    if (bookings.length === 0) continue;
    const ids = await applyTransactionToBookings(
      bookings,
      detail,
      PaymentStatus.Completed,
      "replace",
    );
    affectedBookingIds.push(...ids);
  }

  await setMappingStatus(barcodes, SmaregiTemporaryStatus.Completed, transactionHeadId);
  await upsertSmaregiTransaction(
    transactionHeadId,
    detail,
    action,
    source,
    storeId,
    headTotal,
    affectedBookingIds,
  );
};
