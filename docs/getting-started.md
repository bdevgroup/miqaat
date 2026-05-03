# Getting Started

## Prerequisites
- Node.js 20+
- npm 10+
- Windows 10/11 (primary target) · macOS 13+ (supported)

## Install
```bash
git clone <repo>
cd miqaat
npm install
```
The root installs workspaces: `/server`, `/client`, `/electron`.

> **Note**: `better-sqlite3` is a native module. `npm install` triggers `electron-rebuild` via electron-builder on first package. In dev, it runs against system Node.

## Run in dev
```bash
npm run dev
```
This spins up, in parallel:
- **NestJS** on `http://127.0.0.1:3001` with `--watch`
- **Vite** dev server on `http://localhost:5173`
- **Electron** shell (waits for Vite, then loads `http://localhost:5173`)

DB file is created at `server/miqaat.db` in dev, and `%APPDATA%/Miqaat/miqaat.db` in packaged builds. If upgrading from the pre-rebrand "Mothern Athan" build, the Electron main process copies the legacy `%APPDATA%/Mothern Athan/mothern-athan.db` over on first launch.

## First run
1. Splash → Onboarding opens automatically.
2. Pick a location (GPS or search).
3. Prayer times render using the local `adhan` library (works offline).
4. If online, the backend verifies against Aladhan in the background and updates the cache.

## Environment
- `DB_PATH` — override SQLite path (Electron sets it automatically)
- `PORT` — override server port (dev default 3001)
- `VITE_API_URL` — override API URL for web-only testing

## Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| Blank screen in packaged app | `base: './'` missing in `vite.config.ts` — already set |
| `ENOENT` on server launch in prod | `Module._resolveFilename` shim not installed before `require('server/main.js')` |
| Tray icon blurry | `tray-32.png` must be exactly 32×32 — no runtime `resize()` |
| CSP blocks fetches in packaged app | Add origin to `connect-src` in `client/index.html` |
| Prayer times differ from Aladhan | Expected < 2 min delta between `adhan` local and Aladhan API |
