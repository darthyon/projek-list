"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AnimatedCheck } from "@/components/ui/animated-check";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { InlineAddRow } from "@/components/lists/inline-add-row";
import { ListHeader } from "@/components/lists/list-header";
import { CheckRow } from "./check-row";
import { DueDateDialog } from "./due-date-dialog";
import {
  addChecklistItem,
  addChecklistSection,
  deleteItem,
  getItems,
  removeChecklistSection,
  restoreItem,
  toggleChecked,
  updateChecklistItem,
} from "@/lib/db";
import type { ChecklistItem, ChecklistList } from "@/lib/types/list";

function SectionHeader({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.p
          layout
          className="mt-3 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase select-none"
        >
          {name}
        </motion.p>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onRemove}>Remove section</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function NewSectionRow({ onAdd }: { onAdd: (name: string) => void }) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="mt-1 flex items-center gap-2 px-1 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        <Plus className="size-3.5" aria-hidden />
        New section
      </button>
    );
  }
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && value.trim()) {
          onAdd(value.trim());
          setValue("");
          setActive(false);
        }
        if (e.key === "Escape") setActive(false);
      }}
      onBlur={() => {
        if (value.trim()) onAdd(value.trim());
        setValue("");
        setActive(false);
      }}
      placeholder="Section name"
      aria-label="New section name"
      className="mt-1 w-40 bg-transparent px-1 text-xs font-medium tracking-wide uppercase outline-none placeholder:normal-case"
    />
  );
}

export function ChecklistView({ list }: { list: ChecklistList }) {
  const items = useLiveQuery(() => getItems(list.id), [list.id]) as
    | ChecklistItem[]
    | undefined;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [dueItem, setDueItem] = useState<ChecklistItem | null>(null);

  if (items === undefined) return null;

  const sections = list.sections ?? [];
  const open = items.filter((i) => !i.checked);
  const done = items.filter((i) => i.checked);
  const allDone = items.length > 0 && open.length === 0;
  const openIn = (section?: string) =>
    open.filter((i) => (section === undefined ? !i.section || !sections.includes(i.section) : i.section === section));

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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-5 pt-6 pb-10">
      <ListHeader list={list} />

      <LayoutGroup>
        <div className="flex flex-1 flex-col gap-2">
          <AnimatePresence initial={false}>{openIn(undefined).map(renderRow)}</AnimatePresence>
          <InlineAddRow label="New item" onAdd={(name) => addChecklistItem(list.id, name)} />

          {sections.map((section) => (
            <div key={section} className="flex flex-col gap-2">
              <SectionHeader
                name={section}
                onRemove={() => void removeChecklistSection(list.id, section)}
              />
              <AnimatePresence initial={false}>{openIn(section).map(renderRow)}</AnimatePresence>
              <InlineAddRow
                label="New item"
                onAdd={(name) => addChecklistItem(list.id, name, { section })}
              />
            </div>
          ))}

          <NewSectionRow onAdd={(name) => void addChecklistSection(list.id, name)} />

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

      <DueDateDialog item={dueItem} onClose={() => setDueItem(null)} />
    </div>
  );
}
