/**
 * Jumu'ah enhancements (v1.6) — Friday-specific UI & alerts.
 *
 *   jumuah_enhancements      → master switch for the whole Jumu'ah surface
 *   jumuah_kahf_alert        → Thursday-eve Surah Al-Kahf reminder
 *   jumuah_pre_alert         → 1 h before Jumu'ah (= Dhuhr) reminder, marks
 *                              the start of the first ajr-hour
 *   jumuah_acceptance_alert  → last hour before Maghrib on Friday — the
 *                              widely-cited "hour of acceptance" for du'a
 *
 * Salawat counter persistence is handled client-side in localStorage (one
 * key per ISO date) so the schema stays clean and resets implicitly each
 * day without needing a maintenance job.
 */
export const migration007Jumuah = {
  version: 7,
  up(db: any) {
    const now = Date.now();
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    );
    stmt.run('jumuah_enhancements', 'true', now);
    stmt.run('jumuah_kahf_alert', 'true', now);
    stmt.run('jumuah_pre_alert', 'true', now);
    stmt.run('jumuah_acceptance_alert', 'true', now);
  },
};
