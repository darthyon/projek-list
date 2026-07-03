# Projek List

Typed list app — pick what kind of list, get only the controls that type needs.
Malaysia-first. Local-first PWA: data lives on the device, works in supermarket dead zones.

**Live:** https://projek-list.vercel.app

## List types (MVP)

- **✅ Checklist** — things to do. Check-sink animation, due dates, undo everywhere.
- **🛒 Shopping** — things to buy. Shop Mode: tap items into the trolley, sen-first
  price pad, running total before the cashier. Completed trips render as paper receipts.

## Stack

Next.js (static export) · TypeScript · Tailwind · shadcn/ui · Dexie (IndexedDB) ·
Motion · Serwist. No backend, no auth, no network dependency.

## Development

```bash
npm install
npm run dev      # turbopack dev server
npm run build    # webpack build (serwist needs it) → out/
npm run lint
```

Dev seed data: Settings → "Sample data (dev)" → Load.

## Docs

- [PRODUCT.md](PRODUCT.md) — product truth, scope, data model, decisions
- [SCREEN_INVENTORY.md](SCREEN_INVENTORY.md) — screens, states, SCR-IDs
- [DESIGN.md](DESIGN.md) — Warm Paper design language, motion contract, voice rules
- [AGENTS.md](AGENTS.md) — build conventions

Pushes to `main` auto-deploy to Vercel.
