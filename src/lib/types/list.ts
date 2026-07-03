/** Money is always integer sen. Never float ringgit. */
export type Sen = number;

/** MVP implements checklist + shopping. 'tracker' (v1.1) and 'mealplan' (later) join this union when built. */
export type ListType = "checklist" | "shopping";

export const TYPE_META: Record<ListType, { label: string; emoji: string }> = {
  checklist: { label: "Checklist", emoji: "✅" },
  shopping: { label: "Shopping", emoji: "🛒" },
};

interface BaseList {
  id: string; // UUID, client-generated
  name: string;
  emoji: string;
  createdAt: number;
  archivedAt: number | null;
  pinned: boolean;
}

export interface ChecklistList extends BaseList {
  type: "checklist";
  /** Ordered section names — optional grouping, checklist only. */
  sections?: string[];
}

export interface ShoppingList extends BaseList {
  type: "shopping";
  /** Set on "Done shopping". Completed list is the receipt. */
  completedAt: number | null;
  /** Estimate snapshotted when "Start Shopping" is tapped — powers est vs actual. */
  estTotalAtStart: Sen | null;
}

export type List = ChecklistList | ShoppingList;

interface BaseItem {
  id: string;
  listId: string;
  name: string;
  /** For shopping lists this means "in trolley". */
  checked: boolean;
  sortOrder: number;
}

export interface ChecklistItem extends BaseItem {
  note?: string;
  dueAt?: number;
  /** Section name — must match an entry in the list's `sections`. */
  section?: string;
}

export interface ShoppingItem extends BaseItem {
  qty: number;
  unit?: string;
  /** Per unit, integer sen. Never required, never nagged. */
  price?: Sen;
  weight?: number;
}

export type Item = ChecklistItem | ShoppingItem;

/** Row total for a shopping item, or null while unpriced. */
export function itemTotal(item: ShoppingItem): Sen | null {
  return item.price === undefined ? null : item.qty * item.price;
}

/** Running total for a set of rows — "RM 38.70 so far + 2 items belum key in." */
export function shoppingTotals(items: ShoppingItem[]): { total: Sen; unpricedCount: number } {
  return items.reduce(
    (acc, item) => {
      const total = itemTotal(item);
      if (total === null) acc.unpricedCount += 1;
      else acc.total += total;
      return acc;
    },
    { total: 0, unpricedCount: 0 },
  );
}
