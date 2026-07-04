"use client";

import { motion } from "motion/react";
import { formatSen } from "@/lib/money";
import { itemTotal, shoppingTotals, type ShoppingItem, type ShoppingList } from "@/lib/types/list";

interface ReceiptProps {
  list: ShoppingList;
  /** Rows to print — caller decides (trolley items for a trip, all for history). */
  items: ShoppingItem[];
  /** "Estimated RM 45.00, kena RM 48.20." — shown when a plan estimate exists. */
  showEstLine?: boolean;
}

const DATE_FMT = new Intl.DateTimeFormat("en-MY", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** The signature element — paper receipt. Prints in once, zigzag edge, mono everything. */
export function Receipt({ list, items, showEstLine }: ReceiptProps) {
  const { total, unpricedCount } = shoppingTotals(items);
  const est = list.estTotalAtStart;

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="receipt-edge rounded-t-2xl bg-popover px-5 pt-5 pb-12 font-mono text-sm text-popover-foreground shadow-md"
    >
      <div className="text-center">
        <p className="text-base font-semibold">
          {list.emoji} {list.name}
        </p>
        {list.completedAt !== null && (
          <p className="mt-1 text-xs text-muted-foreground">
            {DATE_FMT.format(list.completedAt)}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="my-3 border-t border-dashed border-border" aria-hidden />

      <ul className="space-y-1.5">
        {items.map((item) => {
          const rowTotal = itemTotal(item);
          return (
            <li key={item.id} className="flex items-baseline gap-2">
              <span className="min-w-0 flex-1 truncate">
                {item.name}
                {item.qty > 1 && (
                  <span className="text-muted-foreground">
                    {" "}
                    ×{item.qty}
                    {item.unit ?? ""}
                  </span>
                )}
              </span>
              <span
                className="flex-1 border-b border-dotted border-border opacity-60"
                aria-hidden
              />
              <span className="shrink-0 tabular-nums">
                {rowTotal === null ? "—" : formatSen(rowTotal)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 border-t-2 border-double border-foreground/60 pt-2">
        <div className="flex items-baseline justify-between text-base font-semibold">
          <span>TOTAL</span>
          <span className="tabular-nums">{formatSen(total)}</span>
        </div>
        {unpricedCount > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {unpricedCount} item{unpricedCount === 1 ? "" : "s"} without price
          </p>
        )}
        {showEstLine && est !== null && est > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Estimated {formatSen(est)}, kena {formatSen(total)}.
          </p>
        )}
      </div>

      <p className="mt-5 pb-1 text-center text-xs text-muted-foreground">
        Terima kasih, datang lagi.
      </p>
    </motion.div>
  );
}
