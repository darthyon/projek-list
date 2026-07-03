"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { InlineAddRow } from "@/components/lists/inline-add-row";
import { ListHeader } from "@/components/lists/list-header";
import { PricePad } from "@/components/shop-mode/price-pad";
import { ShoppingRow } from "./shopping-row";
import {
  addShoppingItem,
  deleteItem,
  getItems,
  restoreItem,
  startShopping,
  updateShoppingItem,
} from "@/lib/db";
import { formatSen } from "@/lib/money";
import { shoppingTotals, type ShoppingItem, type ShoppingList } from "@/lib/types/list";

export function ShoppingView({ list }: { list: ShoppingList }) {
  const router = useRouter();
  const items = useLiveQuery(() => getItems(list.id), [list.id]) as
    | ShoppingItem[]
    | undefined;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [padItem, setPadItem] = useState<ShoppingItem | null>(null);

  if (items === undefined) return null;

  const { total, unpricedCount } = shoppingTotals(items);

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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-5 pt-6">
      <ListHeader list={list} />

      <LayoutGroup>
        <div className="flex flex-1 flex-col gap-2">
          <AnimatePresence initial={false}>
            {items.map((item) =>
              editingId === item.id ? (
                <motion.div
                  key={item.id}
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
                  key={item.id}
                  item={item}
                  onQty={(qty) => void updateShoppingItem(item.id, { qty })}
                  onPrice={() => setPadItem(item)}
                  onDelete={() => remove(item)}
                  onStartEdit={() => {
                    setEditDraft(item.name);
                    setEditingId(item.id);
                  }}
                />
              ),
            )}
          </AnimatePresence>
          <InlineAddRow label="New item" onAdd={(name) => addShoppingItem(list.id, name)} />
        </div>
      </LayoutGroup>

      {items.length > 0 && (
        <p className="px-1 text-sm text-muted-foreground">
          est. {formatSen(total)}
          {unpricedCount > 0 &&
            ` · ${unpricedCount} item${unpricedCount === 1 ? "" : "s"} no price yet`}
        </p>
      )}

      {items.length > 0 && (
        <button
          type="button"
          onClick={() => void begin()}
          className="sticky bottom-[calc(2rem+env(safe-area-inset-bottom))] mx-auto h-12 w-full max-w-sm rounded-full bg-shopping text-base font-bold text-white shadow-md transition-transform active:scale-[0.98] md:bottom-20"
        >
          Start Shopping 🛒
        </button>
      )}

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
