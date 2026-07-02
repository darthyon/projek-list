import type {
  ChecklistItem,
  ChecklistList,
  ShoppingItem,
  ShoppingList,
} from "@/lib/types/list";

/**
 * Factories return domain types, never storage row types — same objects feed
 * Dexie today, Convex later, tests always. Curated Malaysian pools instead of
 * faker: realistic names and prices reveal layout bugs lorem ipsum hides.
 */

const GROCERY_POOL: Array<{ name: string; price?: number; unit?: string }> = [
  { name: "Ayam (whole)", price: 1250, unit: "kg" },
  { name: "Milo 2kg", price: 2890 },
  { name: "Telur gred A (30)", price: 1450 },
  { name: "Bawang merah", price: 380, unit: "kg" },
  { name: "Ikan kembung", price: 1100, unit: "kg" },
  { name: "Beras 10kg", price: 3200 },
  { name: "Roti Gardenia", price: 285 },
  { name: "Sayur sawi", unit: "kg" },
  { name: "Kicap manis", price: 460 },
  { name: "Santan kotak", price: 240 },
  { name: "Maggi kari (5)", price: 490 },
  { name: "Tisu dapur" },
];

const TASK_POOL = [
  "Bayar bil elektrik",
  "Renew roadtax",
  "Pack charger",
  "Call dentist",
  "Sidai kain",
  "Buy birthday card",
  "Return library book",
  "Servis kereta",
];

let counter = 0;
function pick<T>(pool: T[]): T {
  return pool[counter++ % pool.length];
}

export function createChecklistList(overrides?: Partial<ChecklistList>): ChecklistList {
  return {
    id: crypto.randomUUID(),
    type: "checklist",
    name: "Weekend prep",
    emoji: "✅",
    createdAt: Date.now(),
    archivedAt: null,
    pinned: false,
    ...overrides,
  };
}

export function createShoppingList(overrides?: Partial<ShoppingList>): ShoppingList {
  return {
    id: crypto.randomUUID(),
    type: "shopping",
    name: "Groceries",
    emoji: "🛒",
    createdAt: Date.now(),
    archivedAt: null,
    pinned: false,
    completedAt: null,
    estTotalAtStart: null,
    ...overrides,
  };
}

export function createChecklistItem(
  listId: string,
  overrides?: Partial<ChecklistItem>,
): ChecklistItem {
  return {
    id: crypto.randomUUID(),
    listId,
    name: pick(TASK_POOL),
    checked: false,
    sortOrder: counter,
    ...overrides,
  };
}

export function createShoppingItem(
  listId: string,
  overrides?: Partial<ShoppingItem>,
): ShoppingItem {
  const grocery = pick(GROCERY_POOL);
  return {
    id: crypto.randomUUID(),
    listId,
    name: grocery.name,
    checked: false,
    sortOrder: counter,
    qty: 1,
    ...(grocery.price !== undefined && { price: grocery.price }),
    ...(grocery.unit !== undefined && { unit: grocery.unit }),
    ...overrides,
  };
}

export function createShoppingItems(
  listId: string,
  count = 8,
  overrides?: Partial<ShoppingItem>,
): ShoppingItem[] {
  return Array.from({ length: count }, (_, i) =>
    createShoppingItem(listId, { sortOrder: i, ...overrides }),
  );
}

export function createChecklistItems(
  listId: string,
  count = 6,
  overrides?: Partial<ChecklistItem>,
): ChecklistItem[] {
  return Array.from({ length: count }, (_, i) =>
    createChecklistItem(listId, { sortOrder: i, ...overrides }),
  );
}
