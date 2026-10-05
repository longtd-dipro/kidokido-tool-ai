import React from "react";

import { formatThousands } from "utils/common";

/**
 * A single "label — amount円" row used for child, parent, and total lines.
 * Extracted so the same markup isn't repeated.
 */
interface ExtendedPriceRowProps {
  label: string;
  amount: number;
  className?: string;
}

const ExtendedPriceRow: React.FC<ExtendedPriceRowProps> = ({
  label,
  amount,
  className,
}) => (
  <div className={`flex items-center gap-[16px] ${className ?? ""}`.trim()}>
    <span className="whitespace-nowrap">{label}</span>
    <span className="flex-1 text-right">{formatThousands(amount)}円</span>
  </div>
);

export interface ExtendedPricesListProps {
  extendedPrices: { parent?: number[]; child?: number[] } | null | undefined;
  /** Show the red bold 合計金額 row under the list. Defaults to true. */
  showTotal?: boolean;
  /** Label for each child entry. Defaults to "こども1人". */
  childLabel?: string;
  /** Label for each adult entry. Defaults to "大人1人". */
  adultLabel?: string;
  /** Label for the total row. Defaults to "合計金額". */
  totalLabel?: string;
  /** When true, entries with amount ≤ 0 are hidden. Defaults to false. */
  filterZero?: boolean;
  /** Optional className applied to the outer wrapper. */
  className?: string;
  /** When no entries are renderable, render this instead of null. */
  emptyFallback?: React.ReactNode;
}

const ExtendedPricesList: React.FC<ExtendedPricesListProps> = ({
  extendedPrices,
  showTotal = true,
  childLabel = "こども1人",
  adultLabel = "おとな1人",
  totalLabel = "合計",
  filterZero = false,
  className,
  emptyFallback = null,
}) => {
  const rawChild = extendedPrices?.child ?? [];
  const rawParent = extendedPrices?.parent ?? [];
  const child = filterZero ? rawChild.filter((v) => v > 0) : rawChild;
  const parent = filterZero ? rawParent.filter((v) => v > 0) : rawParent;

  if (!child.length && !parent.length) {
    return <>{emptyFallback}</>;
  }

  const total =
    parent.reduce((acc, price) => acc + price, 0) +
    child.reduce((acc, price) => acc + price, 0);

  const content = (
    <>
      {child.map((amount, index) => (
        <ExtendedPriceRow
          key={`ext-child-${index}`}
          label={childLabel}
          amount={amount}
        />
      ))}
      {parent.map((amount, index) => (
        <ExtendedPriceRow
          key={`ext-parent-${index}`}
          label={adultLabel}
          amount={amount}
        />
      ))}
      {showTotal && (
        <ExtendedPriceRow
          key="ext-total"
          label={totalLabel}
          amount={total}
          className="text-[red]"
        />
      )}
    </>
  );

  if (className) {
    return <div className={className}>{content}</div>;
  }
  return content;
};

export { ExtendedPriceRow };
export default ExtendedPricesList;
