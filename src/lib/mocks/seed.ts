import { db } from "@/lib/db";
import { buildFixtures } from "./fixtures";

/** Dev-only: wipe and reseed IndexedDB with fixture states. Never call in prod paths. */
export async function resetAndSeed(): Promise<void> {
  const { lists, items } = buildFixtures();
  await db.transaction("rw", db.lists, db.items, async () => {
    await db.items.clear();
    await db.lists.clear();
    await db.lists.bulkAdd(lists);
    await db.items.bulkAdd(items);
  });
}
