# Brand system

Miqāt's identity is a **state machine**, not a static mark. Three components rotate in a fixed choreography driven by app state.

## The three faces

### 1. Horizon Alif — the wordmark

```
m i q ā t
```

The word `miqāt` set in *Instrument Serif italic*. Two macrons sit above the `i` and the `a`. The macron over the `ā` is the only amber element; everything else is ink on cream (or cream on ink in dark themes). The bar *is* the horizon: the line where Fajr breaks and Maghrib sets.

Implemented in [HorizonAlif.tsx](../client/src/components/brand/HorizonAlif.tsx).

### 2. Sundial Mark — the kinetic identity

A single amber dot moves along an arc. Its position corresponds to the current time within today's Fajr→Isha window. Looking at the icon tells you where the sun is relative to the prayers.

- At Fajr: dot at the left of the arc
- At Dhuhr: dot at the apex
- At Isha: dot at the right, starting to descend

Implemented in [SundialMark.tsx](../client/src/components/brand/SundialMark.tsx). Reads prayer times from TanStack Query; falls back to a local 06:00→20:00 window until a location is set.

### 3. Held Note — the audio-responsive mark

A waveform path. When the Athan is playing, the middle portion wobbles via `requestAnimationFrame`; the right tail stays flat — the "held alif decays into stillness." When paused, it's the same shape, static.

Caption (hero contexts only): *"Allāhu Akbar — the held alif decays into stillness."*

Implemented in [HeldNote.tsx](../client/src/components/brand/HeldNote.tsx).

## The state machine

Wrapped in [LogoMark.tsx](../client/src/components/brand/LogoMark.tsx):

```
default           → Horizon Alif
every ~20 s, 6 s  → Sundial Mark (then fade back to Horizon Alif)
audio.playing     → Held Note (overrides all others)
```

When `useAudio().playing` flips true, the mark becomes the Held Note immediately — regardless of the rotation phase. This makes the Athan visually audible at a glance.

## Palette

```
--miqat-ink       #0e0d0b    warm near-black  — background, wordmark
--miqat-cream     #f5f0e6    bright cream     — foreground on dark, card on light
--miqat-paper     #e8dfce    warm cream       — secondary surface
--miqat-amber     #d4a86a    dusk gold        — primary accent, sun dot, macron-ā
--miqat-muted     #a8a296    dusty taupe      — muted foreground
--miqat-deep      #5a4a2a    ink on cream     — muted foreground on light backgrounds
```

Encoded as HSL in `client/src/styles/globals.css` under the `.miqat` class.

## Typography

| Role | Face | Usage |
| --- | --- | --- |
| Wordmark / display | **Instrument Serif** (italic) | The `miqāt` mark, hero numerals, editorial captions |
| Body / UI | **Inter** | Everything that isn't decorative |
| Monospace | **JetBrains Mono** | Prayer times (HH:MM), coordinates, timestamps |
| Arabic | **Amiri** (on demand, not yet wired) | Future: Arabic-first views |
| Accent script | **Caveat** | Kept from previous system for countdown hero in Split/Hero layouts |

All self-hosted via `@fontsource/*` — offline-safe.

## Themes

The brand ships with four themes, all available in Settings. Miqāt is the default for fresh installs.

| Theme | Background | Accent | Intent |
| --- | --- | --- | --- |
| **Miqāt** (default) | `#0e0d0b` warm-black | `#d4a86a` amber | The canonical brand — warm, serene, low-chroma |
| Light | white | sky-500 | Daylight-friendly for brighter environments |
| Dark | slate-900 | sky-400 | Neutral dark for users who prefer cool tones |
| Paper | `#fafaf7` | muted sky | Wireframe-inspired — cream ground, ink type |

Users can switch via the SettingsDialog or cycle with the top-bar sun/moon/book/sunrise button. Existing installs that had Light/Dark/Paper keep their preference; only new installs land on Miqāt.

## Favicon

A static SVG at [client/public/favicon.svg](../client/public/favicon.svg) — a miniature of the Sundial Mark composition (arc + amber sun dot on warm-black ground). The dynamic favicon where the dot moves through the day is a v1.1 nicety.

## What got retired

The **8-pointed star motif** (`StarMotif.tsx`) is no longer the brand. It's still available as an optional *background* watermark on the NextPrayerBanner via the `motif` setting (`star` / `dots` / `none`) — a decoration, not identity. The concept sheet said it plainly: *"everyone uses it; forget it."*
