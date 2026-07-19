# Project
Projek List — typed list app: user picks what kind of list, app gives only the controls that type needs. Malaysia-first, RM default.

# Platform
Mobile-first web app (PWA, installable). Desktop/tablet is a distinct shell, not resized mobile.

# Stack
Framework: Next.js (App Router, static export — no server runtime)
Language: TypeScript (strict, no `any`)
Styling: Tailwind CSS (CSS-variable theming, dark mode day one)
Components: shadcn/ui (warm-palette token overrides)
Animation: Framer Motion (FLIP list reordering only; CSS for the rest)
Persistence: Dexie (IndexedDB) — local-first, device is source of truth
PWA: Serwist service worker
Fonts: DM Sans (UI) + IBM Plex Mono (receipts, prices) via next/font
Deploy: Vercel. Run /deploy security check before every push.

# Backend
None in MVP. No auth, no sync, no network dependency — Shop Mode must work in supermarket dead zones. v1.1 adds Convex as "notification butler" only (push reminders, device-token identity, data stays local).

# Design system
DESIGN.md (root) — Warm Paper direction. Read before any /component or /edit.
Product truth: PRODUCT.md. Screens/states: SCREEN_INVENTORY.md (SCR-IDs map to components).

# File structure
src/
  app/            # routes
  components/
    lists/        # checklist/, shopping/
    shop-mode/    # trolley view, price pad, receipt
    shell/        # nav (bottom bar + desktop rail), home
    ui/           # shadcn + shared primitives (motion primitives live here)
  lib/
    db/           # Dexie schema + typed accessors
    types/        # shared interfaces (discriminated unions on List.type)
  styles/         # tokens, globals

# Conventions
- Component files: PascalCase. Utility files: camelCase.
- All money is integer sen. Never float. Display via shared formatter with tabular-nums.
- Undo, never confirm — no "Are you sure?" dialogs. Destructive = do it + undo toast. One exception: archiving a list uses a confirmation dialog (see DESIGN.md "Mascot"); all other destructive actions stay undo-only.
- Motion: transform/opacity only, ≤400ms, prefers-reduced-motion respected in shared primitives.
- UX copy follows voice rules in DESIGN.md — jokes only on low-stakes surfaces, money copy always straight.
- IDs are UUIDs (future sync insurance).

# Git workflow
Work on `playground` (Vercel preview deploys). `main` = production (auto-deploys to projek-list.vercel.app) — merge to main only when explicitly confirmed. Run /deploy security check before any push.

# Team
Solo (design engineer), Claude Code as build partner.

# Testing
- Write tests in Playwright (E2E) + Vitest (unit).
- Never run tests during chat. Output terminal command for me to run.
- When I paste failure output, diagnose and fix only what's broken.
- No screenshot-based visual testing. No browser preview.
- Playwright MCP only when I explicitly ask. Never fire it proactively.
- After every completed task, list test cases for me to check manually. Cover happy path + edge cases + error states.
