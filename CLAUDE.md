# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive hex star map for the Explorers RPG: a Vite + TypeScript single-page app (no framework, direct DOM/SVG manipulation) backed by Firebase Auth (Google sign-in) and Firestore.

## Commands

```bash
npm run dev            # Vite dev server; in dev mode the app connects to the Firebase emulators
npm run build          # tsc --noEmit type-check, then vite build -> dist/
npm run preview        # serve the built dist/
firebase emulators:start   # Auth on :9099, Firestore on :8080 (from firebase.json)
npm run migrate        # seed the Firestore *emulator* from scripts/migrate-data.ts
npm run migrate_prod   # same script against the PRODUCTION Firestore — avoid unless explicitly asked
```

There are no tests and no linter. `npm run build` (strict TS with `noUnusedLocals`/`noUnusedParameters`/`noImplicitReturns`) is the correctness check.

## Deployment

Pushes to `main` deploy to **GitHub Pages** via `.github/workflows/deploy.yml` (Node 20, `npm ci && npm run build`, uploads `dist/`). That is why `vite.config.ts` sets `base: '/explorers/'`. The README's Firebase Hosting instructions (`firebase.json` hosting block) are an alternative/older path. `firestore.rules` is deployed separately with the Firebase CLI.

## Architecture

The site has two Vite pages, both listed in `build.rollupOptions.input` in `vite.config.ts`. Add any new page there too, or it won't be built.
- `/explorers/` (`index.html` → `main.ts`): the hex system map.
- `/explorers/timeline/` (`timeline/index.html` → `timeline/timeline.ts`): a square-grid deck plan (`timeline/deck-plan.png`) for animating characters over time. Locations are **zones**, not grid squares. `timeline/zones.json` defines each room and hallway segment as a polygon in image-pixel coordinates (optional `anchor` = where tokens stand and routes pass), plus `edges`, the adjacency graph. `timeline/zones.ts` loads it and provides `route(from, to)` (BFS over the edges) so movement follows hallways. If the image changes, re-trace the polygons in pixel space.

`firebase.ts` initializes the app, `db` and `auth` once and connects to the emulators when `import.meta.env.DEV`. Every page imports it rather than calling `initializeApp` itself.

- `main.ts` — system map entry point. Handles auth state, Map/Paths tab switching, description edit-in-place, the settings dialog (character name stored in `users/{uid}`), and the ACL admin UI.
- `mapview.ts` — builds the SVG map (a fixed 10×11 `Hexmap`, radius 70) and subscribes with `onSnapshot` to `systems` and `paths` for real-time updates. It owns the `entities` id→Entity registry, exposed globally as `window.getEntities()` so `main.ts` can resolve edit-icon clicks.
- `view.ts` — SVG rendering of hexes and path segments, hover/pin ("click to pin") behavior for the `#data-contents` side panel, and the `isEditing` flag that suppresses hover updates while editing.
- `model.ts` — `Entity` base class with `Hex` and `PathSegment` subclasses. `makeDescription()` produces the side-panel HTML (descriptions are rendered as Markdown via `marked`).
- `hexmap.ts` — pure hex-grid geometry (cell centers, mesh path).
- `pathview.ts` — the "Paths" tab: a table view of the `paths` collection with editable rows (add/delete/update) and JSON import/export via `json.ts`. Unlike the map it uses one-shot `getDocs`, not snapshots.

### Coordinates

Hexes are stored with zero-based array `col`/`row`. The display coordinate (e.g. `1612`) adds an offset of `first_c = 16`, `first_r = 11` (`Hex.getDisplayCoord()`); the same offsets appear in `mapview.ts` and `scripts/migrate-data.ts` and must stay in sync.

### Firestore data shape

- `systems/{id}`: `{ name, col, row, description, href }`
- `paths/{id}`: `{ hex1, hex2, offset1, offset2, startDate?, endDate?, description }` — `hex1`/`hex2` are system **names**, not ids. `mapview.ts` resolves them through `hexesByName`, keyed by name with whitespace stripped, so a path whose system name doesn't match is silently not drawn. Dates are `{ day, year }`.
- `users/{uid}`: `{ email, displayName, characterName? }`
- `acls/roles`: single document `{ admins: [uid], realms: { systems: { editors: [uid] }, paths: { editors: [uid] } } }`.

### Access control

Writes are enforced by `firestore.rules`: `systems`/`paths` writable by admins or that realm's editors; `acls` writable by admins, or by any signed-in user if `acls/roles` doesn't exist yet (bootstrap: the "create ACLs" button makes the current user admin). The client-side checks in `main.ts` (`isEditor`, `isAdmin`) only gate the UI and cache roles in memory after the first fetch. When adding a new realm/collection, update both `firestore.rules` and the realm handling in the UI.

## Legacy files

`json.html` references jQuery/`data.js`, which no longer exist; it is a leftover from the pre-Firebase version and is not part of the Vite build.
