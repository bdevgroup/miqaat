# Releasing

How to ship a new version of Miqāt — from local bump to live download buttons on the landing site.

## TL;DR (the happy path)

```powershell
# from a clean working tree on main
npm run release:bump patch -- --push   # 1.0.3 → 1.0.4
```

That's it. Watch:
- **Build:** [github.com/bdevgroup/miqaat/actions/workflows/release.yml](https://github.com/bdevgroup/miqaat/actions/workflows/release.yml)
- **Release page:** [github.com/bdevgroup/miqaat/releases/latest](https://github.com/bdevgroup/miqaat/releases/latest) (appears once the matrix completes, ~15–25 min)
- **Landing CTAs:** [miqaaat.com](https://miqaaat.com/#download) refreshes within seconds (via the revalidate webhook) or up to 10 min (via ISR fallback).

## What `release:bump` does

The script lives at [scripts/bump-version.mjs](../scripts/bump-version.mjs). When you run it with `--push`:

1. **Pre-flight check** — aborts if your working tree is dirty so unrelated WIP doesn't end up in the release commit.
2. **Bumps all four `package.json` files** to the new version (root, server, client, electron).
3. **Refreshes `package-lock.json`** so workspace cross-refs stay in sync.
4. **Commits** with message `chore: release vX.Y.Z`.
5. **Creates an annotated tag** `vX.Y.Z`.
6. **Pushes branch + tag** to `origin`.

Bump kinds:

| Argument | Behaviour | Example |
| --- | --- | --- |
| `patch` | bug fix or infra change | `1.0.3 → 1.0.4` |
| `minor` | new feature, no breaking change | `1.0.4 → 1.1.0` |
| `major` | breaking schema/IPC/UX change | `1.1.0 → 2.0.0` |
| `1.2.3` | explicit version (e.g. release candidates) | `1.0.4 → 1.2.3` |

If you don't pass `--push`, the script stops after committing + tagging. Push manually with `git push --follow-tags` when ready.

## What happens after the tag pushes

```
        v1.0.4 tag pushed
                │
                ▼
   ┌────── release.yml fires ─────────┐
   │                                  │
   │  matrix:                         │
   │  ┌─────────┐ ┌────────┐ ┌──────┐ │
   │  │ windows │ │ macos  │ │linux │ │ ← all 3 in parallel
   │  └────┬────┘ └───┬────┘ └──┬───┘ │
   │       │          │         │     │
   │       └──────────┴─────────┘     │
   │       all upload to the same     │
   │       GitHub Release             │
   │                                  │
   │  ↓ on full success ↓             │
   │                                  │
   │  revalidate-landing job          │
   │  POSTs /api/revalidate           │
   │  to drop the landing's cache     │
   └──────────────────────────────────┘
```

Each runner produces its platform's artifacts and uploads them to the GitHub Release named after the tag. Expected assets after a successful matrix run:

| File | Where it comes from | Used for |
| --- | --- | --- |
| `Miqaat-X.Y.Z-win.zip` | windows-latest | Windows download + auto-update payload |
| `Miqaat-X.Y.Z-universal.dmg` | macos-latest | macOS download (universal: arm64 + x64) |
| `Miqaat-X.Y.Z-universal-mac.zip` | macos-latest | macOS auto-update payload |
| `Miqaat-X.Y.Z.AppImage` | ubuntu-latest | Linux universal binary (no install) |
| `miqaat_X.Y.Z_amd64.deb` | ubuntu-latest | Debian/Ubuntu/Mint installer |
| `latest.yml` / `latest-mac.yml` / `latest-linux.yml` | each runner | electron-updater manifests |
| `*.blockmap` | each runner | delta updates for electron-updater |

**fail-fast is off** — if one platform breaks, the others still ship. Better partial than nothing. Re-run the failed job alone via the Actions UI ("Re-run failed jobs") once you fix it.

## Updating the changelog

Before bumping, edit [CHANGELOG.md](../CHANGELOG.md):

1. Move whatever's relevant from `## [Unreleased]` into a new `## [X.Y.Z] — YYYY-MM-DD` section.
2. Leave `## [Unreleased]` empty (or add what's still in flight).
3. Commit alongside the version bump or just before — both work.

Categories follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/):

- **Added** — new features users can see.
- **Changed** — behaviour changes for existing features.
- **Fixed** — bug fixes.
- **Removed** — features that went away.
- **Deprecated** — features marked for removal.
- **Security** — security-relevant fixes.
- **CI / Infra** — non-user-facing infrastructure (custom category, optional).

## Manual / non-script releases

If the bump script doesn't fit (e.g. you're cherry-picking a hotfix onto an old branch):

```powershell
# 1. Edit all four package.json versions by hand
# 2. Refresh lockfile
npm install --package-lock-only --no-audit --no-fund

# 3. Commit + annotated tag (lightweight tags don't push with --follow-tags!)
git add package.json package-lock.json server/package.json client/package.json electron/package.json
git commit -m "chore: release v1.0.4"
git tag -a v1.0.4 -m "v1.0.4"

# 4. Push
git push --follow-tags
```

## Re-running a release without bumping

The release workflow accepts `workflow_dispatch` with a `tag` input. From the Actions UI → Release → **Run workflow** → enter the existing tag (`v1.0.3`). Useful for:

- Re-running a failed platform after a CI flake.
- Rebuilding after fixing a workflow bug, without inflating the version number.

The `concurrency` group is keyed on the ref, so if a previous run on the same tag is still going, the new one waits.

## Required GitHub repo secrets

| Secret | Purpose | When |
| --- | --- | --- |
| `GITHUB_TOKEN` | electron-builder uploads to GH Releases | auto-provided by Actions |
| `LANDING_REVALIDATE_URL` | full URL of landing's revalidate endpoint | optional — webhook step skips if unset |
| `LANDING_REVALIDATE_SECRET` | shared secret matching landing's `REVALIDATE_SECRET` | optional, must pair with the URL above |

The two `LANDING_*` secrets are optional — without them, the landing still updates within 10 minutes via ISR, just not instantly. Set them once in `Settings → Secrets and variables → Actions` and never think about them again.

## Required Vercel env vars (landing project)

| Variable | Purpose |
| --- | --- |
| `REVALIDATE_SECRET` | matches `LANDING_REVALIDATE_SECRET` in the app repo. Without it, `/api/revalidate` returns 500 by design (fail closed). |

## Code signing — the unshipped prerequisite

Both Windows and macOS work unsigned today. Users see warnings on first launch:

- **Windows:** SmartScreen "More info → Run anyway".
- **macOS:** Gatekeeper "cannot be opened → right-click → Open".

When you have a cert, the workflow's `Package + publish` step will pick up these env vars automatically (electron-builder reads them):

| Platform | Env vars | Source |
| --- | --- | --- |
| Windows | `CSC_LINK`, `CSC_KEY_PASSWORD` | base64-encoded `.pfx` + password |
| macOS | `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` | Apple Developer ID cert + notarization creds |

Add them as secrets, drop the `mac.identity: null` flag in [electron/package.json](../electron/package.json), and the next release signs and notarizes automatically.

## Troubleshooting

### "The workflow doesn't fire when I push my tag"

Check `git ls-remote --tags origin`. If your tag isn't there, you created a lightweight tag (`git tag v1.0.4`) and pushed with `--follow-tags`, which only transmits annotated tags. Recreate as annotated (`git tag -a v1.0.4 -m "v1.0.4"`) and push.

### "macOS build fails with cert-related error"

If electron-builder can't find a signing identity even with `mac.identity: null`, add `CSC_IDENTITY_AUTO_DISCOVERY: false` to the env block of the `Package + publish` step. The `identity: null` flag tells electron-builder we don't want signing; this env var stops it from probing the keychain.

### "Linux .deb didn't ship"

If only the AppImage shows up on a release: the runner is missing `fakeroot`. The workflow's `Install Linux packaging deps` step should handle this — verify it ran (it's gated on `matrix.os == 'ubuntu-latest'`).

### "The landing still shows the old version"

1. Open `https://miqaaat.com/` in incognito to bypass browser cache.
2. If still stale: the revalidate webhook didn't fire. Either the secrets aren't set, or the workflow's matrix didn't reach full success. Check the `Refresh landing cache` job's logs.
3. ISR fallback kicks in within 10 minutes regardless. After that, the next page request triggers a background refetch and the visitor *after* that one sees the fresh version.

### "Forgot to update CHANGELOG before tagging"

Land the changelog as the next commit on `main` and tag it normally. The `1.0.4` GitHub Release page won't auto-link the changelog; the `body` field on the release is `null` from electron-builder. You can edit the release body in the GitHub UI to paste in the changelog excerpt — pure cosmetics, no functional impact.
