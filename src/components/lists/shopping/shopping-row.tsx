"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { QtyStepper } from "./qty-stepper";
import { useLongPress } from "@/hooks/use-long-press";
import { formatSen } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ShoppingItem } from "@/lib/types/list";

interface ShoppingRowProps {
  item: ShoppingItem;
  onQty: (qty: number) => void;
  onPrice: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
}

/** Plan-view row: name · qty stepper · price chip. Price is never required. */
export function ShoppingRow({ item, onQty, onPrice, onDelete, onStartEdit }: ShoppingRowProps) {
  const { handlers } = useLongPress();
  const dragging = useRef(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.div
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ layout: { type: "spring", stiffness: 500, damping: 40 } }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0.4, right: 0.05 }}
          dragSnapToOrigin
          onDragStart={() => {
            dragging.current = true;
          }}
          onDragEnd={(_, info) => {
            setTimeout(() => {
              dragging.current = false;
            }, 0);
            if (info.offset.x < -90) onDelete();
          }}
          {...handlers}
          className="flex touch-pan-y items-center gap-2 rounded-xl border border-border bg-card py-2 pr-2 pl-4 select-none"
        >
          <span className="min-w-0 flex-1 leading-snug break-words line-clamp-2">{item.name}</span>
          <QtyStepper qty={item.qty} unit={item.unit} onChange={onQty} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!dragging.current) onPrice();
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
                ? "border border-dashed border-border text-muted-foreground hover:text-foreground"
                : "bg-secondary",
            )}
          >
            {item.price === undefined ? "RM —" : formatSen(item.price)}
          </button>
        </motion.div>
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
