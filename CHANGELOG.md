# Changelog

All notable changes to this project will be documented in this file. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **Universal macOS build.** Mac target now produces a single `arch: universal` DMG that runs on both Apple Silicon (M-series) and Intel Macs. ~2× file size, ~5 min slower CI, but no more "M1-only" footgun for ~30% of Mac users still on Intel.

### Fixed
- **Linux `.deb` now ships.** v1.0.3's matrix only produced an `AppImage` because the Ubuntu runner didn't have `fakeroot` installed and electron-builder silently no-ops on missing deps. Workflow now `apt-get install`s `fakeroot` + `dpkg` before building. Debian/Ubuntu/Mint users will get a one-click installer next release.
- **Annotated tags pushed reliably.** `npm run release:bump` was creating lightweight tags, which `git push --follow-tags` ignores. Switched to `git tag -a -m`. (Lost ~30 minutes of "why isn't the workflow firing?" on v1.0.3.)

### CI / Infra
- **On-demand landing revalidation.** New `revalidate-landing` job at the end of the release matrix POSTs to the landing site's `/api/revalidate` endpoint, dropping its ISR cache so visitors see the new download URLs immediately instead of waiting up to 10 minutes. Skips gracefully if the `LANDING_REVALIDATE_URL` / `LANDING_REVALIDATE_SECRET` repo secrets aren't set, so forks don't fail this step.

## [1.0.3] — 2026-05-04

### Added
- **Multi-platform release matrix.** GitHub Actions release workflow now builds Windows + macOS + Linux in parallel on `windows-latest`, `macos-latest`, `ubuntu-latest`. All three publish artifacts to the same GitHub Release.
- **macOS support (unsigned).** First public macOS build — DMG + zip. Currently Apple Silicon only and unsigned (Gatekeeper warning on first launch; right-click → Open workaround documented in README). Universal binary + Apple Developer signing both deferred.
- **Linux AppImage.** Universal Linux artifact, no install required (`chmod +x` then double-click).
- **Per-platform download CTAs on the landing.** [components/download.tsx](../miqaat-landing/components/download.tsx) shows three buttons (Windows / macOS / Linux), each fed by [lib/latest-release.ts](../miqaat-landing/lib/latest-release.ts)'s GitHub Releases API call with 10-minute ISR. Buttons fall back to the releases page if a platform's asset is missing for the current tag.

### Changed
- **`mac.identity: null`** in `electron/package.json` to explicitly skip code-signing on macOS until we have a Developer ID cert.
- **`win.target`** simplified from `["zip", "dir"]` to `["zip"]` — `dir` was just an unpacked debug output, never useful in a release.

## [1.0.2] — 2026-05-04

### Added
- **First production GitHub Release.** Tag-triggered Actions workflow ([.github/workflows/release.yml](.github/workflows/release.yml)) builds the Windows ZIP and uploads it via electron-builder's GitHub publish provider.
- **`npm run release:bump`** — one-shot monorepo version bumper ([scripts/bump-version.mjs](scripts/bump-version.mjs)). Bumps all four `package.json` files, refreshes the lockfile, commits, tags. With `-- --push`, also pushes the tag to fire the release workflow.
- Per-platform install table in the [README](README.md) covering Windows, macOS, Linux with platform-specific install notes (SmartScreen, Gatekeeper, AppImage chmod).
- Excalidraw architecture diagram in [docs/img/architecture.webp](docs/img/architecture.webp), referenced from README + [docs/architecture.md](docs/architecture.md), replacing the prior ASCII box drawing.

### Changed
- **Publish providers cut to GitHub-only.** Removed the `generic` publisher pointing at `updates.miqaaat.com` — the URL had no upload endpoint, was warning-noisy on every release, and we don't need a second copy of artifacts. Auto-updater clients can be repointed when a real update server lands.
- **Landing version label is now dynamic.** [components/download.tsx](../miqaat-landing/components/download.tsx) reads from the GitHub Releases API at request time (server-side ISR, 10 min revalidate) instead of a hardcoded constant. New releases appear on the site without a code change or redeploy.

### Removed
- **Broken `lint` scripts.** Server + client called `eslint` but neither workspace had it as a devDependency; CI was failing with `eslint: not found`. Build's `tsc` already typechecks all three workspaces, which is the high-signal check. Proper eslint setup can come back later as its own change.
- `Co-Authored-By: Claude` trailers from commit history (rewritten via `git filter-branch`). Disclosure stays in the README acknowledgments where it belongs — keeping the GitHub Contributors panel meaningful.

## [Older — pre-1.0.0 development log]

The entries below were written during development before the first public release; they're effectively part of 1.0.0's scope but kept verbatim for the historical record.

### Added
- **Arabic (RTL) localization pass — full Arabic surface (2026-04-26).** Closed every i18n gap surfaced in the AR review:
  - **`<HorizonMiqaat />` Arabic wordmark** — renders ميقات in Amiri (classical-serif) with the same horizon-bar-over-the-alif concept as the Latin macron-over-`ā`. `<LogoMark />` picks Latin or Arabic based on `useI18n().lang`. Latin wordmark gained a hard `dir="ltr"` lock so it can never reverse when the page goes RTL. Splash gets the same lock (always Latin since lang isn't loaded yet).
  - **Reciter + RadioStation Arabic names.** Both data shapes now carry optional `nameAr`/`whoAr` fields; new `pickName()` / `pickStationName()` helpers in `client/src/lib/localizedName.ts` resolve based on locale. Used by AthanPlayer, RadioPlayer, SettingsDialog, NowPlayingBanner. Examples: "Makkah · Al-Haram / Sheikh ʿAli Mulla" → "مكة · الحرم / الشيخ علي ملا".
  - **HijriCard locale-aware.** Date/weekday rendered through luxon's `setLocale(...)`, with `ar-u-nu-latn` to keep Latin digits in the AR locale (consistent with prayer times). Hijri month name picks `monthAr` for AR, `monthEn` otherwise. The "AH" suffix becomes "هـ" in Arabic.
  - **GPS-saved-location label.** New `displayCity()` helper detects the literal `"Current location"` sentinel that LocationPicker + Onboarding write to the DB and swaps in `t('loc.gps.current')` at render time — no DB migration. Used by LocationPicker (topbar pill + tooltip + saved-list), LayoutClassic, LayoutHero, LayoutFocus.
  - **Layout selector names + descriptions** all flow through i18n keys (`layout.split.name` etc.) — name kept short so the trigger doesn't truncate. Translations: split → "مقسّم", hero → "الواجهة أولًا", focus → "وضع التركيز", etc.
  - **Compass cardinals** — N/E/S/W in `<CompassRose />` now use `qibla.cardinal.{n,e,s,w}` keys → ش/ق/ج/غ in AR.
  - **Countdown unit suffixes.** New `UNIT_SUFFIX` table in `client/src/lib/time.ts` provides per-locale h/m/s abbreviations; AR uses س/د/ث. `<Countdown />` reads the active locale and forces `dir="ltr"` so the digit sequence never reorders.
  - Added `@fontsource/amiri` (~140 KB woff2 set) + `--font-display-arabic` token in globals.css.
- **v1.5 backlog drained — five Visibility & UX polish items shipped (2026-04-26).**
  - **Now-playing Athan card** — floating banner at App root that appears when a scheduled Athan fires. Shows prayer + reciter + animated speaker + progress + Stop. Skips manual previews and radio streams via `audio.meta.context`. Audio store grew a `meta: { context, prayerName?, reciterId? }` field. See [client/src/components/athan/NowPlayingBanner.tsx](client/src/components/athan/NowPlayingBanner.tsx).
  - **Brand icons** — `electron/resources/{icon.ico, icon.png, tray-32.png}` are now committed. Generator script `npm run generate:icons` regenerates them from `client/public/favicon.svg` via sharp + png-to-ico. Tray icon now loads → close-to-tray behaviour is live; packaged executable + installer get the proper Sundial mark instead of the default Electron purple atom.
  - **Per-salat Athan customization moved to Settings.** Settings → "Athan customization" section now houses both the global reciter Select and per-prayer overrides (Fajr / Dhuhr / Asr / Maghrib / Isha — Sunrise excluded). Notifications dialog cleaned up: just on/off + pre-alert + Test.
  - **Monthly calendar — Print / Save as PDF.** New "Print / PDF" button in [MonthlyCalendarDialog](client/src/components/calendar/MonthlyCalendarDialog.tsx). Triggers `window.print()`; a `@media print` ruleset in [globals.css](client/src/styles/globals.css) hides everything except a Miqāt-branded header + the table (wordmark, tagline, location, method + madhab, Gregorian + Hijri month, full table with weekday + Hijri date columns). Hijri dates computed locally via Intl Umm al-Qura. System print dialog handles PDF export via "Save as PDF" destination.
  - **Clock-mismatch warning banner.** Slim amber strip between TopBar and the layout when system tz differs from location tz by ≥15 min, OR when Windows reports an offset that doesn't match the named tz's actual offset (stale tzdata — common with Morocco's 2018+ DST rules). Detector at [client/src/lib/clockMismatch.ts](client/src/lib/clockMismatch.ts), banner at [ClockMismatchBanner.tsx](client/src/components/layout/ClockMismatchBanner.tsx). Dismissible per signature via localStorage.
- **Jumu'ah Mubarak — Friday-only surface (v1.6).** Comprehensive Friday treatment shipped as four composable slices:
  - **Ajr ladder** — `<JumuahHero />` replaces the regular hero on Fridays. A 5-segment meter from Sunrise to Dhuhr (camel · cow · ram · hen · egg, per the Bukhari/Muslim hadith) with the user's current segment glowing amber. Past segments fade, future ones outline. After Dhuhr the meter locks with a "khutbah · books closed" indicator; after Maghrib it disappears and a "barakah continues" line takes its place. Replaces the **Dhuhr** prayer-card label with **"Jumu'ah"** in primary colour.
  - **Friday adhkar panel** — `<JumuahAdhkar />` with a Surah Al-Kahf launcher (opens quran.com/al-kahf via `app:open-external`), a Salawat tasbih counter (large tap target, daily-resetting localStorage key `miqaat:salawat:YYYY-MM-DD`), and a conditional "hour of acceptance" banner that appears only in the last hour before Maghrib on Fridays.
  - **Visual identity** — `<JumuahRibbon />` slim "Jumu'ah Mubarak · the best day on which the sun has risen" strip directly under the TopBar, only on Fridays. New `<KufiMotif />` (8-petal kufic-inspired flower) used as the JumuahHero watermark instead of the regular `<StarMotif />`.
  - **Notifications** — three Friday-aware reminders in [client/src/hooks/useJumuahNotifications.ts](client/src/hooks/useJumuahNotifications.ts), each independently toggleable: Thursday-eve at 19:00 (Surah Al-Kahf reminder), Friday 1 h before Dhuhr (first ajr-hour starts), Friday 1 h before Maghrib (hour of acceptance).
  - **Settings** — new "Jumu'ah Mubarak" section with a master `jumuah_enhancements` switch + 3 alert toggles. Migration 007 seeds all four flags to `'true'`.
  - All copy translated EN/FR/AR including the two key hadith and the five animal names of the ajr graduation. Files: [client/src/lib/jumuah.ts](client/src/lib/jumuah.ts), [client/src/components/jumuah/](client/src/components/jumuah/), [client/src/components/motifs/KufiMotif.tsx](client/src/components/motifs/KufiMotif.tsx). Master switch defaults ON.
- **Support dialog in BottomBar.** New "Support" entry next to Help opens a dialog with two sections:
  - **Donate to the developer** — opens `paypal.me/bitardev` in the system browser. Optional one-time tip; user picks any amount.
  - **Zakat & Sadaqa inquiries** — opens `mailto:contact@miqaaat.com` with a pre-filled subject. The app does **not** collect Zakat or Sadaqa funds; users are guided to the right local channel after inquiry, keeping the developer out of any custody/disbursement chain.
  Implemented as [client/src/components/support/SupportDialog.tsx](client/src/components/support/SupportDialog.tsx). The `app:open-external` IPC now also accepts `mailto:` and `tel:` schemes (previously http(s) only).
- **Kinetic favicon.** The browser-tab favicon's amber dot now tracks the sun's position on the sundial arc through the day — same Fajr→Isha mapping the in-app `<SundialMark />` uses. Updates roughly once per minute. Implemented as an SVG re-render in [client/src/lib/dynamicFavicon.ts](client/src/lib/dynamicFavicon.ts) + [useDynamicFavicon hook](client/src/hooks/useDynamicFavicon.ts), mounted from `App.tsx` once prayer times are loaded. The static `client/public/favicon.svg` stays as the pre-React fallback.
- **GitHub Releases as alternate publish provider.** [electron/package.json](electron/package.json) `build.publish` is now an array; `generic` (updates.miqaaat.com) stays primary so existing installs keep checking the same URL, and GitHub Releases (`agence-noos/miqaat`) is a redundant copy. New scripts at root: `npm run release` (publishes to both, requires `GH_TOKEN`) and `npm run release:draft` (GitHub-side draft only). See [docs/auto-updater.md](docs/auto-updater.md).
- **Per-prayer reciter overrides.** Each prayer (Fajr / Dhuhr / Asr / Maghrib / Isha) can pick its own athan reciter from the Notifications dialog, falling back to the global default when set to "Use default". Sunrise has no Select (no athan). Migration 005 seeds `reciter_<prayer>` keys with empty string. New helper `client/src/lib/reciter.ts::resolveReciter()` is used by both `useNotifications` (auto-fire) and the *Test the Athan* button. See [docs/athan-audio.md § Per-prayer reciter overrides](docs/athan-audio.md).
- **Playwright Electron smoke test.** `e2e/smoke.spec.ts` packages the unpacked build (`npm run test:e2e:setup`) and asserts main window title, six prayer cards render (`data-prayer` / `data-testid="prayer-grid"`), brand state machine cycles (`data-brand-state="wordmark"/"sundial"/"heldnote"`), CSP-clean console, and tray-init survival. New `test:e2e` + `test:e2e:setup` scripts at root. Pinned `electronVersion` in build config; new `install:prod-deps` electron workspace script unhoists prod deps so electron-builder's "install production dependencies" step doesn't race antivirus on Windows. See [docs/desktop-builds.md § Playwright smoke test](docs/desktop-builds.md).
- **Live radio — separate `<RadioPlayer />` card.** Split from the Athan player since they serve different purposes (one-shot vs passive listening). Five verified stations: Makkah tarateel, Saudi Quran, Qurango Mix, Palestine Quran (Nablus, as Al-Aqsa-adjacent), and **Assadissa · Morocco**. New `RADIO_STATIONS` list + `radio_station` setting (migration 004). The Athan reciter setting is now strictly local reciters again; the prior `kind`/`streamUrl`/`fallbackId` fields on `Reciter` were removed. Prayer-time auto-fire uses local MP3s only — radio never fires on schedule (streams have no end). Stream errors surface via sonner toast. See [docs/athan-audio.md § Live radio](docs/athan-audio.md).
- **Custom Fajr/Isha angles** — new calculation method "Custom — user-defined angles" in Settings. When selected, three fields appear (Fajr angle, Isha angle, Isha interval in minutes). Overrides wire through `/api/prayer-times?fa=…&ia=…&ii=…` → `computePrayerTimes` → `adhan.CalculationParameters`. Cache + Aladhan sync are skipped for custom-method requests so angle changes take effect immediately. Migration 003 seeds defaults (`18`/`17`/`0`). 3 new unit cases in `adhan-compute.spec.ts`.

### Renamed
- **Mothern Athan → Miqāt.** Full rebrand: product name, appId (`com.noos.mothern-athan` → `com.noos.miqaat`), userData folder, tray tooltip, window title, docs. Domain: [miqaaat.com](https://miqaaat.com). One-time legacy DB migration copies `mothern-athan.db` from the old userData folder to the new Miqāt folder on first launch. Existing installs keep all their settings, locations, and prayer-time cache.
- Workspaces renamed: `@mothern-athan/*` → `@miqaat/*`.

### Added
- **Brand system** — kinetic logo state machine: Horizon Alif wordmark (default) → Sundial Mark (rotates in every ~20s) → Held Note waveform (when athan plays). Three primitives in `client/src/components/brand/` + `LogoMark` wrapper. See [docs/brand.md](docs/brand.md).
- **Miqāt theme** — new default theme (warm-black `#0e0d0b` + cream `#f5f0e6` + amber `#d4a86a`), alongside Light / Dark / Paper. Instrument Serif added as a display face.
- SVG favicon matching the Sundial composition.
- Jest test harness for the server workspace.
- Offline unit tests: `computePrayerTimes` fixtures (method/madhab wiring, high-latitude safety), Qibla bearing fixtures across 6 cities (± 0.5° tolerance).
- Online parity test: local `adhan` vs `api.aladhan.com` across 10 cities × 5 methods × 5 dates (250 cases), gated by `ONLINE=1`.
- Root scripts: `npm test` (offline only) and `npm run test:online` (includes parity).
- Auto-updater via `electron-updater` — silent background downloads, banner in-app with restart-and-install. Publish endpoint is configurable in `electron/package.json` `build.publish`. See [docs/auto-updater.md](docs/auto-updater.md).

## [1.0.0] — 2026-04-23

### Added
- Initial release.
- Monorepo: `/server` (NestJS + SQLite), `/client` (React + Vite + shadcn/ui), `/electron` (Electron + electron-builder).
- Prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) with offline `adhan` computation + Aladhan verification.
- Geolocation + city search (Nominatim) with saved locations.
- Athan player with reciters and Dua-after-Athan option.
- Qibla bearing + rotating arrow.
- Hijri date (Umm al-Qura via `Intl`) + converter.
- Settings: calculation method, madhab, theme (light/dark/paper), time format, motif, notifications.
- Onboarding (3-step welcome).
- Tray icon, splash screen, dynamic port scan.
- SQLite schema migrations from `PRAGMA user_version`.
