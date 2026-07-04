"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { ListHeader } from "@/components/lists/list-header";
import { Receipt } from "@/components/shop-mode/receipt";
import { getItems } from "@/lib/db";
import type { ShoppingItem, ShoppingList } from "@/lib/types/list";

/** Completed shopping list IS the receipt — no separate history screen. */
export function CompletedView({ list }: { list: ShoppingList }) {
  const router = useRouter();
  const items = useLiveQuery(() => getItems(list.id), [list.id]) as
    | ShoppingItem[]
    | undefined;

  if (items === undefined) return null;
  const trolley = items.filter((i) => i.checked);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-5 pt-6">
      <ListHeader list={list} />
      <Receipt list={list} items={trolley} showEstLine />
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="h-11 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          Done with shopping
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="h-10 w-full rounded-full text-sm text-muted-foreground transition-colors hover:bg-secondary"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
