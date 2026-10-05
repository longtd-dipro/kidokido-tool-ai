export type ScanMode = "input" | "camera";

export enum ScanVariant {
  Scan = "scan",
  Rollback = "Rollback",
}

export type ScanAction =
  | "checkin"
  | "checkout"
  | "rollback-checkin"
  | "rollback-checkout";

export interface PartialCheckoutTimelineEntry {
  checkedOutAt: string;
  adultQuantity: number;
  childQuantity: number;
}

export interface ScanResult {
  action: ScanAction;
  /** Formatted group total across every ticket under the scanned barCode — checkout only, v2 only. */
  totalAmount?: string;
  bookings: {
    id: number;
    barCode: string;
    shortBarCode: string;
    ticketIndex: number;
    ticketCount: number;
    ticketName: string;
    adultQuantity: number;
    childQuantity: number;
    date: string;
    checkedInAt?: string;
    checkedOutAt?: string;
    formattedTotalAmount?: number;
    extendedPrices?: { parent: number[]; child: number[] };
    partialCheckouts?: PartialCheckoutTimelineEntry[];
    reCheckInCount?: number;
    isFirstTimeUsingMonthlyTicket?: boolean;
  }[];
}
