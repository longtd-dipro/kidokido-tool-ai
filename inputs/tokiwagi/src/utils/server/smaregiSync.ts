/* eslint-disable max-len */
import { Prisma, PrismaClient, SmaregiTemporaryStatus, Tenant, TicketType } from "@prisma/client";
import { AxiosError } from "axios";

import prisma from "utils/db";
import logger from "utils/logger";
import {
  cancelTransaction,
  changeTemporaryTransactionStatus,
  createTemporaryTransaction,
  createTransaction,
  resolvePlayAreaCategoryId,
  resolvePrepaidPaymentMethodId,
} from "services/smaregi/smaregi.service";
import { SmaregiConfirmedDetail, SmaregiConfirmedInput, SmaregiTemporaryDetail, SmaregiTemporaryInput } from "services/smaregi/smaregi.types";
import {
  SMAREGI_CONFIRMED,
  SMAREGI_TEMPORARY,
  SMAREGI_TEMPORARY_TERMINAL_ID,
  SmaregiRounding,
  SmaregiTaxDivision,
  SmaregiTemporaryTransactionStatus,
  SmaregiTransactionAction,
  SmaregiTransactionSource,
} from "services/smaregi/smaregi.const";
import { ChargeAudience, CheckoutChargeLine, sumSalesPrice } from "utils/server/checkoutCharges";
import { formatJpTz } from "utils/date-time";
import { getSafeNumberValue } from "utils/number";
import { isOnlineMonthlyTicket, isOnlineOneDayBooking, isOnlineTimesLimitTicket } from "utils/booking";
import { calculateDiscountByQuantity } from "utils/discount";
import { Booking } from "models/Entity";
import { ERROR_MESSAGES } from "constants/errors";
import { checkIsFirstTimeUsingMonthlyTicket } from "utils/server/booking";
import { CHECK_IN_OUT_TENANT_VERSION } from "constants/common";

/**
 * Smaregi 仮販売 (temporary sale) sync at checkout.
 *
 * All bookings that share a checkout-group `barCode` map to ONE 仮販売: every charge line of every
 * booking in the group becomes a `details` row. Smaregi returns a `barcode` the POS scans to recall
 * the whole order for payment. The mapping (barCode → 仮販売) lives in
 * `barcode_smaregi_temporary_transactions`. No product master is touched.
 */

/** One booking's contribution to a group's 仮販売: its ticket name + per-person charge lines. */
export type SmaregiTemporaryGroupItem = { ticketName: string; lines: CheckoutChargeLine[] };

const DETAIL_PRODUCT_NAME_MAX = 85;
const PRE_REGISTRATION_NAME_MAX = 20;
const TERMINAL_TRAN_ID_MAX = 10;

/** audience in Japanese for the 仮販売 line name — matches the スマレジ/受付システム登録名 column (大人 / 子ども). */
const AUDIENCE_JP: Record<string, string> = { adult: "大人", child: "子ども" };

const CHARGE_KIND_JP = {
  extendedPeriod: "【延長料金】",
  hourlyExtraTimeDiscount: "【割引】",
};

/** Full-width space (U+3000) separator, matching the スマレジ/受付システム登録名 column. */
const NAME_SEPARATOR = "\u3000";

/**
 * Formats the 仮販売 line name to mirror the スマレジ/受付システム登録名 column:
 * `${ticketName}` + full-width space + `${大人|子ども}`, e.g. "平日時間制" + U+3000 + "子ども".
 */
const buildDetailProductName = (ticketName: string, line: CheckoutChargeLine): string => {
  const chargeKind = ["extendedPeriod", "hourlyExtraTimeDiscount"].includes(line.kind) ? CHARGE_KIND_JP[line.kind] : "";
  return `${ticketName}${chargeKind}${NAME_SEPARATOR}${AUDIENCE_JP[line.audience] ?? line.audience}`.slice(0, DETAIL_PRODUCT_NAME_MAX);
};

/**
 * Build the POST /transactions/temporaries payload for a whole barCode group. `salesPrice` is the
 * per-person unit price, computed SEPARATELY for each adult/child usage: charge lines are grouped by
 * `(productName, unit salesPrice)` so people of the same audience at the same price collapse into one
 * `details` row with `quantity` = headcount, while a person at a different price (e.g. a discounted
 * person) keeps their own row. Discount lines keep their negative amount (mirrors the OBIC ledger).
 * subtotal/total = sum of the per-line rounded amounts so they always match. `categoryId`, when given,
 * is stamped onto every detail row so the revenue is classified under that Smaregi Category.
 */
export const buildTemporaryPayload = (
  barCode: string,
  items: SmaregiTemporaryGroupItem[],
  storeId: string,
  categoryId?: string,
): SmaregiTemporaryInput => {
  const grouped = new Map<string, { productName: string; salesPrice: number; quantity: number }>();
  let total = 0;
  for (const item of items) {
    for (const line of item.lines) {
      const productName = buildDetailProductName(item.ticketName, line);
      const salesPrice = Math.round(line.salesPrice);
      const key = `${productName}|${salesPrice}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.quantity += 1;
      } else {
        grouped.set(key, { productName, salesPrice, quantity: 1 });
      }
      total += salesPrice;
    }
  }

  const details: SmaregiTemporaryDetail[] = Array.from(grouped.values()).map((group, i) => ({
    transactionDetailId: String(i + 1),
    transactionDetailDivision: SMAREGI_TEMPORARY.DETAIL_DIVISION,
    productName: group.productName,
    salesPrice: String(group.salesPrice),
    quantity: String(group.quantity),
    taxDivision: SmaregiTaxDivision.TaxIncluded,
    ...(categoryId ? { categoryId } : {}),
  }));

  return {
    preRegistrationName: `TX#${barCode}`.slice(0, PRE_REGISTRATION_NAME_MAX),
    subtotal: String(total),
    total: String(total),
    storeId,
    terminalTranId: generateTerminalTranId(),
    terminalTranDateTime: formatJpTz(new Date()),
    details,
  };
};

/**
 * Create ONE 仮販売 for a checkout-group barCode in Smaregi BEFORE the checkout DB write; the returned
 * row is persisted by the caller INSIDE the checkout transaction. Throws on Smaregi failure so the
 * checkout aborts (atomic).
 *
 * - Idempotent / re-scan safe: returns null if a non-Cancelled mapping row already exists for the
 *   same barCode AND the same checkedInAt (i.e., the same checkout cycle). This allows one 仮販売 per
 *   re-check-in cycle instead of one per barCode lifetime.
 * - Returns null (skip) when there are no charge lines or the tenant has no `smaregiStoreId` /
 *   `smaregiContractId` (Smaregi not configured for this tenant).
 */
export const createSmaregiTemporaryTransaction = async (
  barCode: string,
  items: SmaregiTemporaryGroupItem[],
  tenant: Tenant | null,
  checkedInAt: Date | null,
  db: PrismaClient = prisma
  // Return type uses `any` for checkedInAt until prisma types are regenerated after migration 20260709000000.
): Promise<(Prisma.SmaregiTemporaryTransactionUncheckedCreateInput & { checkedInAt?: Date | null }) | null> => {
  if (!items.some((i) => i.lines.length > 0)) return null;

  const totalSalesPrice = items.reduce((sum, item) => sum + sumSalesPrice(item.lines), 0);
  if (totalSalesPrice === 0) return null;

  const storeId = tenant?.smaregiStoreId;
  const contractId = tenant?.smaregiContractId;
  if (!storeId || !contractId) {
    return null;
  }

  // Idempotency scoped to this checkout cycle: skip if a non-Cancelled transaction already exists
  // for the same barCode + checkedInAt pair. Different cycles (different checkedInAt) can each
  // create their own 仮販売.
  // checkedInAt column added by migration 20260709000000; `as any` until prisma types regenerate.
  const existing = await db.smaregiTemporaryTransaction.count({
    where: { bookingBarCode: barCode, checkedInAt, status: { not: SmaregiTemporaryStatus.Cancelled } } as any,
  });
  if (existing > 0) return null;

  let categoryId: string;
  try {
    categoryId = await resolvePlayAreaCategoryId(contractId);
  } catch (error) {
    logger.error(`[smaregi] failed to resolve play area category for barCode ${barCode}: ${((error as AxiosError)?.response?.data as { detail: string })?.detail}`);
    throw error;
  }

  const payload = buildTemporaryPayload(barCode, items, storeId, categoryId);

  let created: any;
  try {
    created = await createTemporaryTransaction(contractId, payload);
  } catch (error) {
    logger.error(`[smaregi] temporary transaction creation failed for barCode ${barCode}: ${((error as AxiosError)?.response?.data as { detail: string })?.detail}`);
    throw error;
  }

  return {
    bookingBarCode: barCode,
    temporaryTransactionHeadId: created?.transactionHeadId ? String(created.transactionHeadId) : null,
    temporaryTransactionBarcode: created?.barcode ? String(created.barcode) : null,
    preRegistrationName: payload.preRegistrationName,
    storeId,
    terminalId: SMAREGI_TEMPORARY_TERMINAL_ID,
    total: new Prisma.Decimal(payload.total),
    status: SmaregiTemporaryStatus.Normal,
    checkedInAt: checkedInAt as any,
    syncedAt: new Date(),
  };
};

/**
 * Track a freshly-created 仮販売's head id (for rollback-on-abort) and persist its mapping row inside
 * the checkout transaction. No-op if creation was skipped (`createSmaregiTemporaryTransaction`
 * returned null — e.g. no charge lines, or the tenant has no Smaregi config).
 */
export const persistSmaregiTemporaryTransaction = async (
  smaregiTemporaryTransaction: Awaited<ReturnType<typeof createSmaregiTemporaryTransaction>>,
  tx: PrismaClient,
  createdTemporaryHeadIds: string[],
): Promise<void> => {
  if (!smaregiTemporaryTransaction) return;

  if (smaregiTemporaryTransaction.temporaryTransactionHeadId) {
    createdTemporaryHeadIds.push(smaregiTemporaryTransaction.temporaryTransactionHeadId);
  }

  await tx.smaregiTemporaryTransaction.create({ data: smaregiTemporaryTransaction });
};

/* ───────────────────────── Confirmed sale (確定販売) for prepaid bookings ───────────────────────── */

/** Real numbers needed to split a booking's already-collected total across adult/child when no real
 * per-person amount is available from `chargeLines` (Daily Online / DailyTimesLimit Online —
 * checkout-time charge is always 0, the ticket price was fully collected at booking time).
 * `adultDiscountDetails`/`childDiscountDetails` are the per-person (1-indexed) discount amounts from
 * `calculateDiscountByQuantity` — the SAME function `getDailyBookingTotalPrices`/
 * `getTimesLimitBookingTotalPrices` (utils/booking.ts) used to compute this booking's `totalAmount` in
 * the first place, so summing every person's `unitPrice − discount` reproduces that total exactly. */
export type SmaregiConfirmedFallbackSplit = {
  adultQuantity: number;
  adultUnitPrice: number;
  adultDiscountDetails: Record<number, number>;
  childQuantity: number;
  childUnitPrice: number;
  childDiscountDetails: Record<number, number>;
};

/** Groups per-person detail rows by (productName, unit price) so same-price people collapse into one
 * row with a summed `quantity`, mirroring `buildTemporaryPayload`. */
const groupIntoDetails = (items: { productName: string; salesPrice: number }[], categoryId?: string): SmaregiConfirmedDetail[] => {
  const grouped = new Map<string, { productName: string; salesPrice: number; quantity: number }>();
  for (const item of items) {
    const key = `${item.productName}|${item.salesPrice}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.quantity += 1;
    } else {
      grouped.set(key, { ...item, quantity: 1 });
    }
  }
  return Array.from(grouped.values()).map((group, i) => ({
    transactionDetailId: String(i + 1),
    transactionDetailDivision: SMAREGI_CONFIRMED.DETAIL_DIVISION,
    productName: group.productName,
    salesPrice: String(group.salesPrice),
    quantity: String(group.quantity),
    taxDivision: SmaregiTaxDivision.TaxIncluded,
    ...(categoryId ? { categoryId } : {}),
  }));
};

/** Detail rows from real per-person amounts (Monthly/Yearly first-use, HourlyTimesLimit base lines) —
 * grouped by (productName, unit amount) so same-price people of the same audience collapse into one
 * row. */
const buildRealAmountDetails = (ticketName: string, chargeLines: CheckoutChargeLine[], categoryId?: string): SmaregiConfirmedDetail[] => {
  // amount meaning the first pay amount
  const items = chargeLines.map((line) => ({ productName: buildDetailProductName(ticketName, line), salesPrice: Math.round(line.amount) }));
  return groupIntoDetails(items, categoryId);
};

/**
 * Detail rows for adult/child, using the REAL per-person price and REAL per-person bulk-quantity
 * discount for each audience (`price = unitPrice − discount[i]`) — the same numbers
 * `getDailyBookingTotalPrices`/`getTimesLimitBookingTotalPrices` (utils/booking.ts) used to compute
 * this booking's `totalAmount` when it was first priced. Same-price people (adults and children alike)
 * collapse into one row, mirroring `buildRealAmountDetails`.
 */
const buildFallbackSplitDetails = (ticketName: string, split: SmaregiConfirmedFallbackSplit, categoryId?: string): SmaregiConfirmedDetail[] => {
  const { adultQuantity, adultUnitPrice, adultDiscountDetails, childQuantity, childUnitPrice, childDiscountDetails } = split;

  const buildAudienceItems = (audience: ChargeAudience, quantity: number, unitPrice: number, discountDetails: Record<number, number>) => {
    const productName = `${ticketName}${NAME_SEPARATOR}${AUDIENCE_JP[audience]}`.slice(0, DETAIL_PRODUCT_NAME_MAX);
    return Array.from({ length: quantity }, (_, index) => ({
      productName,
      salesPrice: Math.round(unitPrice - (discountDetails[index + 1] ?? 0)),
    }));
  };

  const items = [
    ...buildAudienceItems("adult", adultQuantity, adultUnitPrice, adultDiscountDetails),
    ...buildAudienceItems("child", childQuantity, childUnitPrice, childDiscountDetails),
  ].filter((item) => item.salesPrice !== 0);

  return groupIntoDetails(items, categoryId);
};

/** 内消費税 — the portion of a tax-included `total` that is consumption tax: `total / (100 + taxRate) *
 * taxRate`. Rounded per `rounding` (the same value sent as `taxRounding`, so Smaregi's own figure
 * matches what we report here). */
const calculateTaxInclude = (total: number, taxRate: number, rounding: SmaregiRounding): number => {
  const rawTaxInclude = (total / (100 + taxRate)) * taxRate;
  switch (rounding) {
    case SmaregiRounding.RoundingDown:
      return Math.floor(rawTaxInclude);
    case SmaregiRounding.RoudingUp:
      return Math.ceil(rawTaxInclude);
    default:
      return Math.round(rawTaxInclude);
  }
};

/**
 * Build the POST /transactions payload recording one booking's prepaid revenue. Pass `fallbackSplit`
 * only for ticket types whose checkout-time `chargeLines` carry no real per-person amount (Daily
 * Online / DailyTimesLimit Online); omit it to use `chargeLines[].amount` directly (Monthly/Yearly
 * first-use, HourlyTimesLimit base lines).
 *
 * `paymentMethodId` (resolved by `resolvePrepaidPaymentMethodId`) tags the whole sale as paid via the
 * "prepaid" (事前決済) payment method — the entire total, since this transaction only ever records
 * revenue already collected via GMO at booking time. `categoryId` (resolved by
 * `resolvePlayAreaCategoryId`), when given, is stamped onto every detail row.
 */
export const buildConfirmedPayload = (
  ticketName: string,
  chargeLines: CheckoutChargeLine[],
  storeId: string,
  paymentMethodId: string,
  fallbackSplit?: SmaregiConfirmedFallbackSplit,
  categoryId?: string,
): SmaregiConfirmedInput => {
  const details = fallbackSplit
    ? buildFallbackSplitDetails(ticketName, fallbackSplit, categoryId)
    : buildRealAmountDetails(ticketName, chargeLines, categoryId);

  const total = details.reduce((sum, d) => sum + Number(d.salesPrice) * Number(d.quantity), 0);
  const taxRate = Number(SMAREGI_CONFIRMED.TAX_RATE);
  const taxRounding = SmaregiRounding.RoundingDown;

  return {
    subtotal: String(total),
    total: String(total),
    storeId,
    terminalTranId: generateTerminalTranId(),
    terminalTranDateTime: formatJpTz(new Date()),
    details,
    payments: [{ paymentMethodId, paidAmount: total }],
    taxInclude: String(calculateTaxInclude(total, taxRate, taxRounding)),
    taxRate: SMAREGI_CONFIRMED.TAX_RATE,
    taxRounding,
  };
};

/**
 * Create ONE confirmed sale on Smaregi to record a prepaid booking's revenue (ticket price already
 * collected via GMO at booking time, not at the register). Unlike the shared 仮販売 batch, this is
 * per-booking and created at most once — the caller must persist the returned `transactionHeadId`
 * onto `Booking.smaregiConfirmedTransactionHeadId` so later checkouts (re-check-in, partial checkout)
 * skip re-creating it.
 *
 * The total to record is NOT always `booking.totalAmount`:
 * - Fallback mode (`fallbackSplit` passed — Daily/DailyTimesLimit Online): this booking IS the whole
 *   purchase, so `booking.totalAmount` is the full charge.
 * - Real-amount mode (Monthly/Yearly/TimesLimit first-use): the booking that actually checks out is a
 *   CHILD booking (`use-in-day.ts`, `parentBookingId` set) sharing a barCode with the season-pass
 *   purchase booking — its OWN `totalAmount` is only this visit's incremental charge (usually 0; the
 *   season price was paid on the PARENT). The real revenue lives in `chargeLines[].amount` instead.
 *
 * Returns null (skip) when: already recorded, the total is not positive, the tenant has no Smaregi
 * config, or the built payload has no positive-amount detail rows.
 * Throws on Smaregi API failure so the caller's checkout transaction can abort/rollback.
 */
export const createSmaregiConfirmedTransaction = async (
  booking: { id: number; totalAmount: Prisma.Decimal | number | null; smaregiConfirmedTransactionHeadId: string | null },
  ticketName: string,
  chargeLines: CheckoutChargeLine[],
  tenant: Tenant | null,
  fallbackSplit?: SmaregiConfirmedFallbackSplit,
): Promise<{ transactionHeadId: string; total: number; rawPayload: any } | null> => {
  if (booking.smaregiConfirmedTransactionHeadId) return null;

  const totalAmount = fallbackSplit
    ? getSafeNumberValue(booking.totalAmount)
    : chargeLines.reduce((sum, line) => sum + line.amount, 0);
  if (totalAmount <= 0) return null;

  const storeId = tenant?.smaregiStoreId;
  const contractId = tenant?.smaregiContractId;
  const terminalId = tenant?.smaregiTerminalId;
  if (!storeId || !contractId || !terminalId) return null;

  let paymentMethodId: string;
  let categoryId: string;
  try {
    [paymentMethodId, categoryId] = await Promise.all([
      resolvePrepaidPaymentMethodId(contractId),
      resolvePlayAreaCategoryId(contractId),
    ]);
  } catch (error) {
    logger.error(`[smaregi] failed to resolve prepaid payment method / category for booking ${booking.id}: ${((error as AxiosError)?.response?.data as { detail: string })?.detail}`);
    throw error;
  }

  const payload = buildConfirmedPayload(ticketName, chargeLines, storeId, paymentMethodId, fallbackSplit, categoryId);
  if (payload.details.length === 0 || Number(payload.total) <= 0) return null;

  let created: any;
  try {
    created = await createTransaction(contractId, terminalId, payload);
  } catch (error) {
    logger.error(`[smaregi] confirmed transaction creation failed for booking ${booking.id}: ${((error as AxiosError)?.response?.data as { detail: string })?.detail}`);
    throw error;
  }

  return {
    transactionHeadId: created?.transactionHeadId ? String(created.transactionHeadId) : "",
    total: Number(payload.total),
    rawPayload: created,
  };
};

/* ───────────────────────── Wiring confirmed sales into a checkout ───────────────────────── */

/** One booking's data needed to create its confirmed Smaregi sale after the checkout loop.
 * `bookingToUpdate` is where `smaregiConfirmedTransactionHeadId` gets persisted — the PARENT booking
 * when `booking` has one (a single stable row identifies the whole season pass across every
 * use-in-day.ts visit), or `booking` itself otherwise (Daily Online has no parent/child split). */
export type ConfirmedTransactionRequest = {
  booking: Booking;
  bookingToUpdate: Booking;
  ticketName: string;
  confirmedLines: CheckoutChargeLine[];
  fallbackSplit?: SmaregiConfirmedFallbackSplit;
};

/**
 * Decide what a booking's checkout-time charge lines mean for Smaregi.
 *
 * Prepaid-online tickets (Daily Online, Monthly/Yearly first-use, HourlyTimesLimit/DailyTimesLimit
 * first-use — see `.claude/docs/smaregi_pos_versions.md`) must NOT contribute their `kind: "base"`
 * lines to the shared 仮販売 batch, because that revenue was already collected via GMO at booking
 * time. Those lines come back as `request`, to create ONE confirmed sale for this booking instead.
 * Any other lines (e.g. HourlyTimesLimit overtime) still belong in the 仮販売 batch as normal.
 *
 * Monthly/Yearly/TimesLimit "first use" is NOT `isOnlineMonthlyBooking`/`isOnlineTimesLimitBooking`
 * (`parentBookingId === null`) — that row is only the online purchase record and is never actually
 * checked in/out. The booking that really flows through checkout is a CHILD booking created by
 * `use-in-day.ts` (`parentBookingId` set, same barCode as the purchase record), and `isFirstTimeUsingMonthlyTicket`
 * (computed by the caller via `checkIsFirstTimeUsingMonthlyTicket`) is what correctly marks the first
 * one of those to be checked out — see `.claude/docs/smaregi_pos_versions.md`.
 *
 * Idempotency is checked on `parentBooking` (the single stable row for the whole season pass), NOT on
 * `booking` (a fresh row is created for every use-in-day.ts visit, so checking `booking`'s own flag
 * would never actually block anything).
 *
 * Returns `request: null` when the booking isn't prepaid, or its pass already has a confirmed transaction.
 */
export const resolvePrepaidChargeLines = (
  booking: Booking,
  chargeLines: CheckoutChargeLine[] | null,
  isFirstTimeUsingMonthlyTicket: boolean,
  parentBooking: Booking,
): { temporaryChargeLines: CheckoutChargeLine[] | null; confirmedTransactionRequest: ConfirmedTransactionRequest | null } => {
  const isPrepaid =
    isOnlineOneDayBooking(booking as any) ||
    (isOnlineMonthlyTicket(booking.Ticket as any) && isFirstTimeUsingMonthlyTicket) ||
    (isOnlineTimesLimitTicket(booking.Ticket as any) && isFirstTimeUsingMonthlyTicket);

  if (!isPrepaid || !chargeLines?.length) {
    return { temporaryChargeLines: chargeLines, confirmedTransactionRequest: null };
  }

  const temporaryChargeLines = chargeLines.filter((line) => line.kind !== "base");
  if ((parentBooking as any).smaregiConfirmedTransactionHeadId) {
    return { temporaryChargeLines, confirmedTransactionRequest: null };
  }

  // Daily Online / DailyTimesLimit: checkout-time base is always 0 (already paid at booking), so
  // there's no real per-person amount to use — fall back to the unit price frozen on the booking
  // itself at booking time, minus the same bulk-quantity discount `getDailyBookingTotalPrices`/
  // `getTimesLimitBookingTotalPrices` (utils/booking.ts) applied when this booking was first priced.
  // Everyone else (Monthly/Yearly first-use, HourlyTimesLimit base): chargeLines[].amount already IS
  // the real per-person amount, so no fallback is needed.
  const ticketType = (booking.Ticket as any)?.type;
  const needsFallbackSplit = ([TicketType.Daily, TicketType.DailyTimesLimit] as string[]).includes(ticketType);
  let fallbackSplit: SmaregiConfirmedFallbackSplit | undefined;
  if (needsFallbackSplit) {
    const { adultDiscountDetails, childDiscountDetails } = calculateDiscountByQuantity(
      booking.adultQuantity,
      booking.childQuantity,
      booking.Ticket as any,
      booking.date,
    );
    fallbackSplit = {
      adultQuantity: booking.adultQuantity,
      adultUnitPrice: getSafeNumberValue(booking.adultPrice),
      adultDiscountDetails,
      childQuantity: booking.childQuantity,
      childUnitPrice: getSafeNumberValue(booking.childPrice),
      childDiscountDetails,
    };
  }

  return {
    temporaryChargeLines,
    confirmedTransactionRequest: {
      booking,
      bookingToUpdate: parentBooking,
      ticketName: booking.Ticket?.name ?? "",
      confirmedLines: chargeLines.filter((line) => line.kind === "base"),
      fallbackSplit,
    },
  };
};

/**
 * Create every confirmed sale gathered by `resolvePrepaidChargeLines` during a checkout — one per
 * booking. Same contract as `createSmaregiTemporaryTransaction`: throws on failure (aborting the
 * checkout transaction), because revenue must be recorded on Smaregi before checkout completes.
 * Pushes each created head id onto `createdConfirmedHeadIds` so the caller can cancel it if the DB
 * transaction later rolls back.
 */
export const syncConfirmedTransactionsForPrepaidBookings = async (
  requests: ConfirmedTransactionRequest[],
  tenant: Tenant,
  checkedOutAt: Date,
  tx: PrismaClient,
  createdConfirmedHeadIds: string[],
): Promise<void> => {
  if (!enabledTenantSmaregiSetting(tenant)) {
    throw new Error(ERROR_MESSAGES.MISSING_SMAREGI_CONFIG_FOR_TENANT);
  }

  for (const { booking, bookingToUpdate, ticketName, confirmedLines, fallbackSplit } of requests) {
    const result = await createSmaregiConfirmedTransaction(
      // Only the idempotency flag is read from bookingToUpdate (the parent, where it's persisted
      // below) — totalAmount/id stay the checking-out booking's own, unrelated to which row we save to.
      { ...(booking as any), smaregiConfirmedTransactionHeadId: (bookingToUpdate as any).smaregiConfirmedTransactionHeadId },
      ticketName,
      confirmedLines,
      tenant,
      fallbackSplit,
    );
    if (!result?.transactionHeadId) continue;

    createdConfirmedHeadIds.push(result.transactionHeadId);
    await tx.booking.update({
      where: { id: bookingToUpdate.id },
      data: {
        smaregiConfirmedTransactionHeadId: result.transactionHeadId,
        smaregiConfirmedTransactionAt: checkedOutAt,
        // Reset so a later cancel of THIS transaction isn't blocked by a stale flag left over
        // from a previous cycle's cancelled confirmed sale.
        smaregiConfirmedTransactionCancelledAt: null,
      },
    });
    // Its `created`/`canceled` webhooks always no-op (no 仮販売 mapping row to resolve it through),
    // so this is the only place that ever records the confirmed sale into the audit table.
    await tx.smaregiTransaction.create({
      data: {
        transactionHeadId: result.transactionHeadId,
        contractId: tenant.smaregiContractId,
        storeId: tenant.smaregiStoreId,
        action: SmaregiTransactionAction.Created,
        total: new Prisma.Decimal(result.total),
        rawPayload: result.rawPayload,
        affectedBookingIds: [bookingToUpdate.id],
        source: SmaregiTransactionSource.PrepaidBooking,
      },
    });
  }
};

/**
 * Best-effort cleanup when the checkout DB transaction rolls back AFTER one or more confirmed sales
 * were already created on Smaregi: cancel each one (it's a real, already-settled sale, not a pending
 * 仮販売 you can just delete). Never throws; logs on failure so the original error isn't masked.
 */
export const cancelConfirmedTransactionsAfterRollback = (
  contractId: string,
  headIds: string[],
): Promise<unknown> =>
  Promise.allSettled(
    headIds.map((id) =>
      cancelTransaction(contractId, id).catch((error) =>
        logger.error(`[smaregi] failed to cancel rolled-back confirmed transaction ${id}: ${((error as AxiosError)?.response?.data as { detail: string })?.detail}`),
      ),
    ),
  );

/**
 * Cancel the confirmed sale (確定販売) recorded on a season pass / one-day-online booking, when the
 * checkout that created it is being fully undone (Monthly/TimesLimit season-pass cascade cancel, or
 * first-checkout rollback of a prepaid booking — see `rollbackBookingFromSmaregi`).
 *
 * `parentBooking` is the row `smaregiConfirmedTransactionHeadId` is persisted on: the season-pass
 * parent for Monthly/TimesLimit, or the booking itself for Daily Online (no parent/child structure).
 *
 * Clears `smaregiConfirmedTransactionHeadId`/`At` so a later re-checkout is treated by
 * `resolvePrepaidChargeLines` as having no confirmed transaction yet, and creates a fresh one —
 * otherwise the season pass could never get a new 確定販売 after this one was cancelled.
 *
 * Idempotent via `smaregiConfirmedTransactionCancelledAt`, pre-marked before calling Smaregi so a
 * retry never double-cancels. Best-effort — never throws, only logs on failure.
 */
export const cancelConfirmedTransactionForBooking = async (
  contractId: string,
  parentBooking: { id: number; smaregiConfirmedTransactionHeadId: string | null; smaregiConfirmedTransactionCancelledAt: Date | null },
): Promise<void> => {
  if (!parentBooking.smaregiConfirmedTransactionHeadId || parentBooking.smaregiConfirmedTransactionCancelledAt) return;

  const headId = parentBooking.smaregiConfirmedTransactionHeadId;
  try {
    await prisma.booking.update({
      where: { id: parentBooking.id },
      data: { smaregiConfirmedTransactionCancelledAt: new Date(), smaregiConfirmedTransactionHeadId: null, smaregiConfirmedTransactionAt: null },
    });
    await cancelTransaction(contractId, headId);
  } catch (error) {
    const axiosError = error as AxiosError;
    logger.error(
      `[smaregi] failed to cancel confirmed transaction ${headId} for booking ${parentBooking.id}: `
      + `status=${axiosError?.response?.status} data=${JSON.stringify(axiosError?.response?.data)} message=${(error as Error)?.message}`
    );
  }
};

/**
 * Rollback the Smaregi 仮販売 (temporary transaction) side for a barCode group whose checkout is being
 * reverted. Scoped by barCode, not by booking — a barCode's 仮販売 is shared across every booking in
 * the group, so this only needs to be called ONCE per barCode (any booking in the group can be passed
 * as `bookingId`, just to resolve the barCode/tenant). Confirmed-sale (確定販売) cleanup for
 * individually-prepaid bookings (Daily Online, Monthly/TimesLimit first-use) is handled separately by
 * `rollbackConfirmedTransactionForBooking`, called once per booking — a single barCode can have more
 * than one prepaid booking, each with its own confirmed sale to undo.
 *
 * `isFirstCheckout` is true when this is the booking's very first checkout
 * (checkedInAt == firstCheckedInAt, or firstCheckedInAt was null).
 *
 * - First checkout: cancel ALL non-Cancelled 仮販売 for this barCode.
 * - Subsequent checkout: cancel ONLY the most recently created 仮販売 — that is always the
 *   current cycle's, since each cycle appends one new transaction via createSmaregiTemporaryTransaction.
 *
 * For each targeted 仮販売:
 *   - status=Completed (POS already settled it) → cancel the real transaction via settledTransactionHeadId.
 *   - status=Normal (still pending) → cancel the pending 仮販売 via changeTemporaryTransactionStatus.
 *
 * Best-effort — never throws.
 */
export const rollbackBookingFromSmaregi = async (
  bookingId: number,
  isFirstCheckout: boolean,
  reCheckinAt?: Date | null,
): Promise<void> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      barCode: true,
      Tenant: { select: { smaregiContractId: true } },
    },
  });
  if (!booking?.barCode) return;

  const contractId = booking.Tenant?.smaregiContractId;
  if (!contractId) return;

  // Resolve which 仮販売 rows belong to this rollback scope.
  // First checkout: cancel ALL non-Cancelled transactions for this barCode (safe; only one exists).
  // Subsequent checkout: cancel only the most recently created transaction — that is always the
  // current cycle's. Matching by checkedInAt timestamp is unreliable because the timestamp stored
  // at checkout comes from the first non-isSmaregiScanned booking, which may differ from the
  // timestamps on other bookings sharing the same barCode.
  let targets: Awaited<ReturnType<typeof prisma.smaregiTemporaryTransaction.findMany>>;
  if (isFirstCheckout) {
    targets = await prisma.smaregiTemporaryTransaction.findMany({
      where: { bookingBarCode: booking.barCode, status: { not: SmaregiTemporaryStatus.Cancelled } },
    });
  } else {
    // Only cancel transactions created during the current cycle (after re-check-in).
    // Without this guard, if the current cycle didn't create a new Smaregi transaction
    // (e.g. Daily Online already paid in cycle 1), the prior cycle's transaction would be
    // matched as "latest" and incorrectly cancelled.
    const latest = await prisma.smaregiTemporaryTransaction.findFirst({
      where: {
        bookingBarCode: booking.barCode,
        status: { not: SmaregiTemporaryStatus.Cancelled },
        ...(reCheckinAt ? { createdAt: { gte: reCheckinAt } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    targets = latest ? [latest] : [];
  }

  for (const temp of targets) {
    // settledTransactionHeadId column added by migration 20260709000000; cast until types regenerate.
    const settledHeadId = (temp as any).settledTransactionHeadId as string | null | undefined;
    try {
      // Pre-mark as Cancelled BEFORE calling the Smaregi API. This ensures that when Smaregi
      // fires a cancel webhook back to us, reverseSmaregiTransaction sees status=Cancelled and
      // skips the refund path — avoiding an unintended paymentStatus=Refunded on the bookings.
      await prisma.smaregiTemporaryTransaction.update({
        where: { id: temp.id },
        data: { status: SmaregiTemporaryStatus.Cancelled, deletedAt: new Date() },
      });
      if (temp.status === SmaregiTemporaryStatus.Completed && settledHeadId) {
        await cancelTransaction(contractId, settledHeadId);
      } else if (temp.temporaryTransactionHeadId) {
        await changeTemporaryTransactionStatus(contractId, temp.temporaryTransactionHeadId, SmaregiTemporaryTransactionStatus.Canceled);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error(
        `[smaregi] rollback failed for smaregi_temporary_transaction id=${temp.id} bookingId=${bookingId}: `
        + `status=${axiosError?.response?.status} data=${JSON.stringify(axiosError?.response?.data)} message=${(error as Error)?.message}`
      );
      await prisma.smaregiTemporaryTransaction.update({
        where: { id: temp.id },
        data: { syncError: ((axiosError?.response?.data as { detail: string })?.detail) ?? (error as Error)?.message ?? "rollback failed" },
      });
    }
  }
};

/**
 * Cancel the confirmed sale (確定販売) tied to a SPECIFIC checked-out booking, when the checkout that
 * created it is the one being rolled back. Unlike `rollbackBookingFromSmaregi` (one 仮販売 per
 * barCode), this must be called ONCE PER BOOKING — a single barCode can have more than one
 * independently-prepaid booking (e.g. a Daily Online ticket AND a Monthly-first-use ticket checked out
 * together), each with its own confirmed sale to undo.
 *
 * `isFirstCheckout` mirrors resolvePrepaidChargeLines' prepaid gate: only undo the confirmed sale when
 * this is the booking's very first checkout cycle (checkedInAt == firstCheckedInAt) — a later
 * re-check-in's checkout being rolled back must never touch a confirmed sale created earlier.
 *
 * Best-effort — never throws.
 */
export const rollbackConfirmedTransactionForBooking = async (
  bookingId: number,
  isFirstCheckout: boolean,
): Promise<void> => {
  if (!isFirstCheckout) return;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      parentBookingId: true,
      smaregiConfirmedTransactionHeadId: true,
      smaregiConfirmedTransactionCancelledAt: true,
      Ticket: { select: { type: true, paymentType: true } },
      Tenant: { select: { smaregiContractId: true } },
    },
  });
  if (!booking?.Ticket) return;

  const contractId = booking.Tenant?.smaregiContractId;
  if (!contractId) return;

  if (isOnlineOneDayBooking({ Ticket: booking.Ticket } as any)) {
    await cancelConfirmedTransactionForBooking(contractId, booking);
    return;
  }

  const isSeasonPassTicket = isOnlineMonthlyTicket(booking.Ticket as any) || isOnlineTimesLimitTicket(booking.Ticket as any);
  if (!isSeasonPassTicket || !booking.parentBookingId) return;

  // Runs after rollbackCheckedOutBookings already reverted this booking's checkedOutAt, so this
  // reduces to "no sibling one-day booking currently has a completed checkout" — i.e. it's safe to
  // undo the season pass's confirmed sale because nothing else depends on it anymore.
  const noSiblingStillCheckedOut = await checkIsFirstTimeUsingMonthlyTicket(booking as any);
  if (!noSiblingStillCheckedOut) return;

  const parentBooking = await prisma.booking.findUnique({
    where: { id: booking.parentBookingId },
    select: { id: true, smaregiConfirmedTransactionHeadId: true, smaregiConfirmedTransactionCancelledAt: true },
  });
  if (parentBooking) {
    await cancelConfirmedTransactionForBooking(contractId, parentBooking);
  }
};

/**
 * Best-effort Smaregi cleanup for a checkout-cancel: one 仮販売 rollback per barCode, then one
 * confirmed-transaction rollback per booking. Run sequentially (not Promise.all) — firing every
 * cancel concurrently bursts past Smaregi's rate limit (429 Too Many Requests) once a barCode has
 * several bookings each needing their own cancel call. Never throws.
 */
export const rollbackSmaregiForCheckoutCancel = async (
  temporaryTransactionTargets: { id: number; isFirstCheckout: boolean; reCheckinAt: Date | null }[],
  confirmedTransactionTargets: { id: number; isFirstCheckout: boolean }[],
): Promise<void> => {
  for (const { id, isFirstCheckout, reCheckinAt } of temporaryTransactionTargets) {
    await rollbackBookingFromSmaregi(id, isFirstCheckout, reCheckinAt);
  }
  for (const { id, isFirstCheckout } of confirmedTransactionTargets) {
    await rollbackConfirmedTransactionForBooking(id, isFirstCheckout);
  }
};

/**
 * Generate a Smaregi 端末取引ID (terminalTranId). Per the Smaregi API spec this field is required,
 * must be an integer string, and must be ≤ 10 characters — too short to fit a human-readable prefix
 * (e.g. barCode or booking id) AND stay unique once truncated, since an 8-digit barCode alone already
 * uses 8 of the 10 chars. Using the low-order 10 digits of the current epoch millisecond count instead
 * keeps it purely numeric, within the length limit, and unique across calls even when several
 * confirmed/temporary transactions are created back-to-back within the same request (each call is a
 * separate awaited network round-trip, so consecutive calls never land on the same millisecond).
 */
export const generateTerminalTranId = (): string => {
  return String(Date.now()).slice(-TERMINAL_TRAN_ID_MAX);
};

export const enabledTenantSmaregiSetting = (tenant: Tenant) => {
  return tenant.smaregiStoreId && tenant.smaregiContractId && tenant.allowedVersion === CHECK_IN_OUT_TENANT_VERSION;
};