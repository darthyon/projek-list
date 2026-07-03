"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useLongPress } from "@/hooks/use-long-press";
import { archiveList, duplicateList, getItems, togglePinned } from "@/lib/db";
import { formatSen } from "@/lib/money";
import { cn } from "@/lib/utils";
import { shoppingTotals, type List, type ShoppingItem } from "@/lib/types/list";

export function ListCard({ list }: { list: List }) {
  const { fired, handlers } = useLongPress();
  const items = useLiveQuery(() => getItems(list.id), [list.id]);

  const completed = list.type === "shopping" && list.completedAt !== null;
  const tripOpen =
    list.type === "shopping" && list.completedAt === null && list.estTotalAtStart !== null;

  let subtitle = "Nothing yet";
  if (items && items.length > 0) {
    if (list.type === "checklist") {
      const done = items.filter((i) => i.checked).length;
      subtitle = `${done}/${items.length} done`;
    } else {
      const shoppingItems = items as ShoppingItem[];
      if (tripOpen) {
        const inTrolley = shoppingTotals(shoppingItems.filter((i) => i.checked));
        const left = shoppingItems.filter((i) => !i.checked).length;
        subtitle = `${formatSen(inTrolley.total)} so far · ${left} left`;
      } else if (completed) {
        const { total } = shoppingTotals(shoppingItems.filter((i) => i.checked));
        subtitle = `Done · ${formatSen(total)}`;
      } else {
        const { total, unpricedCount } = shoppingTotals(shoppingItems);
        const count = `${items.length} item${items.length === 1 ? "" : "s"}`;
        subtitle =
          unpricedCount > 0
            ? `${count} · est ${formatSen(total)} + ${unpricedCount} no price`
            : `${count} · est ${formatSen(total)}`;
      }
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Link
          href={`/list?id=${list.id}`}
          {...handlers}
          onClick={(e) => {
            if (fired.current) e.preventDefault();
          }}
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs transition-colors select-none hover:bg-secondary/40",
            completed && "opacity-60",
            tripOpen && "border-shopping/40",
          )}
        >
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl"
            aria-hidden
          >
            {list.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  list.type === "checklist" ? "bg-checklist" : "bg-shopping",
                )}
                aria-hidden
              />
              <h3 className="truncate font-bold">{list.name}</h3>
              {list.pinned && (
                <span className="text-xs" aria-label="Pinned">
                  📌
                </span>
              )}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {tripOpen && "🛒 "}
              {subtitle}
            </p>
          </div>
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => void togglePinned(list.id)}>
          {list.pinned ? "Unpin" : "Pin"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => void duplicateList(list.id)}>Duplicate</ContextMenuItem>
        <ContextMenuItem onClick={() => void archiveList(list.id)}>Archive</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
