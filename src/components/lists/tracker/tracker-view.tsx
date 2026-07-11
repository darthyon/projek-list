"use client";

import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Mascot } from "@/components/ui/mascot";
import { ListHeader } from "@/components/lists/list-header";
import { ReorderableRow } from "@/components/lists/reorderable-row";
import { StickyAddBar } from "@/components/lists/sticky-add-bar";
import { ThresholdDialog } from "./threshold-dialog";
import { TrackerRow } from "./tracker-row";
import {
  addTrackerItem,
  deleteItem,
  getItems,
  reorderItems,
  restoreItem,
  updateTrackerItem,
} from "@/lib/db";
import { useKeyboardInset } from "@/hooks/use-keyboard-inset";
import { findInsertIndex } from "@/lib/reorder";
import type { TrackerItem, TrackerList } from "@/lib/types/list";

export function TrackerView({ list }: { list: TrackerList }) {
  const items = useLiveQuery(() => getItems(list.id), [list.id]) as
    | TrackerItem[]
    | undefined;
  const headerRef = useRef<HTMLDivElement>(null);
  const listStartRef = useRef<HTMLDivElement>(null);
  const trackerItemsRef = useRef<TrackerItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [thresholdItem, setThresholdItem] = useState<TrackerItem | null>(null);
  const lastReorderY = useRef(Number.NEGATIVE_INFINITY);
  const keyboardInset = useKeyboardInset();
  const [draftItems, setDraftItems] = useState<TrackerItem[] | null>(null);

  const trackerItems = items ?? [];
  const displayedItems = draftItems ?? trackerItems;

  if (items === undefined) return null;

  const lowCount = trackerItems.filter(
    (i) => i.lowStockThreshold !== undefined && i.qty <= i.lowStockThreshold,
  ).length;

  function remove(item: TrackerItem) {
    void deleteItem(item.id);
    toast("Deleted", {
      action: { label: "Undo", onClick: () => void restoreItem(item) },
    });
  }

  async function saveEdit(item: TrackerItem) {
    setEditingId(null);
    const name = editDraft.trim();
    if (name && name !== item.name) await updateTrackerItem(item.id, { name });
  }

  function persistReorder(nextItems: TrackerItem[]) {
    void reorderItems(nextItems.map((item) => item.id));
  }

  function reorderTrackerItem(draggedId: string, _x: number, y: number) {
    const currentItems = trackerItemsRef.current;
    const fromIndex = currentItems.findIndex((item) => item.id === draggedId);
    if (fromIndex === -1) return;

    const nextItems = currentItems.filter((item) => item.id !== draggedId);
    const insertIndex = findInsertIndex(nextItems.map((item) => item.id), y);
    if (insertIndex === fromIndex) return;
    if (Math.abs(y - lastReorderY.current) < 6) return;
    lastReorderY.current = y;

    nextItems.splice(insertIndex, 0, currentItems[fromIndex]);
    trackerItemsRef.current = nextItems;
    setDraftItems(nextItems);
  }

  function startReorder() {
    lastReorderY.current = Number.NEGATIVE_INFINITY;
    setDraftItems(trackerItemsRef.current);
  }

  function finishReorder() {
    const finalItems = trackerItemsRef.current;
    setDraftItems(null);
    persistReorder(finalItems);
  }

  function focusComposerContext() {
    window.requestAnimationFrame(() => {
      const header = headerRef.current;
      const target = listStartRef.current;
      if (!header || !target) return;

      const headerRect = header.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const composerSpace = 104;
      const topPadding = 12;
      const bottomLimit = viewportHeight - composerSpace;
      const currentSpan = targetRect.bottom - headerRect.top;
      const idealTop =
        currentSpan < bottomLimit - topPadding
          ? headerRect.top - topPadding
          : targetRect.top - Math.max(topPadding, bottomLimit * 0.48);

      window.scrollBy({ top: idealTop, behavior: "smooth" });
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-5 pt-6 pb-0">
      <div ref={headerRef}>
        <ListHeader list={list} />
      </div>

      <LayoutGroup>
        <div className="flex flex-1 flex-col gap-2 pb-36">
          <div ref={listStartRef} className="-mt-2 h-px" aria-hidden />
          <AnimatePresence initial={false}>
            <div className="flex flex-col gap-2">
              {displayedItems.map((item) => (
                <ReorderableRow
                  key={item.id}
                  id={item.id}
                  onLongPressStart={startReorder}
                  onLongPressMove={reorderTrackerItem}
                  onLongPressEnd={finishReorder}
                >
                  {editingId === item.id ? (
                    <motion.div layout className="rounded-xl bg-card px-4 py-2 shadow-card">
                      <Input
                        autoFocus
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onBlur={() => void saveEdit(item)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void saveEdit(item);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        aria-label="Edit item"
                        className="border-0 px-0 shadow-none focus-visible:ring-0"
                      />
                    </motion.div>
                  ) : (
                    <TrackerRow
                      item={item}
                      onQty={(qty) => void updateTrackerItem(item.id, { qty })}
                      onSetThreshold={() => setThresholdItem(item)}
                      onDelete={() => remove(item)}
                      onStartEdit={() => {
                        setEditDraft(item.name);
                        setEditingId(item.id);
                      }}
                    />
                  )}
                </ReorderableRow>
              ))}
            </div>
          </AnimatePresence>

          {trackerItems.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-end gap-3 pb-6 text-center">
              <Mascot pose="arms-crossed" className="size-20" />
              <p className="text-sm text-muted-foreground">track what you have. keep it simple.</p>
            </div>
          )}
        </div>
      </LayoutGroup>

      {trackerItems.length > 0 && (
        <p className="px-1 text-sm text-muted-foreground">
          {trackerItems.length} item{trackerItems.length === 1 ? "" : "s"}
          {lowCount > 0 && ` · ${lowCount} low stock`}
        </p>
      )}

      <div
        style={{ bottom: keyboardInset }}
        className="fixed right-0 left-0 z-30 border-t border-border/80 bg-background/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur md:left-20 md:rounded-t-2xl md:border md:shadow-sm"
      >
        <StickyAddBar
          label="New item"
          sticky={false}
          onFocus={() => focusComposerContext()}
          onAdd={(name) => addTrackerItem(list.id, name)}
        />
      </div>

      <ThresholdDialog
        item={thresholdItem}
        onSave={(threshold) => {
          if (thresholdItem) void updateTrackerItem(thresholdItem.id, { lowStockThreshold: threshold });
        }}
        onClose={() => setThresholdItem(null)}
      />
    </div>
  );
}
