# Roadmap

Status markers: ✅ done · 🚧 in progress · ⏳ planned · ❌ deferred

## v1.0 — Foundation (shipped)
- ✅ Prayer times (offline-first with Aladhan sync)
- ✅ 6-card grid (Layout E · Split)
- ✅ Countdown, next-prayer highlight
- ✅ Location (geolocation + Nominatim search + saved)
- ✅ Athan player (Makkah reciter) + Dua-after
- ✅ Qibla arrow
- ✅ Hijri date + converter
- ✅ Settings (method, madhab, theme, time format, motif, notifications)
- ✅ Light/Dark/Paper themes
- ✅ Onboarding
- ✅ Tray + splash + port scan
- ✅ SQLite migrations

## v1.1 — Polish
- ✅ Qibla map (MapLibre GL + OSM tiles)
- ✅ Always-on-top widget window (`?mode=widget`)
- ✅ Additional reciters: Madina, Al-Aqsa, Egypt
- ✅ Monthly prayer calendar
- ✅ Compact mode
- ✅ Auto-updater (`electron-updater`; publish URL + code-signing still to configure)

## v1.2 — i18n
- ✅ English + French + Arabic (with RTL)
- ✅ Language selector in BottomBar
- ✅ Theme + prayer-name labels translated across all visible surfaces

## v1.3 — Rebrand: Mothern Athan → Miqāt
- ✅ New product name, appId `com.developbettersolutions.miqaat`, domain `miqaaat.com`
- ✅ Brand state machine: Horizon Alif wordmark + Sundial Mark (kinetic) + Held Note (audio-responsive)
- ✅ Miqāt theme as new default (warm-black + amber); Light/Dark/Paper still available
- ✅ Instrument Serif typography added
- ✅ Legacy userData folder migration (one-time copy from `Mothern Athan/`)
- ✅ SVG favicon matching Sundial composition
- ✅ Tests + auto-updater + splash + docs refreshed under new identity

## v1.4 — Ops (planned)
- ⏳ Stand up `https://updates.miqaaat.com/` for auto-updater
- ⏳ Windows code-signing certificate + build pipeline
- ✅ GitHub releases as alternate publish provider (shipped 2026-04-24 — wired in `electron/package.json`, `npm run release` / `release:draft` scripts; needs `GH_TOKEN` + matching repo)
- ✅ Playwright Electron boot smoke test (shipped 2026-04-24)

## v1.5 — Visibility & UX polish (shipped)
- ✅ **"Now playing" Athan card.** New `<NowPlayingBanner />` mounted at App root — appears as a floating bottom-centred card when a *scheduled* Athan is firing (`audio.meta.context === 'athan'`). Shows prayer name + reciter + animated speaker icon + progress bar + Stop button; "Dua next" pill while the Dua chain is queued. Hidden for manual previews (AthanPlayer Play button) and radio streams. Audio store extended with `meta: { context, prayerName, reciterId }`.
- ✅ **Brand icons.** Generated `electron/resources/{icon.ico (256×256), icon.png (512×512), tray-32.png}` from the canonical SVG via `npm run generate:icons` (sharp + png-to-ico). Tray's graceful fallback now finds the asset and the close-to-tray behaviour is live.
- ✅ **Per-salat Athan customization moved to Settings.** New "Athan customization" section in Settings → global reciter + per-prayer overrides (Select for each enabled prayer; Sunrise excluded). Per-prayer reciter Select removed from the Notifications dialog (which now keeps only on/off + pre-alert + test).
- ✅ **Monthly calendar — Print / Save as PDF with Miqāt branding.** New "Print / PDF" button in `MonthlyCalendarDialog`. Click triggers `window.print()`; a `@media print` stylesheet hides everything except a Miqāt-branded header + the table. The system print dialog's "Save as PDF" destination handles PDF export. Output includes wordmark, tagline, location (city · country · lat/lng · IANA tz), method + madhab, Gregorian + Hijri month, and the full table with weekday + Hijri date columns. Hijri computed locally via Intl Umm al-Qura.
- ✅ **Clock-mismatch warning banner.** Slim amber strip between TopBar and main layout when (a) system tz differs from saved location tz by ≥15 min, or (b) Windows reports an offset that doesn't match what luxon computes for the system tz name (catches stale tzdata — Morocco's 2018+ DST rules). Dismissible per offset-pair via localStorage. Helper at `client/src/lib/clockMismatch.ts`.

## v1.6 — Jumu'ah Mubarak (shipped)
- ✅ **Friday-only home surface** — `<JumuahHero />` replaces the regular hero on Fridays, with a live 5-segment ajr ladder (camel · cow · ram · hen · egg) tracking the Sunrise→Dhuhr window per Bukhari/Muslim
- ✅ **Friday adhkar panel** — Surah Al-Kahf launcher, Salawat tasbih counter (daily-resetting localStorage), hour-of-acceptance banner in the last hour before Maghrib
- ✅ **Visual identity** — slim "Jumu'ah Mubarak" ribbon under the TopBar, kufic-inspired motif behind the hero, Dhuhr prayer-card relabelled "Jumu'ah" in primary colour
- ✅ **Three Friday notifications** — Thursday-eve Al-Kahf reminder, 1 h before Jumu'ah, 1 h before Maghrib (hour of acceptance) — each independently toggleable
- ✅ Master switch + per-alert switches in Settings → "Jumu'ah Mubarak"
- ✅ Migration 007 seeds defaults; all copy translated EN/FR/AR

## v2.0 — Advanced
- ✅ Live radio streams (curated qurango.net set + Assadissa external — shipped 2026-04-24)
- ✅ Per-prayer sound customization (shipped 2026-04-24)
- ✅ Custom Fajr/Isha angle overrides (shipped 2026-04-24)
- ✅ Kinetic favicon (dot tracks Fajr→Isha; shipped 2026-04-24)
- ⏳ Cloud sync / account (optional — needs product direction)
- ⏳ Mobile companion app (separate stack — needs product direction)
