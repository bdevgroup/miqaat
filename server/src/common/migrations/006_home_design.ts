/**
 * Home design experiments — three toggles introduced in v1.5 to A/B-test
 * design directions in the running app:
 *   - passed_dim_mode: 'all' | 'current'  → fade every passed prayer, or
 *     only the most-recently-passed one (previous behaviour).
 *   - hero_ambient:   'true' | 'false'    → time-aware gradient + Sundial
 *     watermark on the next-prayer banner.
 *
 * The third toggle (sun-arc inline strip) is a new layout key 'splitarc'
 * that piggybacks on the existing `layout` setting — no new key needed.
 */
export const migration006HomeDesign = {
  version: 6,
  up(db: any) {
    const now = Date.now();
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    );
    stmt.run('passed_dim_mode', 'all', now);
    stmt.run('hero_ambient', 'true', now);
  },
};
