# Auto-updater

Miqāt uses [`electron-updater`](https://www.electron.build/auto-update) to silently fetch + stage new versions. When a download completes, a banner appears above the TopBar with a **Restart & install** button.

## How it works

1. On app start (packaged builds only — dev skips), `auto-updater.ts` calls `autoUpdater.checkForUpdates()` against the configured publish endpoint.
2. If a newer `latest.yml` is found, the matching artifact downloads in the background.
3. Status flows to the renderer via the `update:status` IPC channel, rendered by [UpdateBanner.tsx](../client/src/components/layout/UpdateBanner.tsx).
4. User clicks **Restart & install** → `quitAndInstall()` → app re-launches on the new version.
5. Whether the user clicks or not, if `autoInstallOnAppQuit: true` (our default), the pending update installs the next time they quit the app.

Checks re-run every hour while the app is open. Errors are logged to `electron-log` (persisted under `%APPDATA%/Miqaat/logs/`) but don't surface to the user.

## Configure the publish endpoint

[electron/package.json](../electron/package.json) lists **two** providers in `build.publish`:

```json
"publish": [
  {
    "provider": "generic",
    "url": "https://updates.miqaaat.com/",
    "channel": "latest"
  },
  {
    "provider": "github",
    "owner": "bdevgroup",
    "repo": "miqaat",
    "releaseType": "release"
  }
]
```

When you `npm run release`, electron-builder uploads artifacts to **both** destinations. The installed app's auto-updater client checks **the first one** (`generic`) for `latest.yml` — so `updates.miqaaat.com` remains primary; GitHub Releases is the redundant copy.

If you'd rather make GitHub primary (e.g. before `updates.miqaaat.com` is set up), reorder the array.

### Provider notes

| Provider | Pros | Cons |
| --- | --- | --- |
| **Generic HTTP** (our primary) | Works with any static host (nginx, Netlify, R2, Spaces). | No signing by default; requires DNS + a host. |
| **GitHub Releases** (alternate) | Free, versioned, built-in auth for private repos. | Requires `GH_TOKEN` at publish time; rate-limited at very high download volume. |
| **S3 / CloudFront** | Fast CDN. Set `provider: 's3'`. | Needs IAM. |

For production, prefer **GitHub Releases** or a signed S3 setup so auto-updates can't be hijacked by an attacker serving a poisoned `latest.yml`.

> **Update the `owner` and `repo`** before your first GitHub release if needed: the publisher is set to `bdevgroup/miqaat`. If your GitHub org or repo name differs, edit `build.publish[1]` accordingly.

## Publishing a new version

1. Bump version in `/package.json`, `/server/package.json`, `/client/package.json`, and `/electron/package.json` (all four — see `CHANGELOG.md` template).
2. Add a CHANGELOG entry.
3. (One-time) Set `GH_TOKEN` in your environment with `repo` scope on the target GitHub repo.
4. `npm run release` — does the full chain: builds all three workspaces, populates `electron/node_modules`, then runs `electron-builder --publish=always`. Artifacts (`Miqaat-<version>-win.zip` + `latest.yml`) upload to both providers.
5. Running apps pick up the update within an hour or on next launch.

```bash
# Full release (production)
GH_TOKEN=ghp_xxx npm run release

# Draft release on GitHub side (no public release until you click Publish in the GH UI)
GH_TOKEN=ghp_xxx npm run release:draft

# Local-only build (no publish)
npm run package
```

`release:draft` uses `--publish=onTagOrDraft`, which uploads to GitHub Releases as a draft and **does not** push to the generic provider. Useful for staging before the public release URL flips.

## Code signing — the unshipped prerequisite

Windows auto-updates **should** be code-signed, otherwise:
- Users see a SmartScreen "Unknown publisher" warning on every update.
- Some corporate endpoint-protection tools reject the unsigned installer silently.

We haven't set this up yet. The moment you have a cert, add to `electron/package.json`:

```json
"win": {
  "target": ["zip", "dir"],
  "icon": "resources/icon.ico",
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "@env CSC_KEY_PASSWORD"
}
```

macOS needs Developer ID Application + Notarization. Both are paid and involve Apple/Microsoft account setup — separate workstream.

## Dev mode

`initAutoUpdater()` is a no-op when `!app.isPackaged` (dev). Update UI in the React app degrades gracefully: `window.electronAPI?.getUpdateStatus` is undefined in a regular browser, so the banner never renders.

If you need to test the renderer UI paths without a real update server, temporarily short-circuit the status in [useUpdater.ts](../client/src/hooks/useUpdater.ts) (`setStatus({ kind: 'downloaded', version: '1.0.1' })`).

## Logs & debugging

- Log file: `%APPDATA%/Miqaat/logs/main.log` (Windows) · `~/Library/Logs/Miqaat/main.log` (macOS)
- electron-updater prints one `[updater] status=<kind>` line per transition there.
- Common error "HttpError: 404" on first boot means the configured publish URL isn't serving `latest.yml`. Either fix the upload or disable checks by returning early in `initAutoUpdater`.
