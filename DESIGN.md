# Design — Projek List — Warm Paper

**Personality:** warm, tactile, quietly witty. **Not:** corporate, gamified, sterile-minimal.
First impression rule: home must read GENERAL list app — clean, zen, one accent max visible. Wedge (Shop Mode) sells itself in the list, not on the front door.

## Layout
- Density: balanced — spacious touch targets on mobile, compact inside receipts.
- Grid: fluid single column mobile; multi-pane desktop (see responsive shell in SCREEN_INVENTORY.md).
- Hierarchy: 3 levels max — page title / card / row. Nothing nests deeper.

## Color
- Surface stack (light): base `#F8F3EA` (matches concept board) → paper card `#FFFDF9` → elevated `#FFFFFF`. Ink `#1C1917`, secondary `#78716C`. Cards are borderless — separation via lighter surface + `--shadow-card` (tight contact + soft warm ambient).
- Dark (day one, system-following): warm charcoal `#1A1815` base — dark paper, never pure black.
- Type accents (sparing): Checklist = leaf green, Shopping = market amber, Tracker = blue (v1.1). Accent appears ONLY in: type chip dot, progress indicator, Shop Mode header tint. Never full-bleed.

## Typography
- Headings: **Shantell Sans** (h1–h3 via base layer). Body/UI: **DM Sans**. Playful-but-dry pairing, decided Jul 2026. Inter deliberately avoided.
- Receipts + all prices: **IBM Plex Mono**.
- `tabular-nums` everywhere a number appears. Prices must not jiggle while typing.
- Scale contrast: medium. Bold only for: totals, list names, primary CTA.

## The receipt (signature element)
- `<Receipt>` component: paper card on cream, mono type, dashed rules, dotted leaders (item ... price), double rule above total, perforated zigzag bottom edge (CSS mask). Built once; used for trip summary, completed list view, future share-as-image.
- Header like store receipt: list name, date-time, item count. Footer: one dry line ("Terima kasih, datang lagi").
- Entrance: prints in — slide-up 400ms slight overshoot, once.
- Restraint: no texture images, no rotation gimmick, no skeuomorphic shadows.

## Motion contract (anti-bloat)
| Rule | Spec |
|---|---|
| Properties | transform + opacity only. Layout moves via FLIP (Framer Motion `layout`). Never animate height/top |
| Durations | micro 120–200ms · structural 250–400ms. Nothing exceeds 400ms |
| Easing | ease-out default; light spring (no wobble) for check + trolley only |
| Reduced motion | prefers-reduced-motion kills decorative motion, state changes instant — handled in shared motion primitives, not per-component |

**Delight budget — complete list, anything not here does not animate:**
1. Check-sink (FLIP below Done divider)
2. Trolley slide (row into "In trolley" group)
3. Receipt print (summary entrance)
4. Success check (SVG stroke-draw, 300ms)
5. Error shake (2px, 3 oscillations — price pad bad input)
6. Undo toast slide-up
7. Price pad slide-up
8. Haptic on check/trolley — navigator.vibrate, Android only; iOS silently no-ops

## Components
- Radius: cards 16px, rows 12px, chips full pill.
- Separation: borderless cards — lighter surface + `--shadow-card`; hairlines only inside receipts. No card borders anywhere (open-trip highlight = subtle ring).
- Feedback: state change first; undo toast for destructive. NO success toasts — the animation is the confirmation. No confirm dialogs anywhere — one exception: archiving a list shows a confirmation dialog (approved Jul 2026; arms-crossed mascot, Archive/Cancel). Everything else stays undo-only, including "Done + archive list" in trip summary.
- Sen-first price pad: custom numeric keypad, digits only, decimal auto-placed from right (420 → RM 4.20). No OS keyboard for prices.

## Icons & illustration
- Type identity (logo-tier, never changes): ✅ Checklist, 🛒 Shopping, 📦 Tracker, 🍳 Meal Plan.
- Per-list emoji: user's own, auto-suggested from name — personality comes from their lists.
- UI glyphs: Lucide outline. No photos, no stock illustration.

### Mascot (the one illustration)
One character: deadpan line-art blob — half-lidded eyes, dot pupils, flat dash mouth, tired but reliable. Never a different character per surface.
- Built as hand-coded inline SVG (`src/components/ui/mascot.tsx`): `stroke: currentColor`, stroke-width 3 on a 64-unit grid, round caps. No fills (except pupils), no shadows, no gradients, no glow. Static — never animated; the delight budget is unchanged.
- Color token `--mascot`: cobalt `#2e4fcc` light / pale blue `#a9bef2` dark. Same silhouette both modes.
- Pose-per-job — each appearance has one deliberate job, never repeated:

| Surface | Pose | Copy |
|---|---|---|
| Home hero | writing | none — greeting pool is the screen's joke |
| Checklist empty state | pointing (at add bar) | "start small. one thing." |
| Shop Mode total dock | peeking (over the total) | "budget check." in info line, only when estimate exists |
| Trip summary sheet | clap | "Okay lah. Survived." |
| Archive dialog | arms-crossed | "Archive this list?" / "You can reopen it later. Probably." |

- Rules: these 5 surfaces ONLY. Never inside list cards or rows. Never attached to money figures. Always `aria-hidden` (decorative). Apple emoji remains the functional icon system — mascot is the personality layer.
- Pose references live in `/design-refs/` (gitignored, not shipped).

## Voice (the "subtle unhinged" contract)
| Rule | Why |
|---|---|
| Deadpan, short. Never exclamation marks | Unhinged is delivery-flat, not loud |
| Jokes only on: greeting, empty states, receipt footer | Never in errors, destructive actions, money displays — money copy always straight |
| Max one joke per screen | Two jokes = trying |
| Emoji are icons, never punctuation in copy | Keeps text zen |
| Copy never replaces information | Model: "Still missing 2 prices. Haven't key in yet." — information WITH personality |
- Greeting pool: time-aware, list-agnostic ("Morning. What's the plan?" / "All quiet. Suspicious."). Contextual trip line only when resumable trip exists.
- Manglish: dry, sparing, natural — never forced.

## Stack (confirmed)
Next.js + TypeScript + Tailwind + shadcn/ui.
- shadcn as-is: Sheet, Dialog, DropdownMenu, Sonner, Switch.
- Override: full token theme → warm palette via CSS variables.
- Build custom: qty stepper, sen-first price pad, `<Receipt>`, check row, bottom nav/rail, type chips.
- Specialist: Framer Motion — FLIP list reordering only; CSS handles the rest.

## Engineering flags for scaffold
- [ ] CSS-variable theming, dark mode day one (not class-toggle bolt-on)
- [ ] next/font: DM Sans + IBM Plex Mono
- [ ] Framer Motion installed before first component
- [ ] tabular-nums utility in Tailwind config
- [ ] Reduced-motion handling in shared motion primitives
- [ ] `<Receipt>` zigzag = CSS mask, one component, reused

## Open questions
None blocking. DM Sans is the only labeled assumption.
