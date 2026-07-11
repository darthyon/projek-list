"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Mascot } from "@/components/ui/mascot";
import { Receipt } from "./receipt";
import { archiveList, completeShopping, restoreList } from "@/lib/db";
import type { ShoppingItem, ShoppingList } from "@/lib/types/list";

interface TripSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: ShoppingList;
  trolley: ShoppingItem[];
}

/** SCR-SHOP-03 — the payoff. No reset prompt, no clone suggestion: reuse is user-initiated Duplicate. */
export function TripSummary({ open, onOpenChange, list, trolley }: TripSummaryProps) {
  const router = useRouter();

  async function done() {
    await completeShopping(list.id);
    onOpenChange(false);
    router.push(`/list?id=${list.id}`);
  }

  async function doneAndArchive() {
    await completeShopping(list.id);
    await archiveList(list.id);
    onOpenChange(false);
    router.push("/");
    toast("Archived", {
      action: { label: "Undo", onClick: () => void restoreList(list.id) },
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-2xl bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="px-0 pb-0">
          <SheetTitle className="sr-only">Trip summary</SheetTitle>
        </SheetHeader>
        <div className="flex items-center justify-center gap-2 pt-1">
          <Mascot pose="arms-crossed" className="size-10" />
          <p className="text-sm text-muted-foreground">Okay lah. Survived.</p>
        </div>
        <div className="max-h-[55vh] overflow-y-auto py-2">
          <Receipt list={list} items={trolley} showEstLine />
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => void done()}
            className="h-12 w-full rounded-full bg-primary text-base font-bold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            Done shopping
          </button>
          <button
            type="button"
            onClick={() => void doneAndArchive()}
            className="h-10 w-full rounded-full text-sm text-muted-foreground transition-colors hover:bg-secondary"
          >
            Done + archive list
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
