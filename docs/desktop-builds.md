# Desktop Builds

## Commands

```bash
npm run build       # compiles server, client, electron
npm run package     # + runs electron-builder (ZIP target)
```
Output: `electron/dist-build/` containing the portable ZIP and an unpacked `win-unpacked/` folder.

## electron-builder config

In `electron/package.json`:

```json
{
  "build": {
    "appId": "com.developbettersolutions.miqaat",
    "productName": "Miqaat",
    "asar": true,
    "files": [ "dist/**/*", "resources/**/*", "node_modules/**/*" ],
    "extraResources": [
      { "from": "../server/dist", "to": "server" },
      { "from": "../client/dist", "to": "client" }
    ],
    "asarUnpack": ["node_modules/better-sqlite3/**/*"],
    "win": { "target": ["zip", "dir"], "icon": "resources/icon.ico" },
    "mac": { "target": ["zip", "dir"], "icon": "resources/icon.png" }
  }
}
```

### Why ZIP, not NSIS?
NSIS requires extracting code-signing binaries from an archive that contains macOS symlinks, which needs Windows Developer Mode or admin privileges. ZIP target avoids this.

## Required asset files

Before packaging, ensure `electron/resources/` contains:
- `icon.ico` — 256×256 **single-size** ICO (multi-size ICOs render at wrong sizes on Windows 10)
- `icon.png` — 512×512 PNG
- `tray-32.png` — **exactly** 32×32 (no runtime resize — Electron blurs it)
- `audio/athan-makkah.mp3` — shipped fallback reciter
- `audio/dua-after-athan.mp3` — optional dua

## DB path strategy

`DB_PATH` is set in `electron/src/main.ts`:
```ts
process.env.DB_PATH = path.join(app.getPath('userData'), 'miqaat.db');
```
- Windows: `%APPDATA%/Miqaat/miqaat.db`
- macOS:   `~/Library/Application Support/Miqaat/miqaat.db`

If the user previously ran the pre-rebrand "Mothern Athan" build, the main process copies their legacy DB (`%APPDATA%/Mothern Athan/mothern-athan.db`) into the new location on first launch. Idempotent — skipped if the new path already has a DB.

This survives app rebuilds. Never put the DB inside `resources/` — it gets wiped on reinstall.

## In-process server + module shim

The electron package declares the NestJS deps as **direct dependencies** so they're shared with the server at runtime (no second `node_modules`). `resolve-shim.ts` patches `Module._resolveFilename` so that code running from `resources/server/main.js` can resolve modules from the electron package's own `node_modules`.

## Build verification checklist

- [ ] `npm run dev` — splash → app, prayer grid renders.
- [ ] `npm run package` — ZIP exists in `electron/dist-build/`.
- [ ] Launch ZIP → `%APPDATA%/Miqaat/miqaat.db` created.
- [ ] `curl http://127.0.0.1:<port>/api/health` — 200 while app running.
- [ ] Tray icon visible and crisp (no blur).
- [ ] No CSP violations in DevTools console.
- [ ] Network disconnected → prayer times still render (`source: 'local'`).

## Playwright smoke test

An automated boot test lives at [e2e/smoke.spec.ts](../e2e/smoke.spec.ts) and packages + launches the unpacked app, then asserts the app renders prayers, the brand logo cycles through its states, and the console stays CSP-clean.

```bash
npm run test:e2e:setup    # build + populate electron/node_modules + electron-builder --dir
npm run test:e2e          # run the Playwright tests against the unpacked binary
```

The setup step runs `npm install --no-workspaces --install-strategy=nested --omit=dev` inside `electron/` before packaging. electron-builder needs a populated `electron/node_modules` tree, and npm workspaces hoist everything to the repo root — this step undoes the hoist for the electron app only.

If the setup step fails with `EBUSY: resource busy or locked` on `app-builder-bin`, that's antivirus scanning during extraction. Re-run — the native-rebuild step is idempotent.

### Environment gotcha

`ELECTRON_RUN_AS_NODE=1` lingers in the shell after electron-builder's native-rebuild step. If a later command (like `./Miqaat.exe --help`) just prints Node help, unset it: `unset ELECTRON_RUN_AS_NODE`. The Playwright launcher already scrubs this variable from the child process env so tests are unaffected.
