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
import type { TrackerItem } from "@/lib/types/list";

interface ThresholdDialogProps {
  item: TrackerItem | null;
  onSave: (threshold: number | undefined) => void;
  onClose: () => void;
}

export function ThresholdDialog({ item, onSave, onClose }: ThresholdDialogProps) {
  const [value, setValue] = useState("");

  const [prevId, setPrevId] = useState<string | null>(null);
  if (item && item.id !== prevId) {
    setPrevId(item.id);
    setValue(item.lowStockThreshold !== undefined ? String(item.lowStockThreshold) : "");
  }
  if (!item && prevId !== null) setPrevId(null);

  function handleSave() {
    if (!item) return;
    const num = parseInt(value, 10);
    onSave(Number.isFinite(num) && num > 0 ? num : undefined);
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
          <DialogTitle>Low stock alert</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Alert when qty drops to this number or below.
        </p>
        <Input
          type="number"
          inputMode="numeric"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSave();
            }
          }}
          placeholder="e.g. 5"
          aria-label="Low stock threshold"
        />
        <div className="flex gap-2">
          {item?.lowStockThreshold !== undefined && (
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
