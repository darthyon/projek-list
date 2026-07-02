"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toDatetimeLocal, fromDatetimeLocal } from "@/lib/dates";
import { updateChecklistItem } from "@/lib/db";
import type { ChecklistItem } from "@/lib/types/list";

interface DueDateDialogProps {
  item: ChecklistItem | null;
  onClose: () => void;
}

export function DueDateDialog({ item, onClose }: DueDateDialogProps) {
  const [value, setValue] = useState("");

  // Sync draft when a new item opens the dialog — state-during-render.
  const [prevId, setPrevId] = useState<string | null>(null);
  if (item && item.id !== prevId) {
    setPrevId(item.id);
    setValue(item.dueAt !== undefined ? toDatetimeLocal(item.dueAt) : "");
  }
  if (!item && prevId !== null) setPrevId(null);

  async function save() {
    if (!item) return;
    const dueAt = value ? fromDatetimeLocal(value) : undefined;
    await updateChecklistItem(item.id, { dueAt });
    onClose();
  }

  async function clear() {
    if (!item) return;
    await updateChecklistItem(item.id, { dueAt: undefined });
    onClose();
  }

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Due date</DialogTitle>
        </DialogHeader>
        <Input
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Due date and time"
        />
        <div className="flex gap-2">
          {item?.dueAt !== undefined && (
            <Button variant="outline" className="flex-1" onClick={() => void clear()}>
              Clear
            </Button>
          )}
          <Button className="flex-1" onClick={() => void save()} disabled={!value}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
