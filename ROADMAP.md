# Roadmap

What's queued for Miqāt, in rough priority order. Solo project, no SLAs — dates are intentions, not commitments. Items leave the "Coming next" sections as they ship; [CHANGELOG.md](CHANGELOG.md) is the source of truth for what's done.

> Status markers: ⏳ planned · 🚧 in progress · ✅ done · ❌ deferred

---

## Coming next — v1.1.x

Small, focused improvements that build on what's already shipping. None require new product calls.

- ⏳ **Quran integration — Surah-of-the-day + Al-Kahf player.** The Friday companion already deep-links to quran.com for Al-Kahf; the next step is in-app playback. Plan: integrate the [Al-Quran Cloud API](https://alquran.cloud/api) (open, no key, well-maintained) for surah text + `https://cdn.islamic.network/quran/audio/` for reciter MP3s. Cache aggressively in SQLite (Quran text is immutable). Two surfaces: a "Surah of the day" card on the home layout, and a richer Al-Kahf player on Fridays with verse highlighting synced to recitation.
- ⏳ **More languages.** Currently EN/FR/AR. Top requests we'd take next: Turkish, Indonesian/Malay, Urdu, German, Spanish. The translation strings live in [client/src/i18n/dict.ts](client/src/i18n/dict.ts) — adding a locale is mostly mechanical. RTL is already wired (used by Arabic), so Urdu would slot into that same path. PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).
- ⏳ **Apple Developer signing + notarization.** Removes the macOS Gatekeeper warning and the `xattr -cr` Terminal step. The release workflow already has the env-var hooks (`CSC_LINK`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`); just needs the cert ($99/yr Apple Developer account) wired into GitHub repo secrets and the `mac.identity: null` flag dropped.
- ⏳ **Windows code signing.** Same shape — kills SmartScreen "Unknown publisher" warnings. EV cert (~$200/yr) is what most projects use; cheaper OV options exist but reputation builds slower.
- ⏳ **Per-prayer pre-alert sounds.** Today every prayer's pre-alert uses the same notification chime; some users want a softer Fajr, a stronger Maghrib. Settings UI mostly exists; just needs a sound picker per row.
- ⏳ **Tasbih on the next-prayer banner.** Tap-to-count widget for the time between prayers — Fatima's tasbih (33 SubḥānAllāh, 33 al-Ḥamdu lillāh, 34 Allāhu Akbar) is the canonical one. Persists per-day in localStorage like the Salawat counter already does on Fridays.

## Mid-term — v1.2 / v1.3

Bigger features that need real product thinking but don't change the architecture.

- ⏳ **Tasbih + Adhkar library.** A proper morning/evening adhkar surface with the canonical Hisn al-Muslim selections, plus a configurable tasbih interface (counter, target count, audio cue on completion). Asked for since v1.0.
- ⏳ **Calendar integrations.** Export prayer times as a subscribable `.ics` so Google Calendar / Outlook / Apple Calendar show them inline. Read-only feed; cheaper than two-way sync.
- ⏳ **OS-level widget surfaces.** Beyond the always-on-top window — Windows widgets panel, macOS Notification Center, GNOME extensions. Each is its own integration.
- ⏳ **Community theme gallery.** Today four built-in themes (Miqāt, Light, Dark, Paper). Open it up: a `themes/*.json` directory + import path so contributors can add palettes without touching code.
- ⏳ **Settings export / import.** Settings + saved locations + custom reciters as a single export file, importable on another install. Solves "I just got a new laptop" without any cloud sync.

## Long-term — v2.x

Bigger product calls. Marked here so the direction is public, not so they happen on a fixed schedule.

- ⏳ **Cloud sync (opt-in, end-to-end encrypted).** Settings-only, no account required (device-pair via QR like Signal). Hard part isn't the protocol; it's deciding whether the brand voice ("local-first, no account") survives once any server-side state exists. Probably ships behind a "Sync (experimental)" Settings toggle that's off by default.
- ⏳ **Mobile companion (iOS + Android).** Separate repo, separate stack — likely React Native + Expo so we can share `client/src/lib/*` (prayer-calc, qibla, time, i18n). Notification reliability on iOS (background app refresh + push payloads vs local notifications) is the hard part. May start as a read-only widget and grow.
- ⏳ **Web version.** A trimmed-down miqaaat.com app for users who can't install desktop software (corporate machines, Chromebooks, public terminals). Same React app, no Electron, prayer times computed client-side via `adhan` with Aladhan as the verify layer. CSP without `'unsafe-eval'` is the main blocker.
- ⏳ **Curated reciter registry.** Today users upload their own MP3s locally. Long-term: a public registry of openly-licensed Athan recordings users can browse + add with one click. Needs licence vetting + a CDN-style host we can afford.

## Things we are NOT doing

To save anyone's time on PRs that won't land:

- ❌ **Ads, telemetry, or in-app tracking.** The website uses cookieless analytics (Vercel) for aggregate page-view counts; the app itself reports nothing. That stays.
- ❌ **Account-required features.** Optional sync is fine; mandatory account is not.
- ❌ **Web-based "convert to PDF" / cloud rendering** for the monthly calendar — the print pipeline already produces a PDF locally via the system print dialog, no third-party server needed.
- ❌ **Prayer-time methods we can't verify.** New calculation methods need to match Aladhan's published parameters or come with documented authoritative sources. No "popular but no source" methods.
- ❌ **Nag UI to rate the app, share it, follow social.** Once you install Miqāt it should never ask you for anything.

## How to influence this list

- File a [GitHub issue](https://github.com/bdevgroup/miqaat/issues/new/choose) — feature requests get triaged into this roadmap.
- Less concrete "what about X" conversations belong in the [Discussions tab](https://github.com/bdevgroup/miqaat/discussions).
- For translation contributions specifically, just open a PR — see [CONTRIBUTING.md](CONTRIBUTING.md). No issue needed.

---

## Already shipped

Headline items, most recent first. Full detail in [CHANGELOG.md](CHANGELOG.md).

### v1.0.x (2026-05) — release infrastructure
- ✅ Multi-platform release matrix: Windows ZIP + macOS arm64 DMG + macOS x64 DMG + Linux AppImage + Linux .deb, all tagged from one `npm run release:bump` command
- ✅ macOS arm64 / x64 split (universal binaries break native-module merging — better-sqlite3 ends up arm64-only)
- ✅ On-demand landing-cache revalidation: release workflow POSTs `/api/revalidate` so download CTAs flip within seconds instead of 10-min ISR window
- ✅ Athan audio bundled in CI (was gitignored + missing from packaged builds)
- ✅ "Verifying online" UX softened — badge says "Local" while the Aladhan verify is in flight, polls every 15s until it flips to "Verified"
- ✅ Custom-reciter row truncation for long uploaded filenames (full name on hover)
- ✅ Update banner gets a "Download from GitHub" fallback so unsigned builds aren't stuck on the auto-install dead-end

### v1.6 — Jumu'ah Mubarak (2026-04-26)
- ✅ Friday-only `<JumuahHero />` with a live 5-segment ajr ladder tracking the Sunrise→Dhuhr window (camel · cow · ram · hen · egg per Bukhari/Muslim)
- ✅ Friday adhkar panel: Surah Al-Kahf launcher, Salawat tasbih counter (daily-resetting), hour-of-acceptance banner in the last hour before Maghrib
- ✅ Visual identity: slim "Jumu'ah Mubarak" ribbon, kufic motif, Dhuhr card relabelled "Jumu'ah"
- ✅ Three Friday notifications (Thursday Al-Kahf reminder, 1 h before Jumu'ah, 1 h before Maghrib) — each independently toggleable
- ✅ Master switch + per-alert switches in Settings; copy translated EN/FR/AR

### v1.5 — Visibility & UX polish (2026-04-26)
- ✅ Now-playing Athan card (`<NowPlayingBanner />` at App root, scheduled-fire only, hidden for manual previews and radio)
- ✅ Brand icons for Electron build (.ico, .png, tray) generated from the canonical SVG via `npm run generate:icons`
- ✅ Per-salat reciter overrides moved into Settings → "Athan customization"
- ✅ Monthly calendar Print/PDF via `window.print()` + branded `@media print` stylesheet
- ✅ Clock-mismatch banner when system tz disagrees with saved location tz by ≥15 min (catches stale tzdata)

### v1.3 — Rebrand to Miqāt (2026-04-24)
- ✅ Product renamed (Mothern Athan → Miqāt), appId `com.developbettersolutions.miqaat`, domain miqaaat.com
- ✅ Brand state machine: Horizon Alif wordmark → Sundial Mark (kinetic) → Held Note (audio-responsive)
- ✅ Miqāt theme as new default (warm-black + amber); Light/Dark/Paper still available
- ✅ Instrument Serif typography, SVG favicon matching the Sundial composition
- ✅ Legacy userData migration (one-time copy from `Mothern Athan/`)

### v1.2 — i18n
- ✅ EN + FR + AR (with RTL)
- ✅ Arabic wordmark in Amiri (`<HorizonMiqaat />`)
- ✅ Locale-aware Hijri formatting (luxon + Intl Umm al-Qura, Latin digits in AR)
- ✅ Language selector in the BottomBar

### v1.1 — Polish
- ✅ Qibla map (MapLibre GL + OSM tiles)
- ✅ Always-on-top widget window (`?mode=widget`)
- ✅ Additional reciters: Madina, Al-Aqsa, Egypt
- ✅ Monthly prayer calendar
- ✅ Compact mode
- ✅ Live radio sidebar (curated qurango.net set + Assadissa Morocco)
- ✅ Custom Fajr/Isha angles
- ✅ Per-prayer reciter overrides
- ✅ Auto-updater (`electron-updater` wired; signing certs still pending)

### v1.0 — Foundation
- ✅ Prayer times (offline `adhan` + Aladhan verify, SQLite cache)
- ✅ 6-card grid + countdown + next-prayer highlight
- ✅ Geolocation + Nominatim search + saved locations
- ✅ Athan player (Makkah default) + Dua-after
- ✅ Qibla bearing + rotating arrow
- ✅ Hijri date + Gregorian↔Hijri converter
- ✅ Light + Dark + Paper themes
- ✅ Onboarding (3-step), tray, splash, dynamic port scan
- ✅ SQLite schema migrations
