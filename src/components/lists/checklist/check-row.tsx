"use client";

import { Check } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SwipeRow } from "@/components/ui/swipe-row";
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
  const overdue = item.dueAt !== undefined && !item.checked && isOverdue(item.dueAt);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <SwipeRow
          onDelete={onDelete}
          onClick={onToggle}
          role="checkbox"
          ariaChecked={item.checked}
          ariaLabel={item.name}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
          innerClassName="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 focus-visible:outline-2 focus-visible:outline-ring"
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
        </SwipeRow>
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
