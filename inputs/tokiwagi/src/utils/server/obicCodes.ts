import { BookingStatus, ObicSourceField, Prisma } from "@prisma/client";

import prisma from "utils/db";
import { ObicCodes } from "models/Booking";
import { checkIsFirstTimeUsingMonthlyTicket } from "utils/server/booking";
import { calculateCheckoutCharges, toObicCodes } from "utils/server/checkoutCharges";

/* ─────────────────────────────────────────────────────────
   Public: calculateObicCodesV2

   Thin projection over the single source of truth (calculateCheckoutCharges).
   Kept as a named export for existing call sites (pos checkout, force-recompute).
───────────────────────────────────────────────────────── */

export function calculateObicCodesV2(
  booking: any,
  sameTicketBookings: any[],
  checkedOutAt: Date,
  parentBooking: any,
  isFirstTimeUsingMonthlyTicket: boolean,
): ObicCodes | null {
  const lines = calculateCheckoutCharges(
    booking,
    sameTicketBookings,
    checkedOutAt,
    parentBooking,
    isFirstTimeUsingMonthlyTicket,
  );
  return toObicCodes(lines);
}

/* ─────────────────────────────────────────────────────────
   Public: flattenObicCodesForLedger
───────────────────────────────────────────────────────── */

const KIND_ORDER = ["base", "extendedPeriod", "discount", "hourlyExtraTimeDiscount"] as const;
type KindKey = typeof KIND_ORDER[number];

const KIND_TO_ENUM: Record<KindKey, string> = {
  base: "Base",
  extendedPeriod: "ExtendedPeriod",
  discount: "Discount",
  hourlyExtraTimeDiscount: "HourlyExtraTimeDiscount",
};

function collapseObicRows(
  rows: Prisma.BookingObicCodeCreateManyInput[],
): Prisma.BookingObicCodeCreateManyInput[] {
  // Merge rows that are identical in every dimension except quantity.
  // Map preserves insertion order, so original ordering is maintained.
  const seen = new Map<string, Prisma.BookingObicCodeCreateManyInput>();
  for (const row of rows) {
    const key = `${row.kind}|${row.audience}|${row.obicCode}|${row.sourceField}|${row.sourceTierIndex ?? ""}`;
    const existing = seen.get(key);
    if (existing) {
      (existing.quantity as number) = (existing.quantity as number) + (row.quantity as number);
      (existing.amount as number) = (existing.amount as number) + (row.amount as number);
    } else {
      seen.set(key, { ...row });
    }
  }

  // Re-assign lineIndex sequentially within each (kind, audience) scope.
  const counters = new Map<string, number>();
  const result: Prisma.BookingObicCodeCreateManyInput[] = [];
  for (const row of Array.from(seen.values())) {
    const scope = `${row.kind}|${row.audience}`;
    const idx = counters.get(scope) ?? 0;
    counters.set(scope, idx + 1);
    result.push({ ...row, lineIndex: idx });
  }
  return result;
}

export function flattenObicCodesForLedger(
  codes: ObicCodes | null,
  bookingId: number,
  revision: number,
  computedAt: Date,
): Prisma.BookingObicCodeCreateManyInput[] {
  if (!codes) return [];
  const rows: Prisma.BookingObicCodeCreateManyInput[] = [];
  for (const kind of KIND_ORDER) {
    const group = codes[kind];
    if (!group) continue;
    (["adult", "child"] as const).forEach((audience) => {
      (group[audience] ?? []).forEach((entry, lineIndex) => {
        const code = (entry.obicCode ?? "").trim();
        rows.push({
          bookingId,
          kind: KIND_TO_ENUM[kind] as any,
          audience: audience === "adult" ? "Adult" : "Child",
          obicCode: code,
          sourceField: entry.sourceField as any,
          sourceTierIndex: entry.sourceTierIndex ?? null,
          amount: entry.amount,
          quantity: 1,
          lineIndex,
          isPending: code === "",
          revision,
          computedAt,
        });
      });
    });
  }
  return collapseObicRows(rows);
}

export function summarizePendingObic(rows: Prisma.BookingObicCodeCreateManyInput[]) {
  const pending = rows.filter((r) => r.isPending);
  const breakdown = pending.reduce<Record<string, number>>((acc, r) => {
    const k = `${r.kind}.${r.audience}.${r.sourceField}`;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  return { total: rows.length, pendingCount: pending.length, breakdown };
}

/* ─────────────────────────────────────────────────────────
   Public: diffObicCodes
───────────────────────────────────────────────────────── */

export type ObicCodeChange = {
  source: ObicSourceField;
  tierIndex?: number;
  before: string;
  after: string;
  changeKind: "empty-to-filled" | "filled-to-different" | "filled-to-empty";
};

const classifyChange = (before: string, after: string): ObicCodeChange["changeKind"] | null => {
  const b = (before ?? "").trim();
  const a = (after ?? "").trim();
  if (b === a) return null;
  if (b === "" && a !== "") return "empty-to-filled";
  if (b !== "" && a === "") return "filled-to-empty";
  return "filled-to-different";
};

export function diffObicCodes(oldTicket: any, newTicket: any): ObicCodeChange[] {
  const changes: ObicCodeChange[] = [];

  const flatPairs: [ObicSourceField, string, string][] = [
    [ObicSourceField.TD_adultObicCode, oldTicket.TicketDetail?.adultObicCode, newTicket.TicketDetail?.adultObicCode],
    [ObicSourceField.TD_adultObicCode1stBooking, oldTicket.TicketDetail?.adultObicCode1stBooking, newTicket.TicketDetail?.adultObicCode1stBooking],
    [ObicSourceField.TD_childObicCode, oldTicket.TicketDetail?.childObicCode, newTicket.TicketDetail?.childObicCode],
    [ObicSourceField.TD_childObicCode1stBooking, oldTicket.TicketDetail?.childObicCode1stBooking, newTicket.TicketDetail?.childObicCode1stBooking],
    [ObicSourceField.TD_discountAdultObicCode, oldTicket.TicketDetail?.discountAdultObicCode, newTicket.TicketDetail?.discountAdultObicCode],
    [ObicSourceField.TD_discountChildObicCode, oldTicket.TicketDetail?.discountChildObicCode, newTicket.TicketDetail?.discountChildObicCode],
  ];

  for (const [source, before, after] of flatPairs) {
    const kind = classifyChange(before, after);
    if (kind) changes.push({ source, before: before ?? "", after: after ?? "", changeKind: kind });
  }

  // TicketBookingSchedule flat obic cols — diff per schedule matched by id
  const oldSchedules: any[] = oldTicket.TicketBookingSchedule ?? [];
  const newSchedules: any[] = newTicket.TicketBookingSchedule ?? [];
  for (const newTbs of newSchedules) {
    const oldTbs = oldSchedules.find((s) => s.id === newTbs.id) ?? {};
    const tbsPairs: [ObicSourceField, string, string][] = [
      [ObicSourceField.TBS_baseAdultObicCode, oldTbs.baseAdultObicCode, newTbs.baseAdultObicCode],
      [ObicSourceField.TBS_baseChildObicCode, oldTbs.baseChildObicCode, newTbs.baseChildObicCode],
      [ObicSourceField.TBS_extendedAdultObicCode, oldTbs.extendedAdultObicCode, newTbs.extendedAdultObicCode],
      [ObicSourceField.TBS_extendedChildObicCode, oldTbs.extendedChildObicCode, newTbs.extendedChildObicCode],
    ];
    for (const [source, before, after] of tbsPairs) {
      const kind = classifyChange(before, after);
      if (kind) changes.push({ source, before: before ?? "", after: after ?? "", changeKind: kind });
    }
  }

  // TicketDiscountSetting JSON tiers — diff by array index
  const oldDiscountTiers: any[] = (oldTicket.TicketDiscountSetting?.setting as any[]) ?? [];
  const newDiscountTiers: any[] = (newTicket.TicketDiscountSetting?.setting as any[]) ?? [];
  const maxDiscountLen = Math.max(oldDiscountTiers.length, newDiscountTiers.length);
  for (let i = 0; i < maxDiscountLen; i++) {
    const o = oldDiscountTiers[i] ?? {};
    const n = newDiscountTiers[i] ?? {};
    const discountPairs: [ObicSourceField, string, string][] = [
      [ObicSourceField.TDS_discountTier_adultObicCode, o.adultObicCode, n.adultObicCode],
      [ObicSourceField.TDS_discountTier_childObicCode, o.childObicCode, n.childObicCode],
    ];
    for (const [source, before, after] of discountPairs) {
      const kind = classifyChange(before, after);
      if (kind) changes.push({ source, tierIndex: i, before: before ?? "", after: after ?? "", changeKind: kind });
    }
  }

  // hourlyExtraTimeSetting JSON tiers
  const oldHourlyTiers: any[] = (oldTicket.TicketDiscountSetting?.hourlyExtraTimeSetting?.setting as any[]) ?? [];
  const newHourlyTiers: any[] = (newTicket.TicketDiscountSetting?.hourlyExtraTimeSetting?.setting as any[]) ?? [];
  const maxHourlyLen = Math.max(oldHourlyTiers.length, newHourlyTiers.length);
  for (let i = 0; i < maxHourlyLen; i++) {
    const o = oldHourlyTiers[i] ?? {};
    const n = newHourlyTiers[i] ?? {};
    const hourlyPairs: [ObicSourceField, string, string][] = [
      [ObicSourceField.TDS_hourlyExtraTime_adultObicCode, o.adultObicCode, n.adultObicCode],
      [ObicSourceField.TDS_hourlyExtraTime_childObicCode, o.childObicCode, n.childObicCode],
    ];
    for (const [source, before, after] of hourlyPairs) {
      const kind = classifyChange(before, after);
      if (kind) changes.push({ source, tierIndex: i, before: before ?? "", after: after ?? "", changeKind: kind });
    }
  }

  return changes;
}

/* ─────────────────────────────────────────────────────────
   Public: backfillObicCodesForTicket (batch SQL UPDATE)
───────────────────────────────────────────────────────── */

export async function backfillObicCodesForTicket(
  ticketId: number,
  changes: ObicCodeChange[],
): Promise<number> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, TicketDiscountSetting: true },
  });
  if (!ticket) return 0;

  for (const change of changes) {
    await backfillBySourceField(ticket, change.source, change.tierIndex);
  }
}

async function backfillBySourceField(
  ticket: { id: number; TicketDiscountSetting: any },
  source: ObicSourceField,
  tierIndex?: number,
): Promise<number> {
  const { id: ticketId } = ticket;
  switch (source) {
    case ObicSourceField.TD_adultObicCode:
      return prisma.$executeRaw`
        UPDATE booking_obic_codes boc
        SET    obic_code = td.adult_obic_code, is_pending = FALSE
        FROM   bookings b
        LEFT JOIN   ticket_details td ON td.ticket_id = b.ticket_id
        WHERE  boc.booking_id   = b.id
          AND  boc.is_pending   = TRUE
          AND  boc.source_field = 'TD_adultObicCode'
          AND  b.ticket_id      = ${ticketId}
          AND  td.adult_obic_code IS NOT NULL
      `;

    case ObicSourceField.TD_adultObicCode1stBooking:
      return prisma.$executeRaw`
        UPDATE booking_obic_codes boc
        SET    obic_code = td.adult_obic_code, is_pending = FALSE
        FROM   bookings b
        LEFT JOIN   ticket_details td ON td.ticket_id = b.ticket_id
        WHERE  boc.booking_id   = b.id
          AND  boc.is_pending   = TRUE
          AND  boc.source_field = 'TD_adultObicCode1stBooking'
          AND  b.ticket_id      = ${ticketId}
          AND  td.adult_obic_code IS NOT NULL
      `;

    case ObicSourceField.TD_childObicCode:
      return prisma.$executeRaw`
        UPDATE booking_obic_codes boc
        SET    obic_code = td.child_obic_code, is_pending = FALSE
        FROM   bookings b
        LEFT JOIN   ticket_details td ON td.ticket_id = b.ticket_id
        WHERE  boc.booking_id   = b.id
          AND  boc.is_pending   = TRUE
          AND  boc.source_field = 'TD_childObicCode'
          AND  b.ticket_id      = ${ticketId}
          AND  td.child_obic_code IS NOT NULL
      `;

    case ObicSourceField.TD_childObicCode1stBooking:
      return prisma.$executeRaw`
        UPDATE booking_obic_codes boc
        SET    obic_code = td.child_obic_code_1st_booking, is_pending = FALSE
        FROM   bookings b
        LEFT JOIN   ticket_details td ON td.ticket_id = b.ticket_id
        WHERE  boc.booking_id   = b.id
          AND  boc.is_pending   = TRUE
          AND  boc.source_field = 'TD_childObicCode1stBooking'
          AND  b.ticket_id      = ${ticketId}
          AND  td.child_obic_code_1st_booking IS NOT NULL
      `;

    case ObicSourceField.TD_discountAdultObicCode:
      return prisma.$executeRaw`
        UPDATE booking_obic_codes boc
        SET    obic_code = td.discount_adult_obic_code, is_pending = FALSE
        FROM   bookings b
        LEFT JOIN   ticket_details td ON td.ticket_id = b.ticket_id
        WHERE  boc.booking_id   = b.id
          AND  boc.is_pending   = TRUE
          AND  boc.source_field = 'TD_discountAdultObicCode'
          AND  b.ticket_id      = ${ticketId}
          AND  td.discount_adult_obic_code IS NOT NULL
      `;

    case ObicSourceField.TD_discountChildObicCode:
      return prisma.$executeRaw`
        UPDATE booking_obic_codes boc
        SET    obic_code = td.discount_child_obic_code, is_pending = FALSE
        FROM   bookings b
        LEFT JOIN   ticket_details td ON td.ticket_id = b.ticket_id
        WHERE  boc.booking_id   = b.id
          AND  boc.is_pending   = TRUE
          AND  boc.source_field = 'TD_discountChildObicCode'
          AND  b.ticket_id      = ${ticketId}
          AND  td.discount_child_obic_code IS NOT NULL
      `;

    case ObicSourceField.TBS_baseAdultObicCode:
      return prisma.$executeRaw`
        UPDATE booking_obic_codes boc
        SET    obic_code = tbs.base_adult_obic_code, is_pending = FALSE
        FROM   bookings b
        LEFT JOIN   ticket_booking_schedules tbs ON tbs.id = b.ticket_booking_schedule_id
        WHERE  boc.booking_id   = b.id
          AND  boc.is_pending   = TRUE
          AND  boc.source_field = 'TBS_baseAdultObicCode'
          AND  b.ticket_id      = ${ticketId}
          AND  tbs.base_adult_obic_code IS NOT NULL
      `;

    case ObicSourceField.TBS_baseChildObicCode:
      return prisma.$executeRaw`
        UPDATE booking_obic_codes boc
        SET    obic_code = tbs.base_child_obic_code, is_pending = FALSE
        FROM   bookings b
        LEFT JOIN   ticket_booking_schedules tbs ON tbs.id = b.ticket_booking_schedule_id
        WHERE  boc.booking_id   = b.id
          AND  boc.is_pending   = TRUE
          AND  boc.source_field = 'TBS_baseChildObicCode'
          AND  b.ticket_id      = ${ticketId}
          AND  tbs.base_child_obic_code IS NOT NULL
      `;

    case ObicSourceField.TBS_extendedAdultObicCode:
      return prisma.$executeRaw`
        UPDATE booking_obic_codes boc
        SET    obic_code = tbs.extended_adult_obic_code, is_pending = FALSE
        FROM   bookings b
        LEFT JOIN   ticket_booking_schedules tbs ON tbs.id = b.ticket_booking_schedule_id
        WHERE  boc.booking_id   = b.id
          AND  boc.is_pending   = TRUE
          AND  boc.source_field = 'TBS_extendedAdultObicCode'
          AND  b.ticket_id      = ${ticketId}
          AND  tbs.extended_adult_obic_code IS NOT NULL
      `;

    case ObicSourceField.TBS_extendedChildObicCode:
      return prisma.$executeRaw`
        UPDATE booking_obic_codes boc
        SET    obic_code = tbs.extended_child_obic_code, is_pending = FALSE
        FROM   bookings b
        LEFT JOIN   ticket_booking_schedules tbs ON tbs.id = b.ticket_booking_schedule_id
        WHERE  boc.booking_id   = b.id
          AND  boc.is_pending   = TRUE
          AND  boc.source_field = 'TBS_extendedChildObicCode'
          AND  b.ticket_id      = ${ticketId}
          AND  tbs.extended_child_obic_code IS NOT NULL
      `;

    case ObicSourceField.TDS_discountTier_adultObicCode:
    case ObicSourceField.TDS_discountTier_childObicCode:
    case ObicSourceField.TDS_hourlyExtraTime_adultObicCode:
    case ObicSourceField.TDS_hourlyExtraTime_childObicCode:
      return backfillJsonTierObicCodes(ticket, source, tierIndex ?? 0);

    default:
      return 0;
  }
}

async function backfillJsonTierObicCodes(
  ticket: { id: number; TicketDiscountSetting: any },
  source: ObicSourceField,
  tierIndex: number,
): Promise<number> {
  const { id: ticketId } = ticket;
  const isHourly = source === ObicSourceField.TDS_hourlyExtraTime_adultObicCode
    || source === ObicSourceField.TDS_hourlyExtraTime_childObicCode;

  const tiers: any[] = isHourly
    ? ((ticket?.TicketDiscountSetting?.hourlyExtraTimeSetting as any)?.setting ?? [])
    : ((ticket?.TicketDiscountSetting?.setting as any[]) ?? []);

  const tier = tiers[tierIndex];
  if (!tier) return 0;

  const isAdult = source === ObicSourceField.TDS_discountTier_adultObicCode
    || source === ObicSourceField.TDS_hourlyExtraTime_adultObicCode;

  const code: string = isAdult ? (tier.adultObicCode ?? "") : (tier.childObicCode ?? "");
  if (!code.trim()) return 0;

  const result = await prisma.bookingObicCode.updateMany({
    where: {
      isPending: true,
      sourceField: source,
      sourceTierIndex: tierIndex,
      Booking: { ticketId },
    },
    data: { obicCode: code.trim(), isPending: false },
  });
  return result.count;
}

/* ─────────────────────────────────────────────────────────
   Public: rebuildCalculatorContext (for force-recompute)
───────────────────────────────────────────────────────── */

export async function rebuildCalculatorContext(booking: any) {
  const sameTicketBookings = await prisma.booking.findMany({
    where: { ticketId: booking.ticketId, status: BookingStatus.CheckedOut },
    include: { PartialCheckout: true },
  });

  let parentBooking: any = null;
  if (booking.parentBookingId) {
    parentBooking = await prisma.booking.findUnique({
      where: { id: booking.parentBookingId },
      include: {
        Ticket: {
          include: {
            TicketDetail: true,
            TicketBookingSchedule: true,
            TicketDiscountSetting: true,
          },
        },
      },
    });
  }

  const isFirstTime = await checkIsFirstTimeUsingMonthlyTicket(booking);

  return { sameTicketBookings, parentBooking, isFirstTime };
}

/* ─────────────────────────────────────────────────────────
   Public: forceRecomputeObicForBooking
───────────────────────────────────────────────────────── */

export async function forceRecomputeObicForBooking(
  bookingId: number,
): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Ticket: {
        include: {
          TicketDetail: true,
          TicketBookingSchedule: true,
          TicketDiscountSetting: true,
        },
      },
      PartialCheckout: true,
      TicketBookingSchedule: true,
    },
  });

  if (!booking?.checkedOutAt) {
    throw new Error(`Booking ${bookingId} has no checkedOutAt — cannot recompute obic`);
  }

  const ctx = await rebuildCalculatorContext(booking);
  const codes = calculateObicCodesV2(
    booking,
    ctx.sameTicketBookings,
    booking.checkedOutAt,
    ctx.parentBooking,
    ctx.isFirstTime,
  );

  const maxRev = await prisma.bookingObicCode.aggregate({
    where: { bookingId },
    _max: { revision: true },
  });
  const nextRev = (maxRev._max.revision ?? 0) + 1;

  const rows = flattenObicCodesForLedger(codes, bookingId, nextRev, booking.checkedOutAt);
  await prisma.bookingObicCode.createMany({ data: rows });
}

export async function getNextObicRevision(bookingId: number): Promise<number> {
  const { _max } = await prisma.bookingObicCode.aggregate({
    where: { bookingId },
    _max: { revision: true },
  });
  return (_max.revision ?? 0) + 1;
}

/* ─────────────────────────────────────────────────────────
   Public: softDeleteObicCodesForRollback
   Soft-deletes the active revision and restores the previous one.
   Must be called inside a Prisma interactive transaction.
───────────────────────────────────────────────────────── */
export async function softDeleteObicCodesForRollback(
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  bookingId: number,
): Promise<void> {
  const { _max: activeAgg } = await tx.bookingObicCode.aggregate({
    where: { bookingId, deleted: false },
    _max: { revision: true },
  });
  const activeRev = activeAgg.revision;

  if (activeRev !== null) {
    await tx.bookingObicCode.deleteMany({
      where: { bookingId, revision: activeRev },
    });

    if (activeRev > 1) {
      await tx.bookingObicCode.updateMany({
        where: { bookingId, revision: activeRev - 1, deleted: true },
        data: { deleted: false },
      });
    }
  }
}
