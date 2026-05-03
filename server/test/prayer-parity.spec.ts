/**
 * Parity test: local `adhan` library vs Aladhan API.
 *
 * Gated by ONLINE=1 env flag — skipped in CI and on offline dev boxes.
 * Sweeps a small matrix of cities × methods across a week of dates, hits
 * https://api.aladhan.com/v1/timings, and asserts the local computation is
 * within a defined tolerance per prayer.
 *
 * Run:
 *   ONLINE=1 npm --workspace server run test -- prayer-parity
 *
 * Matrix size is tuned to finish in a few minutes without hammering Aladhan
 * (one request per city × method × day). Adhuan caches its own state.
 */
import axios from 'axios';
import { computePrayerTimes } from '../src/prayer-times/adhan-compute';

const ONLINE = process.env.ONLINE === '1';
const describeOrSkip = ONLINE ? describe : describe.skip;

// Tolerance per prayer. Most deltas are 0-2 min but methods that use
// interval-based Isha (UmmAlQura, Egypt during Ramadan) can drift more.
const TOLERANCE_MIN = 3;

const CITIES = [
  { name: 'Makkah',     lat: 21.4225,  lng:  39.8262, tz: 'Asia/Riyadh' },
  { name: 'Casablanca', lat: 33.5731,  lng:  -7.5898, tz: 'Africa/Casablanca' },
  { name: 'NYC',        lat: 40.7128,  lng: -74.0060, tz: 'America/New_York' },
  { name: 'London',     lat: 51.5072,  lng:  -0.1276, tz: 'Europe/London' },
  { name: 'Jakarta',    lat: -6.2088,  lng: 106.8456, tz: 'Asia/Jakarta' },
  { name: 'Istanbul',   lat: 41.0082,  lng:  28.9784, tz: 'Europe/Istanbul' },
  { name: 'Cairo',      lat: 30.0444,  lng:  31.2357, tz: 'Africa/Cairo' },
  { name: 'Singapore',  lat:  1.3521,  lng: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Sydney',     lat: -33.8688, lng: 151.2093, tz: 'Australia/Sydney' },
  { name: 'Paris',      lat: 48.8566,  lng:   2.3522, tz: 'Europe/Paris' },
];

// Aladhan method IDs that adhan-js supports directly.
const METHODS = [
  { id: 3,  name: 'MuslimWorldLeague' },
  { id: 2,  name: 'NorthAmerica' },
  { id: 5,  name: 'Egyptian' },
  { id: 4,  name: 'UmmAlQura' },
  { id: 1,  name: 'Karachi' },
];

const DATES = [
  '2026-04-24', '2026-05-01', '2026-06-21',
  '2026-09-23', '2026-12-21',
];

const PRAYERS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
type Prayer = typeof PRAYERS[number];

interface AladhanTimings {
  Fajr: string; Sunrise: string; Dhuhr: string;
  Asr: string; Maghrib: string; Isha: string;
}

async function fetchAladhan(
  date: string, lat: number, lng: number, method: number,
): Promise<AladhanTimings | null> {
  const [y, m, d] = date.split('-');
  try {
    const res = await axios.get(
      `https://api.aladhan.com/v1/timings/${d}-${m}-${y}`,
      { params: { latitude: lat, longitude: lng, method, school: 0 }, timeout: 10_000 },
    );
    return res.data?.data?.timings ?? null;
  } catch {
    return null;
  }
}

/** Aladhan returns "HH:MM" in the city's local wall-clock time. */
function toMinuteOfDay(hhmm: string): number {
  const [h, mm] = hhmm.split(/[:\s]/).map(Number);
  return h * 60 + mm;
}

/** Convert an ISO UTC timestamp to minute-of-day in the given IANA tz.
 *  This matches Aladhan's local wall-clock reference. */
function minuteOfDayInTz(iso: string, tz: string): number {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz,
  });
  const parts = fmt.formatToParts(new Date(iso));
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return h * 60 + m;
}

describeOrSkip('Prayer-time parity: local adhan vs Aladhan API', () => {
  if (!ONLINE) {
    it.skip('(ONLINE=1 env var required)', () => void 0);
    return;
  }

  const MATRIX = CITIES.flatMap((city) =>
    METHODS.flatMap((method) =>
      DATES.map((date) => ({ city, method, date })),
    ),
  );

  it.each(MATRIX)(
    '$city.name × $method.name × $date (delta ≤ ' + TOLERANCE_MIN + ' min)',
    async ({ city, method, date }) => {
      const remote = await fetchAladhan(date, city.lat, city.lng, method.id);
      if (!remote) {
        // Aladhan temporarily unavailable — soft-skip so a flaky day doesn't
        // turn the suite red. The assertion below still runs on the local
        // side if upstream responded.
        console.warn(`  [parity] Aladhan unreachable for ${city.name}/${method.name}/${date}; skipping`);
        return;
      }

      const local = computePrayerTimes({
        lat: city.lat, lng: city.lng,
        date: new Date(`${date}T12:00:00Z`),
        method: method.id, madhab: 0,
      });

      const failures: string[] = [];
      for (const p of PRAYERS) {
        const localMin = minuteOfDayInTz(local[p], city.tz);
        const remoteMin = toMinuteOfDay((remote as any)[p[0].toUpperCase() + p.slice(1)]);
        // Handle day wrap: Aladhan may report e.g. Isha at 00:30 next day as 24:30
        // while our local may return 23:xx the previous day (or vice versa).
        // Use minimum of forward and wrap-around diff.
        const direct = Math.abs(localMin - remoteMin);
        const wrap = 1440 - direct;
        const delta = Math.min(direct, wrap);
        if (delta > TOLERANCE_MIN) {
          failures.push(
            `${p}: local ${localMin}min vs Aladhan ${remoteMin}min (Δ ${delta} min)`,
          );
        }
      }

      if (failures.length > 0) {
        throw new Error(
          `Parity drift in ${city.name}/${method.name}/${date}:\n  ` +
          failures.join('\n  '),
        );
      }
    },
  );
});
