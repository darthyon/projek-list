"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, LayoutGroup, Reorder, motion } from "motion/react";
import { toast } from "sonner";
import { AnimatedCheck } from "@/components/ui/animated-check";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ListHeader } from "@/components/lists/list-header";
import { ReorderableRow } from "@/components/lists/reorderable-row";
import { StickyAddBar } from "@/components/lists/sticky-add-bar";
import { CheckRow } from "./check-row";
import { DueDateDialog } from "./due-date-dialog";
import {
  addChecklistItem,
  addChecklistSection,
  deleteItem,
  getItems,
  removeChecklistSection,
  reorderItems,
  restoreItem,
  toggleChecked,
  updateChecklistItem,
} from "@/lib/db";
import type { ChecklistItem, ChecklistList } from "@/lib/types/list";

type ChecklistSlot =
  | { id: string; type: "header"; section: string }
  | { id: string; type: "item"; item: ChecklistItem };

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

function SectionNameField({
  onAdd,
  onCancel,
}: {
  onAdd: (name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");

  function commit() {
    const name = value.trim();
    if (name) onAdd(name);
    else onCancel();
    setValue("");
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-4 py-2">
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Section name"
        aria-label="New section name"
        className="h-9 border-0 px-0 text-sm shadow-none focus-visible:ring-0"
      />
    </div>
  );
}

export function ChecklistView({ list }: { list: ChecklistList }) {
  const items = useLiveQuery(() => getItems(list.id), [list.id]) as
    | ChecklistItem[]
    | undefined;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [dueItem, setDueItem] = useState<ChecklistItem | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");

  if (items === undefined) return null;

  const checklistItems = items;
  const sections = list.sections ?? [];
  const open = checklistItems.filter((i) => !i.checked);
  const done = checklistItems.filter((i) => i.checked);
  const allDone = checklistItems.length > 0 && open.length === 0;
  const selectedSectionName = selectedSection && sections.includes(selectedSection) ? selectedSection : "";
  const openSlots: ChecklistSlot[] = [
    ...open
      .filter((item) => !item.section || !sections.includes(item.section))
      .map((item) => ({ id: item.id, type: "item" as const, item })),
    ...sections.flatMap((section) => [
      { id: `section:${section}`, type: "header" as const, section },
      ...open
        .filter((item) => item.section === section)
        .map((item) => ({ id: item.id, type: "item" as const, item })),
    ]),
  ];

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

  function persistReorder(nextSlots: ChecklistSlot[]) {
    let section: string | undefined;
    const orderedOpenItems = nextSlots.flatMap((slot) => {
      if (slot.type === "header") {
        section = slot.section;
        return [];
      }
      const nextSection = section;
      if (slot.item.section !== nextSection) {
        void updateChecklistItem(slot.item.id, { section: nextSection });
      }
      return slot.item.id;
    });
    void reorderItems([...orderedOpenItems, ...done.map((item) => item.id)]);
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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-5 pt-6 pb-0">
      <ListHeader list={list}>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Sections</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-40">
            <DropdownMenuItem onClick={() => setAddingSection(true)}>Add section</DropdownMenuItem>
            {sections.length > 0 && <DropdownMenuSeparator />}
            {sections.map((section) => (
              <DropdownMenuItem
                key={section}
                variant="destructive"
                onClick={() => void removeChecklistSection(list.id, section)}
              >
                Remove {section}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </ListHeader>

      {addingSection && (
        <SectionNameField
          onAdd={(name) => {
            void addChecklistSection(list.id, name).then(() => {
              setSelectedSection(name);
              setAddingSection(false);
            });
          }}
          onCancel={() => setAddingSection(false)}
        />
      )}

      <LayoutGroup>
        <div className="flex flex-1 flex-col gap-2 pb-28">
          <Reorder.Group
            axis="y"
            values={openSlots}
            onReorder={persistReorder}
            className="flex flex-col gap-2"
          >
            {openSlots.map((slot) =>
              slot.type === "header" ? (
                <Reorder.Item
                  key={slot.id}
                  value={slot}
                  dragListener={false}
                  className="list-none"
                >
                  <SectionHeader
                    name={slot.section}
                    onRemove={() => void removeChecklistSection(list.id, slot.section)}
                  />
                </Reorder.Item>
              ) : (
                <ReorderableRow key={slot.id} value={slot}>
                  {renderRow(slot.item)}
                </ReorderableRow>
              ),
            )}
          </Reorder.Group>

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

      <StickyAddBar
        label="New item"
        sections={sections}
        selectedSection={selectedSectionName}
        onSectionChange={setSelectedSection}
        onAdd={(name) =>
          addChecklistItem(
            list.id,
            name,
            selectedSectionName ? { section: selectedSectionName } : undefined,
          )
        }
      />

      <DueDateDialog item={dueItem} onClose={() => setDueItem(null)} />
    </div>
  );
}
