"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ListHeader } from "@/components/lists/list-header";
import { ReorderableRow } from "@/components/lists/reorderable-row";
import { StickyAddBar } from "@/components/lists/sticky-add-bar";
import { PricePad } from "@/components/shop-mode/price-pad";
import { ShoppingRow } from "./shopping-row";
import {
  addShoppingItem,
  deleteItem,
  getItems,
  reorderItems,
  restoreItem,
  startShopping,
  updateShoppingItem,
} from "@/lib/db";
import { useKeyboardInset } from "@/hooks/use-keyboard-inset";
import { formatSen } from "@/lib/money";
import { shoppingTotals, type ShoppingItem, type ShoppingList } from "@/lib/types/list";

export function ShoppingView({ list }: { list: ShoppingList }) {
  const router = useRouter();
  const items = useLiveQuery(() => getItems(list.id), [list.id]) as
    | ShoppingItem[]
    | undefined;
  const headerRef = useRef<HTMLDivElement>(null);
  const listStartRef = useRef<HTMLDivElement>(null);
  const shoppingItemsRef = useRef<ShoppingItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [padItem, setPadItem] = useState<ShoppingItem | null>(null);
  const keyboardInset = useKeyboardInset();
  const [draftShoppingItems, setDraftShoppingItems] = useState<ShoppingItem[] | null>(null);

  const shoppingItems = items ?? [];
  const displayedShoppingItems = draftShoppingItems ?? shoppingItems;
  const { total, unpricedCount } = shoppingTotals(shoppingItems);

  useEffect(() => {
    shoppingItemsRef.current = displayedShoppingItems;
  });

  if (items === undefined) return null;

  function remove(item: ShoppingItem) {
    void deleteItem(item.id);
    toast("Deleted", {
      action: { label: "Undo", onClick: () => void restoreItem(item) },
    });
  }

  async function saveEdit(item: ShoppingItem) {
    setEditingId(null);
    const name = editDraft.trim();
    if (name && name !== item.name) await updateShoppingItem(item.id, { name });
  }

  async function begin() {
    await startShopping(list.id);
    router.push(`/list?id=${list.id}&mode=shop`);
  }

  function persistReorder(nextItems: ShoppingItem[]) {
    void reorderItems(nextItems.map((item) => item.id));
  }

  function reorderShoppingItem(draggedId: string, x: number, y: number) {
    const currentItems = shoppingItemsRef.current;
    const dragged = currentItems.find((item) => item.id === draggedId);
    if (!dragged) return;

    const targetEl = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-reorder-id]");
    const targetId = targetEl?.dataset.reorderId;
    if (!targetEl || !targetId || targetId === draggedId) return;

    const nextItems = currentItems.filter((item) => item.id !== draggedId);
    const targetIndex = nextItems.findIndex((item) => item.id === targetId);
    if (targetIndex === -1) return;

    const targetRect = targetEl.getBoundingClientRect();
    const insertIndex = targetIndex + (y > targetRect.top + targetRect.height / 2 ? 1 : 0);
    nextItems.splice(insertIndex, 0, dragged);
    shoppingItemsRef.current = nextItems;
    setDraftShoppingItems(nextItems);
  }

  function startShoppingReorder() {
    setDraftShoppingItems(shoppingItemsRef.current);
  }

  function finishShoppingReorder() {
    const finalItems = shoppingItemsRef.current;
    setDraftShoppingItems(null);
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
      const composerSpace = shoppingItems.length > 0 ? 160 : 104;
      const topPadding = 12;
      const bottomLimit = viewportHeight - composerSpace;
      const currentSpan = targetRect.bottom - headerRect.top;
      const idealTop = currentSpan < bottomLimit - topPadding
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
              {displayedShoppingItems.map((item) => (
                <ReorderableRow
                  key={item.id}
                  id={item.id}
                  onLongPressStart={startShoppingReorder}
                  onLongPressMove={reorderShoppingItem}
                  onLongPressEnd={finishShoppingReorder}
                >
                  {editingId === item.id ? (
                    <motion.div
                      layout
                      className="rounded-xl border border-border bg-card px-4 py-2"
                    >
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
                    <ShoppingRow
                      item={item}
                      onQty={(qty) => void updateShoppingItem(item.id, { qty })}
                      onPrice={() => setPadItem(item)}
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
        </div>
      </LayoutGroup>

      {shoppingItems.length > 0 && (
        <p className="px-1 text-sm text-muted-foreground">
          est. {formatSen(total)}
          {unpricedCount > 0 &&
            ` · ${unpricedCount} item${unpricedCount === 1 ? "" : "s"} no price yet`}
        </p>
      )}

      <div
        style={{ bottom: keyboardInset }}
        className="fixed right-0 left-0 z-30 border-t border-border/80 bg-background/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur md:left-20 md:rounded-t-2xl md:border md:shadow-sm"
      >
        {shoppingItems.length > 0 && (
          <button
            type="button"
            onClick={() => void begin()}
            className="mx-auto mb-2 h-12 w-full max-w-sm rounded-full bg-shopping text-base font-bold text-white shadow-md transition-transform active:scale-[0.98]"
          >
            Start Shopping 🛒
          </button>
        )}
        <StickyAddBar
          label="New item"
          sticky={false}
          onFocus={focusComposerContext}
          onAdd={(name) => addShoppingItem(list.id, name)}
        />
      </div>

      <PricePad
        open={padItem !== null}
        itemName={padItem?.name ?? ""}
        initialSen={padItem?.price}
        onSave={(sen) => {
          if (padItem) void updateShoppingItem(padItem.id, { price: sen });
        }}
        onClose={() => setPadItem(null)}
      />
    </div>
  );
}
