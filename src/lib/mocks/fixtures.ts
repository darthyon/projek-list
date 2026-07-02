import {
  createChecklistItem,
  createChecklistItems,
  createChecklistList,
  createShoppingItems,
  createShoppingList,
} from "./factories";

/** Every UI state the screens must survive — see SCREEN_INVENTORY.md. */
export function buildFixtures() {
  const groceries = createShoppingList({ name: "Groceries", pinned: true });
  const midTrip = createShoppingList({ name: "Pasar malam run", estTotalAtStart: 4500 });
  const doneTrip = createShoppingList({
    name: "Raya restock",
    completedAt: Date.now() - 86_400_000,
    estTotalAtStart: 12_000,
  });
  const packing = createChecklistList({ name: "Camping · Janda Baik", emoji: "🏕️" });
  const longName = createChecklistList({
    name: "Things to settle before mak arrives on Saturday morning (do not procrastinate this time)",
  });
  const unicode = createShoppingList({ name: "Ünïcödé & <special> \"chars\" 🎉" });
  const emptyList = createChecklistList({ name: "Brand new" });
  const archived = createChecklistList({ name: "Old moving list", archivedAt: Date.now() });

  return {
    lists: [groceries, midTrip, doneTrip, packing, longName, unicode, emptyList, archived],
    items: [
      // typical plan view: mix of priced + unpriced
      ...createShoppingItems(groceries.id, 8),
      // mid-trip: some in trolley, one unpriced in trolley (footer edge case)
      ...createShoppingItems(midTrip.id, 5).map((item, i) => ({
        ...item,
        checked: i < 3,
        ...(i === 2 && { price: undefined }),
      })),
      // completed trip = the receipt
      ...createShoppingItems(doneTrip.id, 6).map((item) => ({ ...item, checked: true })),
      ...createChecklistItems(packing.id, 6).map((item, i) => ({ ...item, checked: i < 2 })),
      // edge: overdue + long text + note
      createChecklistItem(packing.id, {
        name: "Pack the big tarp and the extra ropes in case the campsite is muddy again like last time",
        dueAt: Date.now() - 3_600_000,
        note: "Blue bag, top shelf",
        sortOrder: 6,
      }),
      // stress: 100 rows
      ...createChecklistItems(longName.id, 100),
    ],
  };
}
