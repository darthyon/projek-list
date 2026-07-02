# Projek List — Product Truth

One sentence: typed list app — user picks what kind of list, app gives only the controls that type needs.

**Is:** fast mobile-first list maker with typed behaviors (check, shop; track later).
**Is not:** Notion, Trello, pantry ERP, recipe app, generic database, productivity suite.
**Wedge:** Shop Mode — quantity + price at the shelf, running total in RM, one-thumb operation. Pre-cashier estimate.
**Positioning:** "The right list for the job." Home sells breadth, list detail sells depth, Shop Mode sells the wedge.

## Scope

### MVP v1
- Checklist type (add, check-sink, due dates shown — no push)
- Shopping type + Shop Mode (trolley metaphor, sen-first price pad, running total, est vs actual)
- Home command centre + 3-tab nav (Home / ➕ New / Settings)
- Duplicate list (universal action — the retention lever)
- Completed shopping list = the receipt (rendered as paper receipt)
- Archive, export/import JSON (no-sync insurance)
- Local-first PWA, dark mode, RM only

### v1.1
- Tracker type (rename from Inventory — qty, unit, "low" flag; no warehouse energy)
- Real reminders: Convex scheduled functions + web push (iOS needs A2HS); email fallback
- Search, settings depth

### Later
- Meal Plan + ingredients → shopping list conversion (merge logic is hard)
- Sharing/sync — backend + auth arrive HERE, not before. Opt-in ("Backup your trips?")
- Multi-currency, templates

### Never / banned
- Auth in MVP, custom fields (Notion trap), price history charts / spend analytics, barcode/OCR, recipe import, WhatsApp API (scrapped — wa.me can't push; Business API too heavy), onboarding tours, per-item detail screens.

## Key decisions (with reasons)
- **Two MVP types, not four** — clarity beats coverage. Tracker v1.1, Meal Plan later.
- **Reset scrapped, clone instead** — system-initiated mutation confuses; user-initiated duplicate matches paper mental model. Clone copies items/qtys/prices, unchecks all, names "Groceries · 9 Jul".
- **Trip entity deleted** — completed list IS the receipt. `estTotalAtStart` snapshotted at "Start Shopping" preserves est-vs-actual.
- **Price = per unit, living value** — survives clone, updated anytime (preplan or mid-aisle). Row total = qty × price.
- **Sen-first price input** — banking-style: digits only, decimal auto-placed (420 → RM 4.20). Maps 1:1 to integer-sen storage.
- **Reminders = due date + overdue color in MVP** — no fake notifications; real push v1.1 via Convex.
- **Home is type-neutral** — chips equal weight, Checklist first, lists never grouped by type. Wedge ≠ positioning.

## Data model (MVP)
```ts
type ListType = 'checklist' | 'shopping' | 'tracker' | 'mealplan';

interface List {
  id: string;               // UUID
  type: ListType;
  name: string;             // free-form, any type; auto-name if skipped ("Shopping · 2 Jul")
  emoji: string;            // auto-suggested from name, user-changeable
  createdAt: number;
  archivedAt: number | null;
  pinned: boolean;
  completedAt: number | null;      // shopping: set on "Done shopping"
  estTotalAtStart: number | null;  // sen, snapshotted at "Start Shopping"
}

interface BaseItem {
  id: string;
  listId: string;
  name: string;
  checked: boolean;         // = in trolley for shopping
  sortOrder: number;
}

interface ChecklistItem extends BaseItem {
  note?: string;
  dueAt?: number;
}

interface ShoppingItem extends BaseItem {
  qty: number;              // default 1
  unit?: string;
  price?: number;           // per unit, integer sen — never required, never nagged
  weight?: number;          // optional metadata
}
```
Discriminated union on `List.type`. One items table, typed accessors. No tags, categories, or relations in MVP.

## Build phases
| Phase | Scope |
|---|---|
| 0 | Docs (done) + scaffold |
| 1 | Types + Dexie layer + mock factories |
| 2 | App shell: nav, home, create sheet |
| 3 | Checklist end-to-end |
| 4 | Shopping + Shop Mode (**test on real phone, real aisle**) |
| 5 | PWA, receipt polish, /deploy |

## Risks
- Not-better-enough than Notes/Keep for plain checklists — Shop Mode must genuinely delight; polish budget goes there.
- Retention — duplicate-list is the lever; watch if it's enough.
- Single-device data loss — export/import JSON ships in MVP as insurance.
- Sharing pressure post-launch — most-requested feature for shopping lists; deliberately deferred to Later.
