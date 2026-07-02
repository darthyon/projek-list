# Screen Inventory — Projek List MVP

Mental model: three contexts — at home planning, in store shopping, everything else.
Areas: Home · Create · Checklist · Shopping · Settings. Nine screens/sheets. That is the whole app.
SCR-IDs map to components; reference them in /spec and /component.

## Home

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-HOME-01 | Home (command centre) | App launch, 🏠 tab | Open a list |

Hierarchy (zen order): greeting (text-only hero, no illustration) → quick-create chips → lists → nav.

**States — SCR-HOME-01:**
- Empty (first use): no illustration. Chips grow with one-line pitches — "✅ Checklist — for things to do" FIRST, "🛒 Shopping — for things to buy" second. Greeting: "New here? Make your first list la."
- Chips: equal size, equal treatment, accent only as dot/emoji. Never chip-fill color.
- Lists: interleaved by recency, pinned first. NEVER grouped by type (app must read general-purpose).
- Cards carry live state: checklist "6/10 done"; shopping mid-trip "🛒 RM 42.30 · 3 left" with tint — resumable from home.
- Completed shopping lists sit dimmed at bottom (they are the receipts/past trips).
- Long-press card: Duplicate / Pin / Archive.
- Greeting system: time-aware rotating pool, always list-agnostic ("Morning. What's the plan?" / "All quiet. Suspicious."). One exception: contextual second line when resumable trip exists — "Trolley still half full, by the way."
- Edge: 20+ lists → scroll (search is v1.1). Long names truncate 1 line.

## Create

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-CREATE-01 | New List (bottom sheet) | ➕ tab, home chips | Pick type → name → land in list |

**States:**
- Sheet, not screen. Type preselected if entered via chip. Name autofocused, keyboard up.
- Name free-form for all types. Emoji auto-suggested from name ("pasar" → 🥬), tappable to change.
- Edge: empty name → auto-name "Shopping · 2 Jul". Never block creation on naming.

## Checklist

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-CHK-01 | Checklist detail | Home card, post-create | Add + check items |

**States:**
- Empty: add-input focused, rotating ghost text. No blank void.
- Check: strike → sinks below "Done" divider after a beat (FLIP + haptic). Core micro-delight; polish budget lives here. Uncheck restores position.
- All done: one-time settle line "All settled. Syok." Small. No confetti storm.
- Delete: swipe → undo toast 5s. Undo-not-confirm is system-wide.
- Edge: text wraps max 2 lines. Due date = quiet badge; overdue = warm red. Color IS the reminder in MVP.
- Header overflow: rename/emoji, duplicate, archive (no list-settings screen).

## Shopping

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-SHOP-01 | Shopping list (plan view) | Home card, post-create | Build the list |
| SCR-SHOP-02 | Shop Mode | "Start Shopping" CTA | Tap item → into trolley |
| SCR-SHOP-03 | Trip summary (sheet) | "Done" in Shop Mode | Close the trip |

**States — SCR-SHOP-01 (plan view):**
- Row: name · qty stepper · price chip (unpriced = dashed "RM —"). Price NEVER required, never nagged.
- Footer: "est. RM 23.50 · 3 items no price yet" — informative, no warning color.
- Sticky CTA "Start Shopping 🛒" — the one loud element.
- Empty: input focused, hint "Chicken, milk, that thing you always forget."
- Desktop: rapid keyboard entry (type, Enter, next) — the preplan-on-laptop mode.

**States — SCR-SHOP-02 (Shop Mode — the wedge screen):**
- Full-screen takeover, distinct background tint. User must FEEL the mode switch.
- Two groups: "Shelf" (top), "In trolley 🛒" (below). Whole row = tap target. Tap → row slides into trolley + haptic. Trolley metaphor: checking off = putting in real trolley.
- Entering trolley with no price → sen-first price pad slides up, one tap to skip. Catch price while user holds the item.
- Pinned bottom bar: running total "RM 38.70 so far" + "2 left". Unpriced in trolley: "+ 2 items belum key in." Total = pre-cashier estimate.
- Full CRUD on the go: add bar available, qty steppers, swipe delete, tap name to edit. Plan/shop are lenses, not permission levels.
- "Start Shopping" tap snapshots estTotalAtStart (sen) for est-vs-actual.
- Shelf empty: "Shelf clear. All in trolley." + Done rises.
- Abandon mid-trip: state persists locally, home card shows resumable trip. Zero network dependency — no error states possible.
- Desktop: centered narrow column, no special investment.

**States — SCR-SHOP-03 (trip summary sheet):**
- Rendered as paper receipt (see DESIGN.md `<Receipt>`): total, item count, est-vs-actual one-liner "Estimated RM 45.00, kena RM 48.20."
- Prints in (slide-up + overshoot, once). Primary: "Done shopping" → sets completedAt. Quiet secondary: "Archive list."
- NO reset prompt, NO clone suggestion — reuse is user-initiated Duplicate (scrapped reset: system mutation confuses).

## Settings

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-SET-01 | Settings | ⚙️ tab | Adjust app basics |
| SCR-SET-02 | Archived lists | Settings row | Restore or delete |

- SCR-SET-01, exhaustively: currency (RM, display-only), theme (system/light/dark), export/import JSON, archived lists, about. Five rows. Growth past seven = something wrong.
- SCR-SET-02 empty: "Nothing archived. Everything still in play."

## Responsive shell (all screens)

| Breakpoint | Shell |
|---|---|
| <768 | Bottom nav, bottom sheets |
| ≥768 | Left rail (same 3 items), sheets → centered dialogs, home = card grid |
| ≥1024 | Master-detail: list index pane + open list pane |

Same components everywhere; only shell (nav position, pane count, sheet-vs-dialog) responds.

## Out of scope

| Screen | Why cut |
|---|---|
| Onboarding tour | Empty-state-as-teacher; tours get skipped |
| Item detail screen | Inline edit everywhere; detail-per-item is Notion gravity |
| Search | v1.1; scroll suffices at MVP counts |
| Stats / spend history / past-trips screen | Analytics ban; completed lists ARE the receipts |
| Reminder settings | v1.1 with Convex butler |
| Tracker + Meal Plan screens | v1.1 / later |
| Login / profile | No auth MVP |
| List settings screen | Header overflow menu covers it |

## Open questions
None. /flow unblocked.
