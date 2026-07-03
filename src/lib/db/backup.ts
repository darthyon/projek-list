import { db } from "./db";
import type { Item, List } from "@/lib/types/list";

interface BackupFile {
  app: "projek-list";
  version: 1;
  exportedAt: number;
  lists: List[];
  items: Item[];
}

/** The no-sync insurance — device is source of truth, this is the copy. */
export async function exportBackup(): Promise<Blob> {
  const [lists, items] = await Promise.all([db.lists.toArray(), db.items.toArray()]);
  const payload: BackupFile = {
    app: "projek-list",
    version: 1,
    exportedAt: Date.now(),
    lists,
    items,
  };
  return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
}

/** Merge by id — existing entries with the same id are overwritten, nothing is deleted. */
export async function importBackup(json: string): Promise<{ lists: number; items: number }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Not valid JSON.");
  }
  const data = parsed as Partial<BackupFile>;
  if (data.app !== "projek-list" || !Array.isArray(data.lists) || !Array.isArray(data.items)) {
    throw new Error("Not a Projek List backup file.");
  }
  const lists = data.lists.filter((l): l is List => typeof l?.id === "string" && !!l.type);
  const items = data.items.filter(
    (i): i is Item => typeof i?.id === "string" && typeof i.listId === "string",
  );
  await db.transaction("rw", db.lists, db.items, async () => {
    await db.lists.bulkPut(lists);
    await db.items.bulkPut(items);
  });
  return { lists: lists.length, items: items.length };
}
