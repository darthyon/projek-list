"use client";

import { TriangleAlert } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SwipeRow } from "@/components/ui/swipe-row";
import { QtyStepper } from "@/components/lists/shopping/qty-stepper";
import { cn } from "@/lib/utils";
import type { TrackerItem } from "@/lib/types/list";

interface TrackerRowProps {
  item: TrackerItem;
  onQty: (qty: number) => void;
  onSetThreshold: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
}

export function TrackerRow({
  item,
  onQty,
  onSetThreshold,
  onDelete,
  onStartEdit,
}: TrackerRowProps) {
  const low = item.lowStockThreshold !== undefined && item.qty <= item.lowStockThreshold;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <SwipeRow
          onDelete={onDelete}
          onClick={onStartEdit}
          ariaLabel={item.name}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onStartEdit();
            }
          }}
          innerClassName="flex items-center gap-2 rounded-xl bg-card py-2 pr-2 pl-4 shadow-card"
        >
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            {low && (
              <TriangleAlert
                className="size-3.5 shrink-0 text-shopping"
                aria-label="Low stock"
              />
            )}
            <span className="leading-snug break-words line-clamp-2">{item.name}</span>
          </span>
          <QtyStepper qty={item.qty} unit={item.unit} onChange={onQty} />
          {item.lowStockThreshold !== undefined && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetThreshold();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={`Low stock threshold: ${item.lowStockThreshold}`}
              className={cn(
                "shrink-0 rounded-full px-2 py-1 font-mono text-xs tabular-nums transition-colors",
                low
                  ? "bg-shopping/15 text-shopping font-medium"
                  : "border border-dashed border-border text-muted-foreground hover:text-foreground",
              )}
            >
              ≤{item.lowStockThreshold}
            </button>
          )}
        </SwipeRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onStartEdit}>Edit</ContextMenuItem>
        <ContextMenuItem onClick={onSetThreshold}>
          {item.lowStockThreshold === undefined
            ? "Set low stock alert"
            : "Change low stock alert"}
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
