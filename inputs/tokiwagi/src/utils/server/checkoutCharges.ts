import {
  ObicSourceField,
  PaymentType,
  TicketDetail,
  TicketType,
} from "@prisma/client";
import { orderBy } from "lodash";
import moment from "moment";

import {
  BookingSmaregiQRCodeInfo,
  ObicCodeInfo,
  ObicCodes,
  PriceInfo,
  SmaregiQRCodes,
} from "models/Booking";
import {
  DiscountSettingItem,
  HourlyExtraTimeDiscountSetting,
  HourlyExtraTimeInfos,
} from "models/Discount";
import {
  calculateDiscountByQuantity,
  calculateExtraTimeDiscountForTicket,
  calculateNumberOfExtraTimeBlocks,
  isEnableDiscountTicket,
  isEnableExtraTimeDiscountHourlyTicket,
} from "utils/discount";
import { getSafeNumberValue } from "utils/number";
import {
  SmaregiAudienceLetter,
  SmaregiBarcodeKindLetter,
} from "services/smaregi/smaregi.const";

/**
 * Single source of truth for what a fully checked-out booking is charged, per person.
 *
 * `calculateCheckoutCharges` computes one `CheckoutChargeLine` per person carrying:
 *   - `amount`                                — the per-person accounting amount (used for OBIC)
 *   - `salesPrice`                            — the per-person amount sent to Smaregi; 0 for Monthly and
 *                                               Online-payment tickets (already paid at booking time)
 *   - `qrUrl`                                 — the Smaregi QR-code image url from the ticket DB columns
 *   - `obicCode` / `sourceField` / `sourceTierIndex` — the OBIC ledger fields
 *   - `smaregiBarcode`                        — the calculated Smaregi product code (synced barcode)
 *
 * Projections off the result, all driven inside performCheckOut:
 *   - `toSmaregiQRCodes(lines)` → `SmaregiQRCodes` persisted on `Booking.smaregiQRCodes` (`{ qrUrl, amount }`).
 *   - `toObicCodes(lines)`      → `ObicCodes` flattened into the BookingObicCode ledger.
 *   - the 仮販売 details (see `buildTemporaryPayload`) — one details row per charge line.
 *
 * Pricing rules (unchanged): Monthly 1st visit = real price + merged discount; Monthly recurring = 0;
 * online daily base = 0 (discount merged); offline daily/hourly = real base; hourly adds extended
 * period (per person × block) and hourly extra-time discount (negative, per block).
 */

export type ChargeKind =
  | "base"
  | "extendedPeriod"
  | "discount"
  | "hourlyExtraTimeDiscount";
export type ChargeAudience = "adult" | "child";

export interface CheckoutChargeLine {
  kind: ChargeKind;
  audience: ChargeAudience;
  amount: number; // per-person accounting amount (used for OBIC)
  salesPrice: number; // per-person amount sent to Smaregi; 0 for Monthly/Online (pre-paid at booking time)
  qrUrl: string; // Smaregi QR-code image url (from ticket DB columns)
  obicCode: string;
  sourceField: ObicSourceField;
  sourceTierIndex?: number;
  smaregiBarcode: string; // calculated per-person Smaregi productCode, assigned by finalizeCharges
}

/** A line before its per-person Smaregi barcode and salesPrice are assigned (builders produce these). */
type ChargeLineDraft = Omit<
  CheckoutChargeLine,
  "smaregiBarcode" | "salesPrice"
>;

/* ───────────────────────── line builders ───────────────────────── */

type LineSpec = Omit<ChargeLineDraft, "kind" | "audience">;

const makeLines = (
  quantity: number,
  audience: ChargeAudience,
  kind: ChargeKind,
  spec: LineSpec,
): ChargeLineDraft[] =>
  Array.from({ length: Math.max(0, quantity) }, () => ({
    kind,
    audience,
    ...spec,
  }));

const makeLinesPerBlock = (
  quantity: number,
  blocks: number,
  audience: ChargeAudience,
  kind: ChargeKind,
  spec: LineSpec,
): ChargeLineDraft[] =>
  Array.from({ length: Math.max(0, quantity) * Math.max(0, blocks) }, () => ({
    kind,
    audience,
    ...spec,
  }));

const getDiscountSettingItemWithIndex = (
  order: number,
  settingItems: DiscountSettingItem[],
): { item: DiscountSettingItem; index: number } | null => {
  if (!settingItems?.length) return null;
  const sorted = orderBy(settingItems, ["threshold"], ["asc"]);
  let selected: DiscountSettingItem = null;
  let selectedOriginalIndex = -1;
  for (const item of sorted) {
    if (order >= item.threshold) {
      selected = item;
      selectedOriginalIndex = settingItems.indexOf(item);
    } else break;
  }
  if (!selected) return null;
  return { item: selected, index: selectedOriginalIndex };
};

type AudienceBaseConfig = {
  qrUrl: string;
  obicCode: string;
  price: number;
  baseSourceField: ObicSourceField;
  discountSourceField: ObicSourceField;
};

/**
 * Build base lines for one audience, merging any per-person discount into the same line
 * (discounted person → discount-tier url/code + reduced amount). Mirrors the legacy V2 behaviour.
 */
const buildAudienceBaseLines = (
  audience: ChargeAudience,
  quantity: number,
  accumulatedBefore: number,
  config: AudienceBaseConfig,
  discountDetails: Record<number, number>,
  settingItems: DiscountSettingItem[],
): ChargeLineDraft[] => {
  const lines: ChargeLineDraft[] = [];
  for (let i = 1; i <= quantity; i++) {
    const discountAmount = discountDetails[i] ?? 0;
    if (discountAmount > 0) {
      const result = getDiscountSettingItemWithIndex(
        i + accumulatedBefore,
        settingItems,
      );
      const item = result?.item as any;
      lines.push({
        kind: "base",
        audience,
        amount: config.price - discountAmount,
        qrUrl: String(
          (audience === "adult"
            ? item?.adultSmaregiQRCodeUrl
            : item?.childSmaregiQRCodeUrl) ?? "",
        ),
        obicCode: String(
          (audience === "adult" ? item?.adultObicCode : item?.childObicCode) ??
          "",
        ),
        sourceField: config.discountSourceField,
        sourceTierIndex: result?.index ?? 0,
      });
    } else {
      lines.push({
        kind: "base",
        audience,
        amount: config.price,
        qrUrl: config.qrUrl,
        obicCode: config.obicCode,
        sourceField: config.baseSourceField,
      });
    }
  }
  return lines;
};

const buildMergedBaseLines = (
  booking: any,
  sameTicketBookings: any[],
  adult: AudienceBaseConfig,
  child: AudienceBaseConfig,
): ChargeLineDraft[] => {
  const { Ticket, date } = booking;

  // Accumulate earlier same-ticket quantities so threshold-based discount tiers line up.
  const sorted = orderBy(sameTicketBookings, ["id"], ["asc"]);
  let accAdult = 0;
  let accChild = 0;
  for (const b of sorted) {
    if (b.id === booking.id) break;
    accAdult += b.adultQuantity;
    accChild += b.childQuantity;
  }

  const settingItems = orderBy(
    Ticket.TicketDiscountSetting?.setting as DiscountSettingItem[],
    ["threshold"],
    ["asc"],
  );

  let adultDiscountDetails: Record<number, number> = {};
  let childDiscountDetails: Record<number, number> = {};
  if (isEnableDiscountTicket(Ticket)) {
    const discountInfo = calculateDiscountByQuantity(
      booking.adultQuantity,
      booking.childQuantity,
      Ticket,
      date,
      accAdult,
      accChild,
    );
    adultDiscountDetails =
      (discountInfo.adultDiscountDetails as Record<number, number>) || {};
    childDiscountDetails =
      (discountInfo.childDiscountDetails as Record<number, number>) || {};
  }

  return [
    ...buildAudienceBaseLines(
      "adult",
      booking.adultQuantity,
      accAdult,
      adult,
      adultDiscountDetails,
      settingItems,
    ),
    ...buildAudienceBaseLines(
      "child",
      booking.childQuantity,
      accChild,
      child,
      childDiscountDetails,
      settingItems,
    ),
  ];
};

/* ───────────────────────── Smaregi barcode assignment ───────────────────────── */

const CHARGE_KIND_LETTER: Record<ChargeKind, SmaregiBarcodeKindLetter> = {
  base: SmaregiBarcodeKindLetter.Base,
  extendedPeriod: SmaregiBarcodeKindLetter.ExtendedPeriod,
  discount: SmaregiBarcodeKindLetter.Discount,
  hourlyExtraTimeDiscount: SmaregiBarcodeKindLetter.HourlyExtraTimeDiscount,
};

const CHARGE_AUDIENCE_LETTER: Record<ChargeAudience, SmaregiAudienceLetter> = {
  adult: SmaregiAudienceLetter.Adult,
  child: SmaregiAudienceLetter.Child,
};

/** productCode = `<barCode>_<audienceLetter><kindLetter><index>` — unique per person, <= 20 chars. */
export const buildSmaregiBarcode = (
  barCode: string,
  kind: ChargeKind,
  audience: ChargeAudience,
  index: number,
): string =>
  `${barCode}_${CHARGE_AUDIENCE_LETTER[audience]}${CHARGE_KIND_LETTER[kind]}${index}`;

/**
 * Assign each draft its per-person Smaregi barcode (index runs per kind+audience) and `salesPrice`.
 * Pass `zeroSalesPrice = true` for Monthly and Online-payment tickets — they are pre-paid at booking
 * time and must not generate an additional Smaregi payment transaction.
 */
const finalizeCharges = (
  drafts: ChargeLineDraft[] | null,
  barCode: string,
  zeroSalesPrice = false,
): CheckoutChargeLine[] | null => {
  if (!drafts) return null;
  const counters = new Map<string, number>();
  return drafts.map((draft) => {
    const scope = `${draft.kind}|${draft.audience}`;
    const index = counters.get(scope) ?? 0;
    counters.set(scope, index + 1);
    return {
      ...draft,
      salesPrice: zeroSalesPrice ? 0 : draft.amount,
      smaregiBarcode: buildSmaregiBarcode(
        barCode,
        draft.kind,
        draft.audience,
        index,
      ),
    };
  });
};

/* ───────────────────────── main calculator ───────────────────────── */

export function calculateCheckoutCharges(
  booking: any,
  sameTicketBookings: any[],
  checkedOutAt: Date,
  parentBooking: any,
  isFirstTimeUsingMonthlyTicket: boolean,
): CheckoutChargeLine[] | null {
  const { Ticket, TicketBookingSchedule: tbs } = booking;
  if (!Ticket) return null;

  const ticketDetail = Ticket.TicketDetail as TicketDetail;
  const ticketType: string = Ticket.type;
  const paymentType: string = Ticket.paymentType;

  let adultQuantity = booking.adultQuantity;
  let childQuantity = booking.childQuantity;
  let bookingForDiscount: any = booking;
  let sameTicketBookingsForDiscount: any[] = sameTicketBookings;
  if (isFirstTimeUsingMonthlyTicket) {
    parentBooking.adultQuantity = booking.adultQuantity;
    childQuantity = parentBooking.childQuantity;
    bookingForDiscount = parentBooking;
    sameTicketBookingsForDiscount = [parentBooking];
  }

  /* ── Monthly ticket ── */
  if (ticketType === TicketType.Monthly) {
    if (isFirstTimeUsingMonthlyTicket) {
      const adultPrice = getSafeNumberValue(ticketDetail?.adultPrice);
      const childPrice = getSafeNumberValue(ticketDetail?.childPrice);
      return finalizeCharges(
        buildMergedBaseLines(
          bookingForDiscount,
          sameTicketBookingsForDiscount,
          {
            qrUrl:
              ticketDetail?.adultSmaregiQRCodeUrl1stBooking ??
              ticketDetail?.adultSmaregiQRCodeUrl,
            obicCode:
              ticketDetail?.adultObicCode1stBooking ??
              ticketDetail?.adultObicCode,
            price: adultPrice,
            baseSourceField: ObicSourceField.TD_adultObicCode1stBooking,
            discountSourceField: ObicSourceField.TDS_discountTier_adultObicCode,
          },
          {
            qrUrl: ticketDetail?.childSmaregiQRCodeUrl1stBooking ?? "",
            obicCode: ticketDetail?.childObicCode1stBooking ?? "",
            price: childPrice,
            baseSourceField: ObicSourceField.TD_childObicCode1stBooking,
            discountSourceField: ObicSourceField.TDS_discountTier_childObicCode,
          },
        ),
        booking.barCode,
        true,
      );
    }
    // Recurring visits: 0 yen (monthly fee already covers entry).
    return finalizeCharges(
      [
        ...makeLines(adultQuantity, "adult", "base", {
          qrUrl: ticketDetail?.adultSmaregiQRCodeUrl ?? "",
          obicCode: ticketDetail?.adultObicCode ?? "",
          amount: 0,
          sourceField: ObicSourceField.TD_adultObicCode,
        }),
        ...makeLines(childQuantity, "child", "base", {
          qrUrl: ticketDetail?.childSmaregiQRCodeUrl ?? "",
          obicCode: ticketDetail?.childObicCode ?? "",
          amount: 0,
          sourceField: ObicSourceField.TD_childObicCode,
        }),
      ],
      booking.barCode,
      true,
    );
  }

  /* ── Online daily (base = 0, discount merged per person) ── */
  if (
    ([TicketType.Daily, TicketType.DailyTimesLimit] as string[]).includes(
      ticketType,
    ) &&
    paymentType === PaymentType.Online
  ) {
    return finalizeCharges(
      buildMergedBaseLines(
        bookingForDiscount,
        sameTicketBookingsForDiscount,
        {
          qrUrl: tbs?.baseAdultSmaregiQRCodeUrl ?? "",
          obicCode: tbs?.baseAdultObicCode ?? "",
          price: 0,
          baseSourceField: ObicSourceField.TBS_baseAdultObicCode,
          discountSourceField: ObicSourceField.TDS_discountTier_adultObicCode,
        },
        {
          qrUrl: tbs?.baseChildSmaregiQRCodeUrl ?? "",
          obicCode: tbs?.baseChildObicCode ?? "",
          price: 0,
          baseSourceField: ObicSourceField.TBS_baseChildObicCode,
          discountSourceField: ObicSourceField.TDS_discountTier_childObicCode,
        },
      ),
      booking.barCode,
      true,
    );
  }

  /* ── Offline daily (real base price, discount merged) ── */
  if (
    ([TicketType.Daily, TicketType.DailyTimesLimit] as string[]).includes(
      ticketType,
    )
  ) {
    return finalizeCharges(
      buildMergedBaseLines(
        booking,
        sameTicketBookings,
        {
          qrUrl: tbs?.baseAdultSmaregiQRCodeUrl ?? "",
          obicCode: tbs?.baseAdultObicCode ?? "",
          price: getSafeNumberValue(tbs?.baseAdultPeriodPrice),
          baseSourceField: ObicSourceField.TBS_baseAdultObicCode,
          discountSourceField: ObicSourceField.TDS_discountTier_adultObicCode,
        },
        {
          qrUrl: tbs?.baseChildSmaregiQRCodeUrl ?? "",
          obicCode: tbs?.baseChildObicCode ?? "",
          price: getSafeNumberValue(tbs?.baseChildPeriodPrice),
          baseSourceField: ObicSourceField.TBS_baseChildObicCode,
          discountSourceField: ObicSourceField.TDS_discountTier_childObicCode,
        },
      ),
      booking.barCode,
    );
  }

  /* ── Hourly (base + extended period + hourly extra-time discount) ── */
  if (
    ([TicketType.Hourly, TicketType.HourlyTimesLimit] as string[]).includes(
      ticketType,
    )
  ) {
    return finalizeCharges(
      buildHourlyLines(booking, sameTicketBookings, checkedOutAt, tbs),
      booking.barCode,
    );
  }

  return null;
}

const buildHourlyLines = (
  booking: any,
  sameTicketBookings: any[],
  checkedOutAt: Date,
  tbs: any,
): ChargeLineDraft[] => {
  const { Ticket } = booking;
  const adultPrice = getSafeNumberValue(tbs?.baseAdultPeriodPrice);
  const childPrice = getSafeNumberValue(tbs?.baseChildPeriodPrice);
  const extAdultPrice = getSafeNumberValue(tbs?.extendedAdultPeriodPrice);
  const extChildPrice = getSafeNumberValue(tbs?.extendedChildPeriodPrice);
  const hasExtended = !!(tbs?.extendedAdultPeriod || tbs?.extendedChildPeriod);

  const partialCheckouts = (booking.PartialCheckout ?? []).filter(
    (p: any) => !p.deleted,
  );
  const partialAdultQty = partialCheckouts
    .filter((p: any) => p.isAdult)
    .reduce((acc: number, p: any) => acc + p.quantity, 0);
  const partialChildQty = partialCheckouts
    .filter((p: any) => !p.isAdult)
    .reduce((acc: number, p: any) => acc + p.quantity, 0);
  const remainingAdult = (booking?.adultQuantity ?? 0) - partialAdultQty;
  const remainingChild = (booking?.childQuantity ?? 0) - partialChildQty;

  const lines: ChargeLineDraft[] = buildMergedBaseLines(
    booking,
    sameTicketBookings,
    {
      qrUrl: tbs?.baseAdultSmaregiQRCodeUrl ?? "",
      obicCode: tbs?.baseAdultObicCode ?? "",
      price: adultPrice,
      baseSourceField: ObicSourceField.TBS_baseAdultObicCode,
      discountSourceField: ObicSourceField.TDS_discountTier_adultObicCode,
    },
    {
      qrUrl: tbs?.baseChildSmaregiQRCodeUrl ?? "",
      obicCode: tbs?.baseChildObicCode ?? "",
      price: childPrice,
      baseSourceField: ObicSourceField.TBS_baseChildObicCode,
      discountSourceField: ObicSourceField.TDS_discountTier_childObicCode,
    },
  );

  if (!hasExtended) return lines;

  const checkedInAt = moment(booking.checkedInAt).second(0);
  const adultPriceInfo: PriceInfo = {
    basePeriod: getSafeNumberValue(tbs?.baseAdultPeriod),
    basePeriodUnit: tbs?.baseAdultPeriodUnit,
    basePeriodPrice: adultPrice,
    extendedPeriod: getSafeNumberValue(tbs?.extendedAdultPeriod),
    extendedPeriodUnit: tbs?.extendedAdultPeriodUnit,
    extendedPeriodPrice: extAdultPrice,
  };
  const childPriceInfo: PriceInfo = {
    basePeriod: getSafeNumberValue(tbs?.baseChildPeriod),
    basePeriodUnit: tbs?.baseChildPeriodUnit,
    basePeriodPrice: childPrice,
    extendedPeriod: getSafeNumberValue(tbs?.extendedChildPeriod),
    extendedPeriodUnit: tbs?.extendedChildPeriodUnit,
    extendedPeriodPrice: extChildPrice,
  };

  const extAdultUrl = tbs?.extendedAdultSmaregiQRCodeUrl ?? "";
  const extChildUrl = tbs?.extendedChildSmaregiQRCodeUrl ?? "";
  const extAdultObic = tbs?.extendedAdultObicCode ?? "";
  const extChildObic = tbs?.extendedChildObicCode ?? "";

  const extAdultLines: ChargeLineDraft[] = [];
  const extChildLines: ChargeLineDraft[] = [];

  // Extended lines for already partial-checked-out people (per person × block).
  for (const pc of partialCheckouts) {
    const partialUsageTime = moment
      .duration(moment(pc.checkedOutAt).diff(checkedInAt))
      .asMinutes();
    if (pc.isAdult) {
      const blocks = calculateNumberOfExtraTimeBlocks(
        partialUsageTime,
        adultPriceInfo,
      );
      extAdultLines.push(
        ...makeLinesPerBlock(pc.quantity, blocks, "adult", "extendedPeriod", {
          qrUrl: extAdultUrl,
          obicCode: extAdultObic,
          amount: extAdultPrice,
          sourceField: ObicSourceField.TBS_extendedAdultObicCode,
        }),
      );
    } else {
      const blocks = calculateNumberOfExtraTimeBlocks(
        partialUsageTime,
        childPriceInfo,
      );
      extChildLines.push(
        ...makeLinesPerBlock(pc.quantity, blocks, "child", "extendedPeriod", {
          qrUrl: extChildUrl,
          obicCode: extChildObic,
          amount: extChildPrice,
          sourceField: ObicSourceField.TBS_extendedChildObicCode,
        }),
      );
    }
  }

  // Extended lines for the remaining people checked out now.
  const totalUsageTime = moment
    .duration(moment(checkedOutAt).diff(checkedInAt))
    .asMinutes();
  const adultExtBlocks = calculateNumberOfExtraTimeBlocks(
    totalUsageTime,
    adultPriceInfo,
  );
  const childExtBlocks = calculateNumberOfExtraTimeBlocks(
    totalUsageTime,
    childPriceInfo,
  );
  extAdultLines.push(
    ...makeLinesPerBlock(
      remainingAdult,
      adultExtBlocks,
      "adult",
      "extendedPeriod",
      {
        qrUrl: extAdultUrl,
        obicCode: extAdultObic,
        amount: extAdultPrice,
        sourceField: ObicSourceField.TBS_extendedAdultObicCode,
      },
    ),
  );
  extChildLines.push(
    ...makeLinesPerBlock(
      remainingChild,
      childExtBlocks,
      "child",
      "extendedPeriod",
      {
        qrUrl: extChildUrl,
        obicCode: extChildObic,
        amount: extChildPrice,
        sourceField: ObicSourceField.TBS_extendedChildObicCode,
      },
    ),
  );

  lines.push(...extAdultLines, ...extChildLines);

  /* ── Hourly extra-time discount (negative amount, per block) ── */
  if (isEnableExtraTimeDiscountHourlyTicket(Ticket)) {
    lines.push(
      ...buildHourlyExtraTimeDiscountLines(
        booking,
        partialCheckouts,
        checkedInAt,
        {
          adultPriceInfo,
          childPriceInfo,
          remainingAdult,
          remainingChild,
          adultExtBlocks,
          childExtBlocks,
        },
      ),
    );
  }

  return lines;
};

type HourlyDiscountContext = {
  adultPriceInfo: PriceInfo;
  childPriceInfo: PriceInfo;
  remainingAdult: number;
  remainingChild: number;
  adultExtBlocks: number;
  childExtBlocks: number;
};

const buildHourlyExtraTimeDiscountLines = (
  booking: any,
  partialCheckouts: any[],
  checkedInAt: moment.Moment,
  ctx: HourlyDiscountContext,
): ChargeLineDraft[] => {
  const { Ticket } = booking;
  const hourlyExtraTimeInfos: HourlyExtraTimeInfos = { [booking.id]: [] };

  for (const pc of partialCheckouts) {
    const partialUsageTime = moment
      .duration(moment(pc.checkedOutAt).diff(checkedInAt))
      .asMinutes();
    const priceInfo = pc.isAdult ? ctx.adultPriceInfo : ctx.childPriceInfo;
    hourlyExtraTimeInfos[booking.id].push({
      adultQuantity: pc.isAdult ? pc.quantity : 0,
      childQuantity: !pc.isAdult ? pc.quantity : 0,
      numberOfExtraTimeBlocks: calculateNumberOfExtraTimeBlocks(
        partialUsageTime,
        priceInfo,
      ),
    });
  }

  hourlyExtraTimeInfos[booking.id].push(
    {
      adultQuantity: ctx.remainingAdult,
      childQuantity: 0,
      numberOfExtraTimeBlocks: ctx.adultExtBlocks,
    },
    {
      adultQuantity: 0,
      childQuantity: ctx.remainingChild,
      numberOfExtraTimeBlocks: ctx.childExtBlocks,
    },
  );

  const extraTimeDiscount = calculateExtraTimeDiscountForTicket(
    [booking],
    hourlyExtraTimeInfos,
    {
      adult: ctx.adultPriceInfo.extendedPeriodPrice,
      child: ctx.childPriceInfo.extendedPeriodPrice,
    },
  );
  if (
    !(
      extraTimeDiscount.adultDiscountAmount > 0 ||
      extraTimeDiscount.childDiscountAmount > 0
    )
  ) {
    return [];
  }

  const hourlyExtraTimeSetting = Ticket.TicketDiscountSetting
    ?.hourlyExtraTimeSetting as HourlyExtraTimeDiscountSetting;
  const hourlySettingItems = orderBy(
    hourlyExtraTimeSetting?.setting as DiscountSettingItem[],
    ["threshold"],
    ["asc"],
  );

  const buildAudienceDiscountLines = (
    audience: ChargeAudience,
    details: any[],
    sourceField: ObicSourceField,
  ): ChargeLineDraft[] => {
    const lines: ChargeLineDraft[] = [];
    (details || []).forEach((item: any) => {
      const discountAmount = item.discountAmount;
      if (!(discountAmount > 0)) {
        return;
      }
      const result = getDiscountSettingItemWithIndex(
        item.order,
        hourlySettingItems,
      );
      const settingItem = result?.item as any;
      const blocks = item.numberOfExtraTimeBlocks || 1;
      const discountPerBlock = discountAmount / blocks;
      for (let i = 0; i < blocks; i++) {
        lines.push({
          kind: "hourlyExtraTimeDiscount",
          audience,
          amount: -discountPerBlock,
          qrUrl: String(
            (audience === "adult"
              ? settingItem?.adultSmaregiQRCodeUrl
              : settingItem?.childSmaregiQRCodeUrl) ?? "",
          ),
          obicCode: String(
            (audience === "adult"
              ? settingItem?.adultObicCode
              : settingItem?.childObicCode) ?? "",
          ),
          sourceField,
          sourceTierIndex: result?.index ?? 0,
        });
      }
    });
    return lines;
  };

  return [
    ...buildAudienceDiscountLines(
      "adult",
      extraTimeDiscount.adultDiscountDetails,
      ObicSourceField.TDS_hourlyExtraTime_adultObicCode,
    ),
    ...buildAudienceDiscountLines(
      "child",
      extraTimeDiscount.childDiscountDetails,
      ObicSourceField.TDS_hourlyExtraTime_childObicCode,
    ),
  ];
};

/* ───────────────────────── helpers ───────────────────────── */

export const sumSalesPrice = (lines: CheckoutChargeLine[]): number =>
  lines.reduce((sum, l) => sum + l.salesPrice, 0);

/* ───────────────────────── projections ───────────────────────── */

const linesOf = (
  lines: CheckoutChargeLine[],
  kind: ChargeKind,
  audience: ChargeAudience,
) => lines.filter((l) => l.kind === kind && l.audience === audience);

const hasGroup = (lines: CheckoutChargeLine[], kind: ChargeKind) =>
  lines.some((l) => l.kind === kind);

/** Project lines to the ObicCodes structure consumed by flattenObicCodesForLedger. */
export const toObicCodes = (
  lines: CheckoutChargeLine[] | null,
): ObicCodes | null => {
  if (!lines) return null;
  const group = (kind: ChargeKind): ObicCodeInfo => ({
    adult: linesOf(lines, kind, "adult").map((l) => ({
      obicCode: l.obicCode,
      amount: l.amount,
      sourceField: l.sourceField,
      sourceTierIndex: l.sourceTierIndex,
    })),
    child: linesOf(lines, kind, "child").map((l) => ({
      obicCode: l.obicCode,
      amount: l.amount,
      sourceField: l.sourceField,
      sourceTierIndex: l.sourceTierIndex,
    })),
  });

  const result: ObicCodes = { base: group("base") };
  if (hasGroup(lines, "extendedPeriod"))
    result.extendedPeriod = group("extendedPeriod");
  if (hasGroup(lines, "discount")) result.discount = group("discount");
  if (hasGroup(lines, "hourlyExtraTimeDiscount"))
    result.hourlyExtraTimeDiscount = group("hourlyExtraTimeDiscount");
  return result;
};

/** Project lines to the SmaregiQRCodes structure persisted on `Booking.smaregiQRCodes` ({ qrUrl, amount }). */
export const toSmaregiQRCodes = (
  lines: CheckoutChargeLine[] | null,
): SmaregiQRCodes | null => {
  if (!lines) return null;
  const group = (kind: ChargeKind): BookingSmaregiQRCodeInfo => ({
    adult: linesOf(lines, kind, "adult").map((l) => ({
      qrUrl: l.qrUrl,
      amount: l.amount,
    })),
    child: linesOf(lines, kind, "child").map((l) => ({
      qrUrl: l.qrUrl,
      amount: l.amount,
    })),
  });

  const result: SmaregiQRCodes = { base: group("base") };
  if (hasGroup(lines, "extendedPeriod"))
    result.extendedPeriod = group("extendedPeriod");
  if (hasGroup(lines, "discount")) result.discount = group("discount");
  if (hasGroup(lines, "hourlyExtraTimeDiscount"))
    result.hourlyExtraTimeDiscount = group("hourlyExtraTimeDiscount");
  return result;
};
