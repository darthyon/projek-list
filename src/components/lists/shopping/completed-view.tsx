"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ListHeader } from "@/components/lists/list-header";
import { Receipt } from "@/components/shop-mode/receipt";
import { duplicateList, getItems, startShopping } from "@/lib/db";
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
          onClick={() => {
            void duplicateList(list.id).then((clone) => {
              if (clone) {
                toast("Cloned for the next trip");
                router.push(`/list?id=${clone.id}`);
              }
            });
          }}
          className="h-11 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          Duplicate for next trip
        </button>
        <button
          type="button"
          onClick={() => {
            void startShopping(list.id).then(() =>
              router.push(`/list?id=${list.id}&mode=shop`),
            );
          }}
          className="h-10 w-full rounded-full text-sm text-muted-foreground transition-colors hover:bg-secondary"
        >
          Reopen this trip
        </button>
      </div>
    </div>
  );
}
