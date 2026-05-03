import { Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { DatabaseService } from '../common/database.service';
import { computePrayerTimes, PrayerTimesResult } from './adhan-compute';
import { fetchAladhanTimings } from './aladhan-client';

export interface PrayerTimesResponse extends PrayerTimesResult {
  source: 'local' | 'aladhan';
  cached: boolean;
  date: string;
  lat: number;
  lng: number;
  method: number;
  madhab: number;
}

interface CacheRow {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  source: string;
  fetched_at: number;
}

export interface PrayerOffsets {
  fajr?: number;
  sunrise?: number;
  dhuhr?: number;
  asr?: number;
  maghrib?: number;
  isha?: number;
  /** Global shift in minutes — added to every prayer on top of the
   *  per-prayer offsets above. Used when the OS tz is wrong (Morocco
   *  permanent UTC+1, stale Windows tzdata, manual DST corrections...). */
  global?: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_OFFSET_MIN = 60;
const MAX_GLOBAL_OFFSET_MIN = 120;

/**
 * Apply per-prayer minute offsets to a `PrayerTimesResult`. Offsets are
 * clamped to ±60 min as a sanity guard against bad input. Cache stores
 * canonical (un-offset) values; offsets are a presentation-layer transform
 * applied at response time.
 */
function applyOffsets(
  t: PrayerTimesResult,
  offsets: PrayerOffsets | undefined,
): PrayerTimesResult {
  if (!offsets) return t;
  // Clamp global offset once to the broader ±120 range.
  const globalMin =
    offsets.global && Number.isFinite(offsets.global)
      ? Math.max(
          -MAX_GLOBAL_OFFSET_MIN,
          Math.min(MAX_GLOBAL_OFFSET_MIN, Math.trunc(offsets.global)),
        )
      : 0;
  const shift = (iso: string, perPrayerMins: number | undefined): string => {
    const per = perPrayerMins && Number.isFinite(perPrayerMins)
      ? Math.max(-MAX_OFFSET_MIN, Math.min(MAX_OFFSET_MIN, Math.trunc(perPrayerMins)))
      : 0;
    const total = per + globalMin;
    if (total === 0) return iso;
    const d = new Date(iso);
    d.setUTCMinutes(d.getUTCMinutes() + total);
    return d.toISOString();
  };
  return {
    fajr:    shift(t.fajr,    offsets.fajr),
    sunrise: shift(t.sunrise, offsets.sunrise),
    dhuhr:   shift(t.dhuhr,   offsets.dhuhr),
    asr:     shift(t.asr,     offsets.asr),
    maghrib: shift(t.maghrib, offsets.maghrib),
    isha:    shift(t.isha,    offsets.isha),
  };
}

function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

/**
 * Attach Aladhan's "HH:MM" (sometimes "HH:MM (+01)") string to a date and
 * convert to UTC ISO. Aladhan times are LOCAL clock times in `tz`, NOT UTC.
 *
 * Previous version (silently buggy until 2026-05-02): treated h:m as UTC,
 * stored canonical cache rows that were +1h off in any zone east of UTC.
 * Users in Morocco (UTC+1) compensated by setting global_offset_min=-60,
 * which masked the bug for cache hits but produced wrong times after fresh
 * adhan-js compute populated correct values into the same cache slot.
 *
 * adhan-js results already arrive as full ISO and skip this path.
 */
function dateTimeWithDate(isoTime: string, dateISO: string, tz: string): string {
  if (isoTime.includes('T')) return isoTime;
  // Aladhan often appends a timezone label like "20:14 (+01)" — strip it
  // before parsing. The numeric h:m before the space is what we want.
  const cleaned = isoTime.split(/\s/)[0];
  const [h, m] = cleaned.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    throw new Error(`Could not parse Aladhan time string: ${JSON.stringify(isoTime)}`);
  }
  const local = DateTime.fromObject(
    {
      year: Number(dateISO.slice(0, 4)),
      month: Number(dateISO.slice(5, 7)),
      day: Number(dateISO.slice(8, 10)),
      hour: h,
      minute: m,
      second: 0,
    },
    { zone: tz },
  );
  if (!local.isValid) {
    throw new Error(`Invalid local DateTime for tz=${tz} on ${dateISO}: ${local.invalidReason}`);
  }
  return local.toUTC().toISO()!;
}

@Injectable()
export class PrayerTimesService {
  private readonly logger = new Logger(PrayerTimesService.name);

  constructor(private readonly db: DatabaseService) {}

  async getRange(opts: {
    lat: number;
    lng: number;
    from: string;
    to: string;
    method: number;
    madhab: number;
    customFajrAngle?: number;
    customIshaAngle?: number;
    customIshaInterval?: number;
    offsets?: PrayerOffsets;
  }): Promise<PrayerTimesResponse[]> {
    const out: PrayerTimesResponse[] = [];
    const start = new Date(opts.from + 'T00:00:00Z');
    const end = new Date(opts.to + 'T00:00:00Z');
    const MAX_DAYS = 62;
    let i = 0;
    for (
      const d = new Date(start);
      d.getTime() <= end.getTime() && i < MAX_DAYS;
      d.setUTCDate(d.getUTCDate() + 1), i++
    ) {
      const iso = d.toISOString().slice(0, 10);
      const row = await this.get({
        lat: opts.lat, lng: opts.lng, date: iso,
        method: opts.method, madhab: opts.madhab,
        customFajrAngle: opts.customFajrAngle,
        customIshaAngle: opts.customIshaAngle,
        customIshaInterval: opts.customIshaInterval,
        offsets: opts.offsets,
      });
      out.push(row);
    }
    return out;
  }

  async get(opts: {
    lat: number;
    lng: number;
    date: string; // YYYY-MM-DD
    method: number;
    madhab: number;
    customFajrAngle?: number;
    customIshaAngle?: number;
    customIshaInterval?: number;
    offsets?: PrayerOffsets;
  }): Promise<PrayerTimesResponse> {
    const lat = round4(opts.lat);
    const lng = round4(opts.lng);

    // Custom method (0) uses user-defined angles; skip the cache so changes
    // to the angle settings don't serve stale results, and skip Aladhan sync
    // since their methodSettings param is out of scope here.
    const isCustom = opts.method === 0;

    if (!isCustom) {
      const cached = this.readCache(lat, lng, opts.date, opts.method, opts.madhab);
      if (cached && Date.now() - cached.fetched_at < CACHE_TTL_MS) {
        // Apply offsets to canonical cached values — cache stays shared,
        // user offsets are a presentation-layer transform.
        const canonical = {
          fajr: cached.fajr, sunrise: cached.sunrise, dhuhr: cached.dhuhr,
          asr: cached.asr, maghrib: cached.maghrib, isha: cached.isha,
        };
        const adjusted = applyOffsets(canonical, opts.offsets);
        this.logger.log(
          `[get cache-hit] date=${opts.date} src=${cached.source} ` +
          `offsets=${JSON.stringify(opts.offsets ?? {})} ` +
          `canonicalFajr=${canonical.fajr} adjustedFajr=${adjusted.fajr}`,
        );
        return {
          ...adjusted,
          source: cached.source as 'local' | 'aladhan',
          cached: true,
          date: opts.date, lat, lng, method: opts.method, madhab: opts.madhab,
        };
      }
    }

    const parsedDate = new Date(opts.date + 'T12:00:00Z');
    const local = computePrayerTimes({
      lat, lng, date: parsedDate, method: opts.method, madhab: opts.madhab,
      customFajrAngle: opts.customFajrAngle,
      customIshaAngle: opts.customIshaAngle,
      customIshaInterval: opts.customIshaInterval,
    });

    if (!isCustom) {
      // Cache the canonical (un-offset) computed times.
      this.writeCache(lat, lng, opts.date, opts.method, opts.madhab, local, 'local');
      this.refreshFromAladhan(lat, lng, opts.date, opts.method, opts.madhab).catch(
        (err) => this.logger.warn(`Aladhan refresh failed: ${(err as Error).message}`),
      );
    }

    const adjusted = applyOffsets(local, opts.offsets);
    this.logger.log(
      `[get fresh] date=${opts.date} method=${opts.method} madhab=${opts.madhab} ` +
      `offsets=${JSON.stringify(opts.offsets ?? {})} ` +
      `canonicalFajr=${local.fajr} adjustedFajr=${adjusted.fajr}`,
    );
    return {
      ...adjusted,
      source: 'local',
      cached: false,
      date: opts.date, lat, lng, method: opts.method, madhab: opts.madhab,
    };
  }

  private async refreshFromAladhan(
    lat: number, lng: number, date: string, method: number, madhab: number,
  ): Promise<void> {
    const res = await fetchAladhanTimings({
      date: new Date(date + 'T12:00:00Z'),
      lat, lng,
      method,
      school: madhab,
    });
    if (!res) return;
    const { timings, timezone } = res;

    try {
      // Convert each local-time string to a UTC ISO using Aladhan's reported
      // tz. Bug-shy: if any one prayer fails to parse, abort the whole
      // refresh so we never write a partial / mixed-source cache row.
      this.writeCache(lat, lng, date, method, madhab, {
        fajr:    dateTimeWithDate(timings.Fajr,    date, timezone),
        sunrise: dateTimeWithDate(timings.Sunrise, date, timezone),
        dhuhr:   dateTimeWithDate(timings.Dhuhr,   date, timezone),
        asr:     dateTimeWithDate(timings.Asr,     date, timezone),
        maghrib: dateTimeWithDate(timings.Maghrib, date, timezone),
        isha:    dateTimeWithDate(timings.Isha,    date, timezone),
      }, 'aladhan');
    } catch (err) {
      this.logger.warn(
        `[aladhan] dateTimeWithDate failed for date=${date} tz=${timezone}: ${(err as Error).message}`,
      );
    }
  }

  private readCache(lat: number, lng: number, date: string, method: number, madhab: number): CacheRow | null {
    return (this.db.db
      .prepare(
        `SELECT fajr, sunrise, dhuhr, asr, maghrib, isha, source, fetched_at
         FROM prayer_times_cache
         WHERE lat = ? AND lng = ? AND date = ? AND method = ? AND madhab = ?`,
      )
      .get(lat, lng, date, method, madhab) as CacheRow | undefined) ?? null;
  }

  private writeCache(
    lat: number, lng: number, date: string, method: number, madhab: number,
    t: PrayerTimesResult, source: 'local' | 'aladhan',
  ): void {
    this.db.db
      .prepare(
        `INSERT INTO prayer_times_cache
          (lat, lng, date, method, madhab, fajr, sunrise, dhuhr, asr, maghrib, isha, source, fetched_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(lat, lng, date, method, madhab) DO UPDATE SET
          fajr = excluded.fajr, sunrise = excluded.sunrise, dhuhr = excluded.dhuhr,
          asr = excluded.asr, maghrib = excluded.maghrib, isha = excluded.isha,
          source = excluded.source, fetched_at = excluded.fetched_at`,
      )
      .run(lat, lng, date, method, madhab,
        t.fajr, t.sunrise, t.dhuhr, t.asr, t.maghrib, t.isha,
        source, Date.now());
  }
}
