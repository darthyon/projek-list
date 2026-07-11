"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MealPlanItem } from "@/lib/types/list";

interface NoteDialogProps {
  item: MealPlanItem | null;
  onSave: (note: string | undefined) => void;
  onClose: () => void;
}

export function NoteDialog({ item, onSave, onClose }: NoteDialogProps) {
  const [value, setValue] = useState("");

  const [prevId, setPrevId] = useState<string | null>(null);
  if (item && item.id !== prevId) {
    setPrevId(item.id);
    setValue(item.note ?? "");
  }
  if (!item && prevId !== null) setPrevId(null);

  function handleSave() {
    if (!item) return;
    const trimmed = value.trim();
    onSave(trimmed || undefined);
    onClose();
  }

  function handleClear() {
    if (!item) return;
    onSave(undefined);
    onClose();
  }

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Note</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Jot down ingredients or prep steps.
        </p>
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) {
              handleSave();
            }
          }}
          placeholder="e.g. 2 eggs, 1 cup flour, pinch of salt"
          aria-label="Note"
          rows={4}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <div className="flex gap-2">
          {item?.note && (
            <Button variant="outline" className="flex-1" onClick={handleClear}>
              Clear
            </Button>
          )}
          <Button className="flex-1" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
