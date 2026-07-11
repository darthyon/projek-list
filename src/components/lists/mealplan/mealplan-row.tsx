"use client";

import { NotebookPen } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SwipeRow } from "@/components/ui/swipe-row";
import { QtyStepper } from "@/components/lists/shopping/qty-stepper";
import { cn } from "@/lib/utils";
import type { MealPlanItem } from "@/lib/types/list";

interface MealPlanRowProps {
  item: MealPlanItem;
  onServings: (servings: number) => void;
  onNote: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
}

export function MealPlanRow({
  item,
  onServings,
  onNote,
  onDelete,
  onStartEdit,
}: MealPlanRowProps) {
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
            <span className="leading-snug break-words line-clamp-2">{item.name}</span>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNote();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={item.note ? `Edit note for ${item.name}` : `Add note for ${item.name}`}
            className={cn(
              "shrink-0 rounded-full p-1.5 transition-colors",
              item.note
                ? "bg-mealplan/15 text-mealplan"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <NotebookPen className="size-4" />
          </button>
          <QtyStepper qty={item.servings} unit="serv" onChange={onServings} />
        </SwipeRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onStartEdit}>Edit</ContextMenuItem>
        <ContextMenuItem onClick={onNote}>
          {item.note ? "Edit note" : "Add note"}
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
