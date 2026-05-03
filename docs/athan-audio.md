# Athan audio — how to add, edit, or swap reciters

Miqāt plays five optional audio tracks. This guide covers how to fetch them, swap in different recordings, and add brand-new reciters.

## Where audio lives

All MP3s sit in a single folder:

```
client/public/audio/
├── athan-makkah.mp3      # "Makkah" reciter
├── athan-madina.mp3      # "Madina" reciter
├── athan-alaqsa.mp3      # "Al-Aqsa" reciter
├── athan-egypt.mp3       # "Egypt" reciter
├── dua-after-athan.mp3   # Played after the Athan when the setting is enabled
└── LICENSES.md           # Attribution + licence per track (auto-written)
```

**The filename is the contract.** The app loads each track via the exact URL `./audio/athan-<id>.mp3` where `<id>` matches the reciter key in [client/src/types/index.ts](../client/src/types/index.ts) (`RECITERS` array). If a file is missing, the app silently skips it — the UI still lists the reciter, but clicking Play is a no-op.

MP3s are **not committed to git** (see [.gitignore](../.gitignore)). Every clone needs them re-fetched or dropped in manually. `LICENSES.md` **is** committed.

## Fetching the default set

There's a one-shot script that downloads the four Athan reciters from islamcan.com into the right folder with the right names:

```bash
npm run fetch:audio
```

- Skips files that already exist (pass `--force` to re-download):
  ```bash
  node scripts/fetch-athans.mjs --force
  ```
- Writes [client/public/audio/LICENSES.md](../client/public/audio/LICENSES.md) with attribution for each track.
- Does **not** fetch `dua-after-athan.mp3` — there's no reliable public CDN for it. Drop your own (see below).

## Swapping in a different recording for an existing reciter

Say you prefer a different Makkah Athan to the one islamcan.com ships.

### Option A — replace the file directly (one-off)

Just put your MP3 at `client/public/audio/athan-makkah.mp3`, overwriting the downloaded one. Update [client/public/audio/LICENSES.md](../client/public/audio/LICENSES.md) by hand so attribution stays accurate. Restart the dev server; the next Play will use the new file.

This survives until someone runs `npm run fetch:audio --force`, which would overwrite it.

### Option B — change the URL in the fetch script (persistent)

Edit the `TRACKS` array in [scripts/fetch-athans.mjs](../scripts/fetch-athans.mjs):

```js
{
  id: 'makkah',
  filename: 'athan-makkah.mp3',
  reciter: 'Sheikh Ali Ahmed Mulla',
  url: 'https://example.com/my-preferred-adhan.mp3',
  license: 'Public domain · source: example.com',
},
```

Then `node scripts/fetch-athans.mjs --force`. The new URL becomes the canonical source for everyone who clones the repo.

**Good sources for legitimate adhan MP3s:**
- [archive.org](https://archive.org/search?query=adhan) — many public-domain recordings; direct-download URLs like `https://archive.org/download/<identifier>/<file>.mp3`
- [islamcan.com/audio/adhan/](https://www.islamcan.com/audio/adhan/) — `azan1.mp3` through `azan10.mp3`, all stable
- Your local mosque's website — often provides free downloads
- Self-recorded — highest quality, simplest licence

**Avoid**: YouTube-to-MP3 converters. Most mosque broadcasts are rights-managed by national broadcasters; using these in a distributed app risks takedown.

## Adding a new reciter

Adding a sixth reciter (e.g. "Istanbul") means touching three places:

1. **UI entry** — add to the `RECITERS` array in [client/src/types/index.ts](../client/src/types/index.ts):
   ```ts
   { id: 'istanbul', name: 'Istanbul', who: 'Hafız Mustafa Özcan' },
   ```
2. **Fetch script** — add to `TRACKS` in [scripts/fetch-athans.mjs](../scripts/fetch-athans.mjs):
   ```js
   {
     id: 'istanbul',
     filename: 'athan-istanbul.mp3',
     reciter: 'Hafız Mustafa Özcan',
     url: 'https://example.com/istanbul.mp3',
     license: '…',
   },
   ```
3. **Run** `node scripts/fetch-athans.mjs` to download it.

That's it. The reciter appears in the Athan Player radio list automatically. No rebuild required — just reload.

## Per-prayer reciter overrides

Each prayer can pick its own reciter, falling back to the global default when not set. Useful for example to use a Madina recitation for Fajr while keeping Makkah for the rest of the day.

- UI lives inside the **Notifications** dialog (bell icon). Each enabled prayer row has a "Sound" Select with options: *Use default (<global>)*, Makkah, Madina, Al-Aqsa, Egypt, No Athan.
- Sunrise has no sound option — it never plays an athan.
- Settings stored as `reciter_fajr / _dhuhr / _asr / _maghrib / _isha`. Empty string = use default. Seeded by migration 005.
- Resolved by [resolveReciter()](../client/src/lib/reciter.ts), used in both `useNotifications` (auto-fire at prayer time) and the *Test the Athan* button.

## Dua after Athan

`dua-after-athan.mp3` **is** auto-fetched. Source: an archive.org recording of the full Fajr Adhan + supplication by Syeikh Mishary Rashid al-Afasy. The script extracts just the last ~45 seconds (the dua portion only) via a CBR 128 kbps MP3 frame-boundary byte-slice — no `ffmpeg` or other binary dependency; the trim is a few lines of JS in [scripts/fetch-athans.mjs](../scripts/fetch-athans.mjs).

When the **Dua after Athan** toggle is on and the main Athan finishes, this file plays next. If it's missing (e.g. you deleted it), the chain stops silently with no error toast — and the feature re-enables the moment the file reappears.

### To swap in your own dua recording

Drop it directly at `client/public/audio/dua-after-athan.mp3` and reload. Anything there overrides the Mishary extraction. Common sources:
- Record your own recitation of *"اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ..."* (~30–60 s)
- islamhouse.com, islamicfinder.org
- [archive.org search](https://archive.org/search?query=dua+after+adhan)

### To change the default source

Edit `DUA_SOURCE` in [scripts/fetch-athans.mjs](../scripts/fetch-athans.mjs) — swap `url`, `trimLastSeconds`, and `assumedBitrateKbps` to match your new source, then `node scripts/fetch-athans.mjs --force`. If your source isn't CBR, the byte-slice won't land on a frame cleanly and you'll need an ffmpeg-based trim instead.

## File format, quality, size

| Property | Recommended |
| --- | --- |
| Codec | MP3 (widest Electron/Chromium support) |
| Bitrate | 96–128 kbps mono, 128–160 kbps stereo |
| Duration | ~2–5 min for a full Athan, ~30–60 s for Dua |
| File size | Target < 1 MB per track |
| Sample rate | 44.1 kHz |

The app bundle ships to users with whatever is in `client/public/audio/` at packaging time — so bigger files = bigger download. The islamcan.com defaults hit 0.5–1.0 MB each, which is a reasonable ceiling.

Other formats (OGG, M4A, WAV) will technically play in Electron, but the filename must end in `.mp3` because that's what the app URL expects. Convert before dropping in — plenty of free tools:
- `ffmpeg -i input.m4a -codec:a libmp3lame -qscale:a 4 athan-makkah.mp3`
- Audacity (GUI)

## Licensing — keep `LICENSES.md` honest

Any track you add or swap needs a corresponding entry in [client/public/audio/LICENSES.md](../client/public/audio/LICENSES.md). The fetch script rewrites this file on every run based on the `license` field of each `TRACKS` entry, so the cleanest path is to let the script manage it — edit URLs + licence strings in the script, re-run.

If you drop a file manually (bypassing the script), edit `LICENSES.md` by hand so attribution survives redistribution.

## Live radio

Live radio is a **separate card** (`<RadioPlayer />`) docked in the **left sidebar** of LayoutSplit, below the Hijri card and location block. It's split from the Athan player because the two serve different purposes:

- **Athan player** — short MP3 reciter, fires once at prayer time or on demand.
- **Radio player** — long-running stream for passive listening. Never fires at prayer time.

Stations come in two flavours:
- **`streamUrl`** — direct MP3/AAC URL, plays inline in the Miqāt window.
- **`externalUrl`** — opens the station's web player in your system browser. Used for HLS and WAF-protected feeds that can't play inline.

### Shipped stations

| ID | Name | Kind | URL |
| --- | --- | --- | --- |
| `tarateel` | Tarateel | inline | `https://qurango.net/radio/tarateel` |
| `mix` | Qurango Mix | inline | `https://qurango.net/radio/mix` |
| `tafseer` | Tafseer | inline | `https://qurango.net/radio/tafseer` |
| `maher` | Maher al-Muʿaiqly (Madina imam) | inline | `https://qurango.net/radio/maher` |
| `shuraim` | Saud ash-Shuraim (Makkah imam) | inline | `https://qurango.net/radio/saud_alshuraim` |
| `ghamdi` | Saʿd al-Ghāmidi | inline | `https://qurango.net/radio/saad_alghamdi` |
| `ajmy` | Ahmad al-ʿAjmī | inline | `https://qurango.net/radio/ahmad_alajmy` |
| `assadissa` | **Assadissa · Morocco** | **external** | `https://snrtlive.ma/fr/idaat-mohammed-assadiss` |

All inline URLs are on `qurango.net`, the same infrastructure as the two originally-verified stations (`mix` + `tarateel`). The set is reciter-flavoured; if you want a live broadcast from a specific Haram, swap in a station URL there.

### About Assadissa (SNRT)

Morocco's national Radio Mohammed VI du Saint Coran (Assadissa) is streamed by SNRT over HLS (m3u8) behind Sucuri WAF. It can't be played by an `<audio>` tag in Electron's renderer — HLS needs `hls.js` or equivalent, and Sucuri rejects automated probes anyway. Rather than ship a dead inline URL, Miqāt treats it as an **external-link station**: clicking Play opens the SNRT web player (`https://snrtlive.ma/fr/idaat-mohammed-assadiss`) in your system browser. The app keeps running in the background.

If you extract the actual HLS URL from the SNRT player's network tab and want inline playback, you'd need to: (1) add `hls.js` to the client, (2) detect `.m3u8` in `AudioElement.tsx` and wire it through `hls.js.attachMedia(audioRef.current)`, (3) handle Sucuri's cookie challenge. Substantial work; we deferred it.

### What didn't work (and why we dropped them)

- `stream.radiojar.com/*` — probed 200 via HEAD but fails at playback. Likely SSL/UA/CORS interaction with Electron's `<audio>`.
- `http://www.quran-radio.org:8002/` (Palestine Quran) — HTTP-only, blocked by Electron's mixed-content policy in practice.
- `http://streaming.radionomy.com/Moroccoislamic` — Radionomy shut down in 2020; domain returns 301 now.

### Adding or swapping a station

1. Edit `RADIO_STATIONS` in [client/src/types/index.ts](../client/src/types/index.ts). Set either `streamUrl` (inline) or `externalUrl` (opens in browser).
2. For inline streams on a new host, add the host to `connect-src` in [client/index.html](../client/index.html)'s CSP.
3. Reload — no rebuild needed for renderer-only changes.

### Discovery sources

- **mp3quran.net API** — `https://www.mp3quran.net/api/v3/radios?language=ar` lists ~176 reciter streams
- **radio-browser.info** — crowd-sourced public radio directory with country/tag filters
- **Qurango.net** — `https://qurango.net/radio/<id>` works for many reciter slugs; try `tafseer`, `maher`, `saad_alghamdi`, etc.

## Quick reference

| I want to… | Do this |
| --- | --- |
| Get the default audio set | `npm run fetch:audio` |
| Re-download everything | `node scripts/fetch-athans.mjs --force` |
| Replace a single reciter temporarily | Overwrite the MP3 in `client/public/audio/` |
| Replace a reciter permanently | Edit URL in `scripts/fetch-athans.mjs`, re-run |
| Add a new reciter | Add to `RECITERS` (types) + `TRACKS` (script), re-run |
| Enable Dua after Athan | Drop `dua-after-athan.mp3` into `client/public/audio/` |
| Test playback without waiting for a prayer | Open the app → Athan Player → click **Play** |

## Troubleshooting

**"I clicked Play and nothing happens"** — open DevTools console. If you see `HTTP 404` for the audio URL, the file isn't at the expected path. Verify with `ls client/public/audio/` that `athan-<id>.mp3` exists for the selected reciter.

**"The Athan doesn't fire automatically at prayer time"** — two common causes: (a) Chromium blocks autoplay without a user gesture — fixed in `electron/src/main.ts` via `autoplayPolicy: 'no-user-gesture-required'`, so a restart of `npm run dev` picks it up; (b) the in-app master notifications toggle is off. Open the bell icon in the top bar and confirm it's enabled. The OS notification permission is only needed for the desktop toast — audio plays regardless.

**"Audio plays but very quiet"** — check the volume slider in the Athan Player. It syncs to the `volume` setting in SQLite on change. Also verify the file itself isn't mastered too quiet; re-encode at higher gain if needed (`ffmpeg -i in.mp3 -filter:a "volume=1.5" out.mp3`).
