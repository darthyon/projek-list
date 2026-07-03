import { db } from "./db";
import type { ChecklistItem, Item, ShoppingItem } from "@/lib/types/list";

export function getItems(listId: string): Promise<Item[]> {
  return db.items.where("listId").equals(listId).sortBy("sortOrder");
}

async function nextSortOrder(listId: string): Promise<number> {
  const last = await db.items.where("[listId+sortOrder]").between([listId, -Infinity], [listId, Infinity]).last();
  return (last?.sortOrder ?? -1) + 1;
}

export async function addChecklistItem(
  listId: string,
  name: string,
  extra?: Pick<ChecklistItem, "note" | "dueAt" | "section">,
): Promise<ChecklistItem> {
  const item: ChecklistItem = {
    id: crypto.randomUUID(),
    listId,
    name: name.trim(),
    checked: false,
    sortOrder: await nextSortOrder(listId),
    ...extra,
  };
  await db.items.add(item);
  return item;
}

export async function addShoppingItem(
  listId: string,
  name: string,
  extra?: Partial<Pick<ShoppingItem, "qty" | "unit" | "price" | "weight">>,
): Promise<ShoppingItem> {
  const item: ShoppingItem = {
    id: crypto.randomUUID(),
    listId,
    name: name.trim(),
    checked: false,
    sortOrder: await nextSortOrder(listId),
    qty: 1,
    ...extra,
  };
  await db.items.add(item);
  return item;
}

export function updateChecklistItem(
  id: string,
  changes: Partial<Omit<ChecklistItem, "id" | "listId">>,
): Promise<number> {
  return db.items.update(id, changes);
}

export function updateShoppingItem(
  id: string,
  changes: Partial<Omit<ShoppingItem, "id" | "listId">>,
): Promise<number> {
  return db.items.update(id, changes);
}

/** Check off / into the trolley. */
export async function toggleChecked(id: string): Promise<void> {
  const item = await db.items.get(id);
  if (item) await db.items.update(id, { checked: !item.checked });
}

export function deleteItem(id: string): Promise<void> {
  return db.items.delete(id);
}

/** Undo support — re-adds a deleted item with its original id and position. */
export function restoreItem(item: Item): Promise<string> {
  return db.items.add(item);
}
