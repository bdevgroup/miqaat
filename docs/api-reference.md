# API Reference

All routes are mounted under `/api` on `http://127.0.0.1:<PORT>`.

## Health
```
GET /api/health
→ { ok, appVersion, schemaVersion, now }
```

## Settings
```
GET   /api/settings           → Record<string, string>
PATCH /api/settings           → { keys to upsert } → Record<string, string>
```
Known keys: `theme`, `layout`, `language`, `time_format`, `calc_method`, `madhab`, `reciter`, `volume`, `play_dua_after`, `notifications_enabled`, `compact_mode`, `timezone`, `widget_enabled`, `widget_position`, `onboarded`, `motif`.

## Locations
```
GET    /api/locations                 → SavedLocation[]
POST   /api/locations                 → SavedLocation
GET    /api/locations/current         → SavedLocation | null
GET    /api/locations/search?q=...    → { city, country, lat, lng }[]  (Nominatim proxy)
PUT    /api/locations/:id/current     → SavedLocation
DELETE /api/locations/:id             → { ok: true }
```

## Prayer times
```
GET /api/prayer-times?lat&lng&date&method&madhab
→ {
    fajr, sunrise, dhuhr, asr, maghrib, isha,  # ISO strings
    source: 'local' | 'aladhan',
    cached: boolean,
    date, lat, lng, method, madhab
  }
```
- `date` defaults to today (server local). `method` = Aladhan method ID, `madhab` = 0 (Shafi/Maliki/Hanbali) or 1 (Hanafi).
- Flow: cache (≤24h) → return. Miss → compute locally with `adhan`, return, refresh from Aladhan in background.

## Hijri
```
GET /api/hijri?date=YYYY-MM-DD
→ { gregorian, hijriDate, day, month, monthEn, monthAr, year, source }
```
Uses `Intl.DateTimeFormat('en-u-ca-islamic-umalqura')` — offline. Cached in `hijri_cache`.

## Qibla
```
GET /api/qibla?lat&lng
→ { bearing, distanceKm, makkah: { lat, lng } }
```
Pure great-circle bearing + haversine. No persistence.
