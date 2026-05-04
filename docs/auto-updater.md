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

[electron/package.json](../electron/package.json) configures a single provider in `build.publish`:

```json
"publish": [
  {
    "provider": "github",
    "owner": "bdevgroup",
    "repo": "miqaat",
    "releaseType": "release"
  }
]
```

Each runner in the [release matrix](../.github/workflows/release.yml) uploads its platform's artifacts (Windows ZIP, macOS DMG + zip, Linux AppImage + deb, plus `latest*.yml` and `*.blockmap`) to the same GitHub Release. Installed apps' auto-updater checks the GitHub Releases API hourly for a newer `latest{,-mac,-linux}.yml`.

> **Update `owner` / `repo`** if you fork: edit `build.publish[0]` accordingly.

### Why GitHub Releases (and not generic HTTP)?

We previously had a `generic` provider pointing at `updates.miqaaat.com` as a redundant copy. It was dropped in v1.0.2 — the URL had no upload endpoint, electron-builder warned on every release, and a second copy added no real benefit. If you ever set up a self-hosted update server, add it back as an additional `publish` entry; electron-builder publishes to all configured providers in parallel.

### Other providers (for reference)

| Provider | When to consider |
| --- | --- |
| **GitHub Releases** (current) | Free, versioned, integrates with the workflow's `GITHUB_TOKEN`. Rate-limited only at very high download volumes. |
| **S3 / CloudFront** (`provider: 's3'`) | If you outgrow GitHub's bandwidth ceiling. Needs IAM creds in CI. |
| **Generic HTTP** | Self-hosted nginx/Netlify/R2. Useful for fully self-contained distribution. |

## Publishing a new version

See [docs/releasing.md](releasing.md) for the full release process — `npm run release:bump`, the matrix workflow, the revalidate webhook, etc. The TL;DR:

```powershell
npm run release:bump patch -- --push
```

The tag push triggers `.github/workflows/release.yml`, which builds + signs (when configured) + uploads on Windows, macOS, and Linux runners in parallel.

## Code signing — the unshipped prerequisite

Updates **should** be signed; otherwise:
- **Windows:** SmartScreen "Unknown publisher" warning on every install/update. Some corporate endpoint-protection tools reject unsigned installers silently.
- **macOS:** Gatekeeper blocks first launch — users have to right-click → Open the first time. Notarization is required for Apple Silicon Macs to install at all without admin approval.

When you have a Windows cert, add to `electron/package.json`:

```json
"win": {
  "target": ["zip"],
  "icon": "resources/icon.ico",
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "@env CSC_KEY_PASSWORD"
}
```

For macOS Developer ID + Notarization, drop the `"identity": null` flag and set `CSC_LINK` + `CSC_KEY_PASSWORD` + `APPLE_ID` + `APPLE_APP_SPECIFIC_PASSWORD` + `APPLE_TEAM_ID` as repo secrets — electron-builder picks them up from env automatically. See [docs/releasing.md § Code signing](releasing.md#code-signing--the-unshipped-prerequisite).

## Dev mode

`initAutoUpdater()` is a no-op when `!app.isPackaged` (dev). Update UI in the React app degrades gracefully: `window.electronAPI?.getUpdateStatus` is undefined in a regular browser, so the banner never renders.

If you need to test the renderer UI paths without a real update server, temporarily short-circuit the status in [useUpdater.ts](../client/src/hooks/useUpdater.ts) (`setStatus({ kind: 'downloaded', version: '1.0.1' })`).

## Logs & debugging

- Log file: `%APPDATA%/Miqaat/logs/main.log` (Windows) · `~/Library/Logs/Miqaat/main.log` (macOS)
- electron-updater prints one `[updater] status=<kind>` line per transition there.
- Common error "HttpError: 404" on first boot means the configured publish URL isn't serving `latest.yml`. Either fix the upload or disable checks by returning early in `initAutoUpdater`.
