"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { toast } from "sonner";
import { AnimatedCheck } from "@/components/ui/animated-check";
import { Input } from "@/components/ui/input";
import { AddItemBar } from "@/components/lists/add-item-bar";
import { ListHeader } from "@/components/lists/list-header";
import { CheckRow } from "./check-row";
import { DueDateDialog } from "./due-date-dialog";
import {
  addChecklistItem,
  deleteItem,
  getItems,
  restoreItem,
  toggleChecked,
  updateChecklistItem,
} from "@/lib/db";
import type { ChecklistItem, ChecklistList } from "@/lib/types/list";

const GHOSTS = ["Type first thing…", "Apa nak buat?", "Start small. One thing."];

export function ChecklistView({ list }: { list: ChecklistList }) {
  const items = useLiveQuery(() => getItems(list.id), [list.id]) as
    | ChecklistItem[]
    | undefined;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [dueItem, setDueItem] = useState<ChecklistItem | null>(null);
  const ghost = useMemo(() => {
    const hash = [...list.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    return GHOSTS[hash % GHOSTS.length];
  }, [list.id]);

  if (items === undefined) return null;

  const open = items.filter((i) => !i.checked);
  const done = items.filter((i) => i.checked);
  const allDone = items.length > 0 && open.length === 0;

  function toggle(item: ChecklistItem) {
    navigator.vibrate?.(10);
    void toggleChecked(item.id);
  }

  function remove(item: ChecklistItem) {
    void deleteItem(item.id);
    toast("Deleted", {
      action: { label: "Undo", onClick: () => void restoreItem(item) },
    });
  }

  async function saveEdit(item: ChecklistItem) {
    setEditingId(null);
    const name = editDraft.trim();
    if (name && name !== item.name) await updateChecklistItem(item.id, { name });
  }

  function renderRow(item: ChecklistItem) {
    if (editingId === item.id) {
      return (
        <motion.div key={item.id} layout className="rounded-xl border border-border bg-card px-4 py-2">
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
      <CheckRow
        key={item.id}
        item={item}
        onToggle={() => toggle(item)}
        onDelete={() => remove(item)}
        onStartEdit={() => {
          setEditDraft(item.name);
          setEditingId(item.id);
        }}
        onSetDue={() => setDueItem(item)}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-5 pt-6">
      <ListHeader list={list} />

      <LayoutGroup>
        <div className="flex flex-1 flex-col gap-2">
          <AnimatePresence initial={false}>{open.map(renderRow)}</AnimatePresence>

          {allDone && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-3 text-sm"
            >
              <AnimatedCheck className="size-5 text-checklist" />
              All settled. Syok.
            </motion.div>
          )}

          {done.length > 0 && (
            <motion.div layout className="mt-2 flex items-center gap-3 px-1" aria-hidden>
              <span className="text-xs text-muted-foreground">Done · {done.length}</span>
              <span className="h-px flex-1 bg-border" />
            </motion.div>
          )}
          <AnimatePresence initial={false}>{done.map(renderRow)}</AnimatePresence>
        </div>
      </LayoutGroup>

      <AddItemBar
        placeholder={ghost}
        onAdd={(name) => addChecklistItem(list.id, name)}
        autoFocus={items.length === 0}
      />

      <DueDateDialog item={dueItem} onClose={() => setDueItem(null)} />
    </div>
  );
}
