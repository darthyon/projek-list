"use client";

import { Check } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SwipeRow } from "@/components/ui/swipe-row";
import { QtyStepper } from "@/components/lists/shopping/qty-stepper";
import { useLongPress } from "@/hooks/use-long-press";
import { formatSen } from "@/lib/money";
import { cn } from "@/lib/utils";
import { itemTotal, type ShoppingItem } from "@/lib/types/list";

interface ShopRowProps {
  item: ShoppingItem;
  onToggle: () => void;
  onQty: (qty: number) => void;
  onPrice: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
}

/** Delight budget #2 — trolley slide. Whole row is the tap target: one thumb, walking. */
export function ShopRow({ item, onToggle, onQty, onPrice, onDelete, onStartEdit }: ShopRowProps) {
  const { fired, handlers } = useLongPress();
  const rowTotal = itemTotal(item);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <SwipeRow
          onDelete={onDelete}
          onClick={onToggle}
          clickSuppressed={() => fired.current}
          longPressHandlers={handlers}
          role="checkbox"
          ariaChecked={item.checked}
          ariaLabel={item.name}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
          innerClassName={cn(
            "flex min-h-14 cursor-pointer items-center gap-2 rounded-xl border bg-card py-2 pr-2 pl-3 focus-visible:outline-2 focus-visible:outline-ring",
            item.checked ? "border-shopping/40 bg-shopping/5" : "border-border",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              item.checked ? "border-shopping bg-shopping text-white" : "border-border",
            )}
          >
            {item.checked && <Check className="size-4" strokeWidth={3} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block leading-snug break-words line-clamp-2">{item.name}</span>
            {item.price !== undefined && item.qty > 1 && (
              <span className="block font-mono text-xs text-muted-foreground tabular-nums">
                {item.qty} × {formatSen(item.price)}
              </span>
            )}
          </span>
          <QtyStepper qty={item.qty} unit={item.unit} onChange={onQty} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrice();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={
              item.price === undefined
                ? `Add price for ${item.name}`
                : `Change price for ${item.name}`
            }
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1.5 font-mono text-xs tabular-nums transition-colors",
              item.price === undefined
                ? "border border-dashed border-border text-muted-foreground"
                : "bg-secondary",
            )}
          >
            {rowTotal === null ? "RM —" : formatSen(rowTotal)}
          </button>
        </SwipeRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onStartEdit}>Edit</ContextMenuItem>
        <ContextMenuItem onClick={onPrice}>
          {item.price === undefined ? "Add price" : "Change price"}
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
