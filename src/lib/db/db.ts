import Dexie, { type Table } from "dexie";
import type { Item, List } from "@/lib/types/list";

// Table, not EntityTable — EntityTable's mapped InsertType collapses
// discriminated unions to their common keys.
class ProjekListDB extends Dexie {
  lists!: Table<List, string>;
  items!: Table<Item, string>;

  constructor() {
    super("projek-list");
    this.version(1).stores({
      lists: "id, createdAt, archivedAt, pinned",
      items: "id, listId, [listId+sortOrder]",
    });
  }
}

export const db = new ProjekListDB();
