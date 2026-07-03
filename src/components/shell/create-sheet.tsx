"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useKeyboardInset } from "@/hooks/use-keyboard-inset";
import { useMediaQuery } from "@/hooks/use-media-query";
import { createList } from "@/lib/db";
import { suggestEmoji } from "@/lib/emoji";
import { cn } from "@/lib/utils";
import { TYPE_META, type ListType } from "@/lib/types/list";

interface CreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetType: ListType;
}

const PITCHES: Record<ListType, string> = {
  checklist: "for things to do",
  shopping: "for things to buy",
};

export function CreateSheet({ open, onOpenChange, presetType }: CreateSheetProps) {
  const router = useRouter();
  const desktop = useMediaQuery("(min-width: 768px)");
  const keyboardInset = useKeyboardInset();
  const [type, setType] = useState<ListType>(presetType);
  const [name, setName] = useState("");

  // Reset form when the sheet opens — state-during-render, not an effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setType(presetType);
      setName("");
    }
  }

  const emoji = suggestEmoji(name, type);

  async function submit() {
    const list = await createList({ type, name, emoji });
    onOpenChange(false);
    router.push(`/list?id=${list.id}`);
  }

  const body = (
    <div className="flex flex-col gap-4 pt-2">
      <div role="radiogroup" aria-label="List type" className="grid grid-cols-2 gap-2">
        {(Object.keys(TYPE_META) as ListType[]).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => setType(t)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors",
              type === t
                ? "border-foreground bg-secondary"
                : "border-border bg-card hover:bg-secondary/50",
            )}
          >
            <span className="text-xl" aria-hidden>
              {TYPE_META[t].emoji}
            </span>
            <span className="text-sm font-medium">{TYPE_META[t].label}</span>
            <span className="text-xs text-muted-foreground">{PITCHES[t]}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl"
          aria-hidden
        >
          {emoji}
        </span>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          placeholder={`${TYPE_META[type].label} · name it or don't`}
          aria-label="List name"
        />
      </div>

      <Button
        onClick={() => void submit()}
        className="h-12 w-full rounded-full text-base font-bold"
      >
        Create
      </Button>
    </div>
  );

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New list</DialogTitle>
          </DialogHeader>
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        style={{ bottom: keyboardInset }}
        className="rounded-t-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="px-0">
          <SheetTitle>New list</SheetTitle>
        </SheetHeader>
        {body}
      </SheetContent>
    </Sheet>
  );
}
