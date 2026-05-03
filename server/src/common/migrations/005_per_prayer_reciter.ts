/**
 * Per-prayer reciter overrides. Empty string means "use global `reciter`".
 * No `reciter_sunrise` — sunrise never plays an athan.
 */
export const migration005PerPrayerReciter = {
  version: 5,
  up(db: any) {
    const now = Date.now();
    const keys = [
      'reciter_fajr',
      'reciter_dhuhr',
      'reciter_asr',
      'reciter_maghrib',
      'reciter_isha',
    ];
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    );
    for (const key of keys) stmt.run(key, '', now);
  },
};
