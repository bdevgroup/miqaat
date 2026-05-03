/**
 * Per-prayer time offsets (v1.7) — minute adjustments applied AFTER
 * computation/cache lookup, before the response leaves the server. Lets
 * users align Miqāt with their local mosque's published times or shave
 * a couple minutes off for caution.
 *
 * Range: ±60 minutes per prayer (validated client + server side).
 * Default: 0 across the board.
 *
 * Stored as strings (the settings table is key/value text); parsed as
 * integers when applied in PrayerTimesService.
 */
export const migration010PrayerOffsets = {
  version: 10,
  up(db: any) {
    const now = Date.now();
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    );
    const keys = [
      'offset_fajr',
      'offset_sunrise',
      'offset_dhuhr',
      'offset_asr',
      'offset_maghrib',
      'offset_isha',
    ];
    for (const k of keys) stmt.run(k, '0', now);
  },
};
