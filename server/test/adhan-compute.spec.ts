/**
 * Offline unit tests for the adhan-compute wrapper.
 *
 * These hit adhan-js directly with no network. They guard against
 *   - regressions in our Aladhan-method-ID → adhan-js enum mapping
 *   - timezone boundary bugs (noon-UTC anchor)
 *   - madhab flag mis-wiring (Shafi vs Hanafi asr)
 *
 * For online parity against the Aladhan API, see `prayer-parity.spec.ts`.
 */
import { computePrayerTimes } from '../src/prayer-times/adhan-compute';

// Known fixtures: Makkah on a summer solstice.
const MAKKAH = { lat: 21.4225, lng: 39.8262 };
const SUMMER_DATE = new Date('2026-06-21T12:00:00Z');

describe('computePrayerTimes', () => {
  it('returns six ISO timestamps in chronological order', () => {
    const t = computePrayerTimes({
      ...MAKKAH, date: SUMMER_DATE, method: 3, madhab: 0,
    });

    const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
    const ms = order.map((k) => new Date(t[k]).getTime());

    for (let i = 1; i < ms.length; i++) {
      expect(ms[i]).toBeGreaterThan(ms[i - 1]);
    }
    for (const iso of Object.values(t)) {
      expect(typeof iso).toBe('string');
      expect(new Date(iso).toString()).not.toBe('Invalid Date');
    }
  });

  it('Hanafi madhab (school=1) moves Asr later than Shafi (school=0)', () => {
    const shafi = computePrayerTimes({
      ...MAKKAH, date: SUMMER_DATE, method: 3, madhab: 0,
    });
    const hanafi = computePrayerTimes({
      ...MAKKAH, date: SUMMER_DATE, method: 3, madhab: 1,
    });
    const shafiAsr = new Date(shafi.asr).getTime();
    const hanafiAsr = new Date(hanafi.asr).getTime();
    // Hanafi asr uses shadow-length 2× vs Shafi's 1×, so later.
    expect(hanafiAsr).toBeGreaterThan(shafiAsr);
    // Other prayers untouched.
    expect(shafi.fajr).toBe(hanafi.fajr);
    expect(shafi.dhuhr).toBe(hanafi.dhuhr);
    expect(shafi.maghrib).toBe(hanafi.maghrib);
  });

  it('accepts all Aladhan method IDs without throwing', () => {
    const ALADHAN_METHODS = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 15];
    for (const m of ALADHAN_METHODS) {
      expect(() =>
        computePrayerTimes({ ...MAKKAH, date: SUMMER_DATE, method: m, madhab: 0 }),
      ).not.toThrow();
    }
  });

  it('different methods produce different fajr/isha (they use different angles)', () => {
    // MWL uses fajr=18°/isha=17°. Egyptian uses fajr=19.5°/isha=17.5°.
    // Both angles differ so both prayers must shift. Dhuhr (solar noon)
    // is method-independent.
    const mwl = computePrayerTimes({
      ...MAKKAH, date: SUMMER_DATE, method: 3, madhab: 0,
    });
    const egyptian = computePrayerTimes({
      ...MAKKAH, date: SUMMER_DATE, method: 5, madhab: 0,
    });
    expect(mwl.fajr).not.toBe(egyptian.fajr);
    expect(mwl.isha).not.toBe(egyptian.isha);
    const mins = (iso: string) => Math.floor(new Date(iso).getTime() / 60_000);
    expect(mins(mwl.dhuhr)).toBe(mins(egyptian.dhuhr));
  });

  it('high-latitude location does not NaN out (Reykjavik on winter solstice)', () => {
    const t = computePrayerTimes({
      lat: 64.1466, lng: -21.9426,
      date: new Date('2026-12-21T12:00:00Z'),
      method: 3, madhab: 0,
    });
    for (const iso of Object.values(t)) {
      expect(typeof iso).toBe('string');
      // adhan may return NaN dates at extreme latitudes — we want to see that
      // we haven't crashed, but still flag if the result isn't parseable.
      // (adhan's default high-lat rule keeps this OK for Reykjavik.)
      const ms = new Date(iso).getTime();
      expect(Number.isNaN(ms)).toBe(false);
    }
  });

  describe('custom angles (method=0)', () => {
    it('Fajr/Isha angle override moves times in the expected direction', () => {
      // A larger Fajr angle → darker threshold → earlier Fajr.
      const narrow = computePrayerTimes({
        ...MAKKAH, date: SUMMER_DATE, method: 0, madhab: 0,
        customFajrAngle: 15, customIshaAngle: 15,
      });
      const wide = computePrayerTimes({
        ...MAKKAH, date: SUMMER_DATE, method: 0, madhab: 0,
        customFajrAngle: 20, customIshaAngle: 20,
      });
      expect(new Date(wide.fajr).getTime()).toBeLessThan(new Date(narrow.fajr).getTime());
      expect(new Date(wide.isha).getTime()).toBeGreaterThan(new Date(narrow.isha).getTime());
      // Dhuhr / Maghrib are solar events, not affected by twilight angles.
      expect(narrow.dhuhr).toBe(wide.dhuhr);
      expect(narrow.maghrib).toBe(wide.maghrib);
    });

    it('custom angles are ignored when method != 0', () => {
      const mwl = computePrayerTimes({
        ...MAKKAH, date: SUMMER_DATE, method: 3, madhab: 0,
      });
      const mwlWithIgnoredOverrides = computePrayerTimes({
        ...MAKKAH, date: SUMMER_DATE, method: 3, madhab: 0,
        customFajrAngle: 22, customIshaAngle: 22, customIshaInterval: 99,
      });
      // Method is MWL, not Custom — overrides must be discarded.
      expect(mwlWithIgnoredOverrides).toEqual(mwl);
    });

    it('Isha interval > 0 overrides the Isha angle (fixed minutes after Maghrib)', () => {
      const interval = computePrayerTimes({
        ...MAKKAH, date: SUMMER_DATE, method: 0, madhab: 0,
        customFajrAngle: 18, customIshaAngle: 17, customIshaInterval: 90,
      });
      const maghribMs = new Date(interval.maghrib).getTime();
      const ishaMs = new Date(interval.isha).getTime();
      const minsAfter = (ishaMs - maghribMs) / 60_000;
      expect(Math.round(minsAfter)).toBe(90);
    });
  });
});
