import { db } from "./db";
import {
  TYPE_META,
  type List,
  type ListType,
  type ShoppingItem,
  itemTotal,
} from "@/lib/types/list";

/** "2 Jul" — used for auto-names and clone suffixes. */
function shortDate(ts = Date.now()): string {
  return new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short" }).format(ts);
}

export async function createList(input: {
  type: ListType;
  name?: string;
  emoji?: string;
}): Promise<List> {
  const meta = TYPE_META[input.type];
  const base = {
    id: crypto.randomUUID(),
    name: input.name?.trim() || `${meta.label} · ${shortDate()}`,
    emoji: input.emoji ?? meta.emoji,
    createdAt: Date.now(),
    archivedAt: null,
    pinned: false,
  };
  const list: List =
    input.type === "shopping"
      ? { ...base, type: "shopping", completedAt: null, estTotalAtStart: null }
      : { ...base, type: "checklist" };
  await db.lists.add(list);
  return list;
}

export function getList(id: string): Promise<List | undefined> {
  return db.lists.get(id);
}

/** Home order: pinned first, then newest. */
export async function getActiveLists(): Promise<List[]> {
  const lists = await db.lists.filter((l) => l.archivedAt === null).toArray();
  return lists.sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt,
  );
}

export async function getArchivedLists(): Promise<List[]> {
  const lists = await db.lists.filter((l) => l.archivedAt !== null).toArray();
  return lists.sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0));
}

export function renameList(id: string, name: string): Promise<number> {
  return db.lists.update(id, { name: name.trim() });
}

export function setListEmoji(id: string, emoji: string): Promise<number> {
  return db.lists.update(id, { emoji });
}

export async function togglePinned(id: string): Promise<void> {
  const list = await db.lists.get(id);
  if (list) await db.lists.update(id, { pinned: !list.pinned });
}

export function archiveList(id: string): Promise<number> {
  return db.lists.update(id, { archivedAt: Date.now() });
}

export function restoreList(id: string): Promise<number> {
  return db.lists.update(id, { archivedAt: null });
}

export async function deleteList(id: string): Promise<void> {
  await db.transaction("rw", db.lists, db.items, async () => {
    await db.items.where("listId").equals(id).delete();
    await db.lists.delete(id);
  });
}

/**
 * Clone (user-initiated — there is no auto-reset). Copies items with qty/price
 * intact, unchecks everything, clears trip state. "Groceries" → "Groceries · 2 Jul".
 */
export async function duplicateList(id: string): Promise<List | undefined> {
  const source = await db.lists.get(id);
  if (!source) return undefined;

  const base = {
    ...source,
    id: crypto.randomUUID(),
    name: `${source.name} · ${shortDate()}`,
    createdAt: Date.now(),
    archivedAt: null,
    pinned: false,
  };
  const clone: List =
    base.type === "shopping" ? { ...base, completedAt: null, estTotalAtStart: null } : base;

  const items = await db.items.where("listId").equals(id).sortBy("sortOrder");
  const clonedItems = items.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
    listId: clone.id,
    checked: false,
  }));

  await db.transaction("rw", db.lists, db.items, async () => {
    await db.lists.add(clone);
    await db.items.bulkAdd(clonedItems);
  });
  return clone;
}

/** Snapshot the estimate and (re)open the trip. */
export async function startShopping(id: string): Promise<void> {
  const list = await db.lists.get(id);
  if (!list || list.type !== "shopping") return;
  const items = (await db.items.where("listId").equals(id).toArray()) as ShoppingItem[];
  const est = items.reduce((sum, item) => sum + (itemTotal(item) ?? 0), 0);
  await db.lists.put({ ...list, estTotalAtStart: est, completedAt: null });
}

export async function completeShopping(id: string): Promise<void> {
  const list = await db.lists.get(id);
  if (!list || list.type !== "shopping") return;
  await db.lists.put({ ...list, completedAt: Date.now() });
}
