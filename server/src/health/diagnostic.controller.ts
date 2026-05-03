import { Controller, Get, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { PrayerTimesService } from '../prayer-times/prayer-times.service';
import { computePrayerTimes, type PrayerTimesResult } from '../prayer-times/adhan-compute';

/**
 * Single-shot diagnostic dump — everything you need to debug a "wrong time"
 * report without asking the user to copy-paste from devtools. Captures
 * settings, saved locations, today's cache rows, the canonical computation,
 * and the offset-applied result.
 *
 * Output is plain JSON so the renderer can both display it AND copy it to
 * the clipboard / download it as a file.
 */
@Controller('debug')
export class DiagnosticController {
  private readonly logger = new Logger(DiagnosticController.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly prayerTimes: PrayerTimesService,
  ) {}

  @Get('snapshot')
  async snapshot() {
    const now = new Date();
    const todayISO = now.toISOString().slice(0, 10);

    const settingsRows = this.db.db
      .prepare('SELECT key, value, updated_at FROM settings')
      .all() as Array<{ key: string; value: string; updated_at: number }>;
    const settings: Record<string, string> = {};
    for (const r of settingsRows) settings[r.key] = r.value;

    const locations = this.db.db
      .prepare('SELECT * FROM saved_locations')
      .all();
    const currentLoc = this.db.db
      .prepare('SELECT * FROM saved_locations WHERE is_current = 1 LIMIT 1')
      .get() as
      | { lat: number; lng: number; timezone: string | null; city: string; country: string }
      | undefined;

    const cacheRows = this.db.db
      .prepare(
        `SELECT lat, lng, date, method, madhab, fajr, sunrise, dhuhr, asr, maghrib, isha,
                source, fetched_at
         FROM prayer_times_cache WHERE date = ? ORDER BY lat, lng, method, madhab`,
      )
      .all(todayISO);

    let canonical: PrayerTimesResult | null = null;
    let withOffsets: unknown = null;
    let offsetsRead: Record<string, number> | null = null;

    if (currentLoc) {
      const method = Number(settings.calc_method ?? 3);
      const madhab = Number(settings.madhab ?? 0);

      try {
        canonical = computePrayerTimes({
          lat: currentLoc.lat,
          lng: currentLoc.lng,
          date: new Date(todayISO + 'T12:00:00Z'),
          method,
          madhab,
          customFajrAngle: Number(settings.custom_fajr_angle ?? 18),
          customIshaAngle: Number(settings.custom_isha_angle ?? 17),
          customIshaInterval: Number(settings.custom_isha_interval ?? 0),
        });
      } catch (err) {
        this.logger.warn(`canonical compute failed: ${(err as Error).message}`);
      }

      offsetsRead = {
        fajr: Number(settings.offset_fajr ?? 0),
        sunrise: Number(settings.offset_sunrise ?? 0),
        dhuhr: Number(settings.offset_dhuhr ?? 0),
        asr: Number(settings.offset_asr ?? 0),
        maghrib: Number(settings.offset_maghrib ?? 0),
        isha: Number(settings.offset_isha ?? 0),
        global: Number(settings.global_offset_min ?? 0),
      };

      try {
        withOffsets = await this.prayerTimes.get({
          lat: currentLoc.lat,
          lng: currentLoc.lng,
          date: todayISO,
          method,
          madhab,
          customFajrAngle: Number(settings.custom_fajr_angle ?? 18),
          customIshaAngle: Number(settings.custom_isha_angle ?? 17),
          customIshaInterval: Number(settings.custom_isha_interval ?? 0),
          offsets: offsetsRead,
        });
      } catch (err) {
        this.logger.warn(`with-offsets fetch failed: ${(err as Error).message}`);
      }
    }

    // Sample 4 days from the visible month so we can compare home vs
    // monthly-table values when the user reports a sync mismatch.
    const monthSample: Array<{ date: string; canonical: PrayerTimesResult | null; withOffsets: unknown; cached: unknown }> = [];
    if (currentLoc) {
      const method = Number(settings.calc_method ?? 3);
      const madhab = Number(settings.madhab ?? 0);
      const startOfMonth = todayISO.slice(0, 8) + '01';
      const monthIdx = Number(todayISO.slice(5, 7));
      const lastDay = new Date(Number(todayISO.slice(0, 4)), monthIdx, 0).getDate();
      const sampleDays = [1, 14, 15, lastDay];
      for (const d of sampleDays) {
        const dateISO = `${todayISO.slice(0, 4)}-${todayISO.slice(5, 7)}-${String(d).padStart(2, '0')}`;
        let can: PrayerTimesResult | null = null;
        let withOff: unknown = null;
        let cacheRow: unknown = null;
        try {
          can = computePrayerTimes({
            lat: currentLoc.lat, lng: currentLoc.lng,
            date: new Date(dateISO + 'T12:00:00Z'),
            method, madhab,
            customFajrAngle: Number(settings.custom_fajr_angle ?? 18),
            customIshaAngle: Number(settings.custom_isha_angle ?? 17),
            customIshaInterval: Number(settings.custom_isha_interval ?? 0),
          });
        } catch {/* ignore */}
        try {
          withOff = await this.prayerTimes.get({
            lat: currentLoc.lat, lng: currentLoc.lng,
            date: dateISO, method, madhab,
            customFajrAngle: Number(settings.custom_fajr_angle ?? 18),
            customIshaAngle: Number(settings.custom_isha_angle ?? 17),
            customIshaInterval: Number(settings.custom_isha_interval ?? 0),
            offsets: offsetsRead!,
          });
        } catch {/* ignore */}
        cacheRow = this.db.db
          .prepare(
            `SELECT date, fajr, dhuhr, source, fetched_at
             FROM prayer_times_cache
             WHERE lat=? AND lng=? AND date=? AND method=? AND madhab=?`,
          )
          .get(currentLoc.lat, currentLoc.lng, dateISO, method, madhab) ?? null;
        monthSample.push({ date: dateISO, canonical: can, withOffsets: withOff, cached: cacheRow });
      }
      // Suppress unused-var warning for startOfMonth (kept for future per-day cache dump)
      void startOfMonth;
    }

    const snap = {
      now: now.toISOString(),
      nowLocal: now.toString(),
      systemTzGuess: Intl.DateTimeFormat().resolvedOptions().timeZone,
      schemaVersion: this.db.db.pragma('user_version', { simple: true }),
      currentLocation: currentLoc ?? null,
      savedLocations: locations,
      settings,
      offsetsRead,
      todayISO,
      canonicalCompute: canonical,
      cacheRowsToday: cacheRows,
      withOffsets,
      monthSample,
    };

    this.logger.log(`[diagnostic] snapshot taken at ${now.toISOString()}`);
    this.logger.log(`[diagnostic] offsets: ${JSON.stringify(offsetsRead)}`);
    this.logger.log(`[diagnostic] canonical fajr: ${canonical?.fajr ?? 'n/a'}`);
    this.logger.log(`[diagnostic] withOffsets: ${JSON.stringify(withOffsets)}`);

    return snap;
  }
}
