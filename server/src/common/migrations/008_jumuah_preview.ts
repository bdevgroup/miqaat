/**
 * Jumu'ah preview override (v1.6.1) — single setting key that forces the
 * Friday-only surface to render regardless of the actual day-of-week. Used
 * by the developer/user to QA the Jumu'ah Hero, Meter, Adhkar, Ribbon, and
 * the Dhuhr → "Jumu'ah" relabel without changing the system clock.
 *
 * Defaults to 'false' — never enabled out-of-the-box.
 */
export const migration008JumuahPreview = {
  version: 8,
  up(db: any) {
    const now = Date.now();
    db.prepare(
      `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    ).run('jumuah_preview', 'false', now);
  },
};
