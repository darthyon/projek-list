"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AddItemBar } from "@/components/lists/add-item-bar";
import { PricePad } from "./price-pad";
import { ShopRow } from "./shop-row";
import { TripSummary } from "./trip-summary";
import {
  addShoppingItem,
  deleteItem,
  getItems,
  restoreItem,
  toggleChecked,
  updateShoppingItem,
} from "@/lib/db";
import { formatSen } from "@/lib/money";
import { shoppingTotals, type ShoppingItem, type ShoppingList } from "@/lib/types/list";

interface PadState {
  item: ShoppingItem;
  /** Opened by the into-trolley flow — offer Skip, not Cancel. */
  skippable: boolean;
}

/** SCR-SHOP-02 — distinct room, not a toggled button. Tinted, fullscreen, one-thumb. */
export function ShopMode({ list }: { list: ShoppingList }) {
  const router = useRouter();
  const items = useLiveQuery(() => getItems(list.id), [list.id]) as
    | ShoppingItem[]
    | undefined;
  const [pad, setPad] = useState<PadState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (items === undefined) return null;

  const shelf = items.filter((i) => !i.checked);
  const trolley = items.filter((i) => i.checked);
  const { total, unpricedCount } = shoppingTotals(trolley);

  function toggle(item: ShoppingItem) {
    navigator.vibrate?.(10);
    void toggleChecked(item.id);
    // Catch the price while the item is in hand — one tap to skip.
    if (!item.checked && item.price === undefined) {
      setPad({ item, skippable: true });
    }
  }

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

  function renderRow(item: ShoppingItem) {
    if (editingId === item.id) {
      return (
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
      );
    }
    return (
      <ShopRow
        key={item.id}
        item={item}
        onToggle={() => toggle(item)}
        onQty={(qty) => void updateShoppingItem(item.id, { qty })}
        onPrice={() => setPad({ item, skippable: false })}
        onDelete={() => remove(item)}
        onStartEdit={() => {
          setEditDraft(item.name);
          setEditingId(item.id);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-shopping/8">
      <div className="absolute inset-0 -z-10 bg-background" aria-hidden />

      {/* Header */}
      <header className="flex items-center gap-3 border-b border-shopping/20 bg-shopping/10 px-4 py-3">
        <span className="text-xl" aria-hidden>
          🛒
        </span>
        <h1 className="min-w-0 flex-1 truncate text-lg font-bold">{list.name}</h1>
        <button
          type="button"
          aria-label="Leave Shop Mode"
          onClick={() => router.push(`/list?id=${list.id}`)}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-5" aria-hidden />
        </button>
      </header>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <LayoutGroup>
          <div className="mx-auto flex max-w-2xl flex-col gap-2 pb-4">
            {shelf.length > 0 ? (
              <>
                <motion.p layout className="px-1 text-xs font-medium text-muted-foreground uppercase">
                  Shelf
                </motion.p>
                <AnimatePresence initial={false}>{shelf.map(renderRow)}</AnimatePresence>
              </>
            ) : (
              items.length > 0 && (
                <motion.p layout className="rounded-xl bg-shopping/10 px-4 py-3 text-sm">
                  Shelf clear. All in trolley.
                </motion.p>
              )
            )}

            {trolley.length > 0 && (
              <motion.p
                layout
                className="mt-3 px-1 text-xs font-medium text-muted-foreground uppercase"
              >
                In trolley 🛒
              </motion.p>
            )}
            <AnimatePresence initial={false}>{trolley.map(renderRow)}</AnimatePresence>

            <AddItemBar
              placeholder="Grabbed something else?"
              onAdd={(name) => addShoppingItem(list.id, name)}
              positionClassName="mt-2"
            />
          </div>
        </LayoutGroup>
      </div>

      {/* Pinned total bar */}
      <div className="relative border-t border-shopping/20 bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xl font-bold tabular-nums">{formatSen(total)}</p>
            <p className="truncate text-xs text-muted-foreground">
              {list.estTotalAtStart !== null && "budget check · "}
              {shelf.length > 0 ? `${shelf.length} left on shelf` : "so far"}
              {unpricedCount > 0 &&
                ` · ${unpricedCount} item${unpricedCount === 1 ? "" : "s"} belum key in`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSummaryOpen(true)}
            disabled={trolley.length === 0}
            className="h-11 shrink-0 rounded-full bg-shopping px-6 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            Done
          </button>
        </div>
      </div>

      <PricePad
        open={pad !== null}
        itemName={pad?.item.name ?? ""}
        initialSen={pad?.item.price}
        skippable={pad?.skippable}
        onSave={(sen) => {
          if (pad) void updateShoppingItem(pad.item.id, { price: sen });
        }}
        onClose={() => setPad(null)}
      />

      <TripSummary
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        list={list}
        trolley={trolley}
      />
    </div>
  );
}
