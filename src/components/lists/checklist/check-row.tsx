"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useLongPress } from "@/hooks/use-long-press";
import { formatDue, isOverdue } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/lib/types/list";

interface CheckRowProps {
  item: ChecklistItem;
  onToggle: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onSetDue: () => void;
}

/** Delight budget #1 — check-sink. Parent's layout group animates the move below the divider. */
export function CheckRow({ item, onToggle, onDelete, onStartEdit, onSetDue }: CheckRowProps) {
  const { fired, handlers } = useLongPress();
  const dragging = useRef(false);
  const overdue = item.dueAt !== undefined && !item.checked && isOverdue(item.dueAt);

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
          onClick={() => {
            if (!fired.current && !dragging.current) onToggle();
          }}
          {...handlers}
          role="checkbox"
          aria-checked={item.checked}
          aria-label={item.name}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
          className="flex cursor-pointer touch-pan-y items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 select-none focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span
            aria-hidden
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              item.checked
                ? "border-checklist bg-checklist text-white"
                : "border-border bg-transparent",
            )}
          >
            {item.checked && <Check className="size-4" strokeWidth={3} />}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block leading-snug break-words line-clamp-2",
                item.checked && "text-muted-foreground line-through",
              )}
            >
              {item.name}
            </span>
            {item.note && (
              <span className="block truncate text-xs text-muted-foreground">{item.note}</span>
            )}
          </span>
          {item.dueAt !== undefined && !item.checked && (
            <span
              className={cn(
                "shrink-0 text-xs",
                overdue ? "font-medium text-destructive" : "text-muted-foreground",
              )}
            >
              {formatDue(item.dueAt)}
            </span>
          )}
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onStartEdit}>Edit</ContextMenuItem>
        <ContextMenuItem onClick={onSetDue}>
          {item.dueAt === undefined ? "Set due date" : "Change due date"}
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
