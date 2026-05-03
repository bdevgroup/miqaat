# Architecture

## Three processes, one app

```
Electron main (Node)  ──── in-process ────▶  NestJS server
                                             │
                                             ▼
                                          SQLite (WAL)
          │
          │ loadURL('http://localhost:5173') in dev
          │ loadFile('client/index.html') in prod
          ▼
     Renderer (Chromium)
     ├── window.__API_URL__  ← injected by main
     └── React app (TanStack Query → axios → NestJS)
```

## Why in-process NestJS?
Spawning a Node child process inside a packaged Electron app fails with `ENOENT` because `process.execPath` is the Electron binary, not Node. Electron's main process is a Node environment — we just `require('server/main.js')` and call `bootstrap(port)`.

A `Module._resolveFilename` shim lets the required server code resolve dependencies from the Electron package's `node_modules` (asar-packed, shared). This avoids bundling `server/node_modules` (saves ~200MB).

## Data flow

- **Settings**: seed defaults at migration v1, patched via `PATCH /api/settings`. Frontend caches via TanStack Query (`['settings']`, 5 min stale).
- **Location**: user-picked, saved in SQLite. Only one `is_current = 1` at a time.
- **Prayer times**: request → cache lookup (`lat, lng, date, method, madhab`) → if stale, compute locally with `adhan` instantly + refresh from Aladhan in background.
- **Countdown**: `TickContext` broadcasts `now: Date` every 1s. Components subscribe via `useTick()`. Query stays out of the 1 Hz hot path.

## Design system

Three themes driven by CSS variables on `<html>`:
- `:root` — Light (white background, teal `#0ea5e9` primary)
- `.dark` — Dark (slate-900 background, teal `#38bdf8` primary)
- `.paper` — Paper (warm off-white `#fafaf7`, ink `#1a1a1a`, muted teal primary)

Typography:
- **Inter** — body/UI
- **JetBrains Mono** — prayer time numerals (`HH:MM`)
- **Caveat** — display (`.font-display`): countdown hero, Hijri card, onboarding headlines

Motif: 8-pointed Islamic star (`<StarMotif />`) as low-opacity watermark behind the next-prayer banner.

## State layers

1. **Server state** — TanStack Query, refetch on focus, cache TTLs per query.
2. **Tick state** — `TickContext`, 1 Hz `setInterval`, reduced from what a naive per-component timer would do.
3. **Audio state** — `zustand` store (`useAudio`) + single `<audio>` ref in `AthanPlayer`.
4. **Theme** — CSS class on `<html>`, source of truth in `settings.theme`.

## Security model

Content-Security-Policy is tight: `connect-src` whitelists localhost + Aladhan + Nominatim + OSM tiles (for v1.1 map). No inline script URLs, no remote scripts. `sandbox: false` in `webPreferences` is required for Radix portals that create blob workers.
