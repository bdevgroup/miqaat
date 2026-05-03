/**
 * Global time-shift offset (v1.7) — single ±120 minute adjustment applied
 * to every prayer in addition to the per-prayer offsets from migration 010.
 *
 * The intended use case is countries where the operating system's tzdata
 * disagrees with the actual civil time. Morocco is the canonical example:
 * since 2018 they observe permanent UTC+1 except for a temporary fallback
 * during Ramadan; un-patched Windows often reports UTC+0 year-round, so
 * users need to manually push prayer times forward by 60 minutes until
 * their OS catches up.
 *
 * Range: -120..+120 minutes. Default: 0.
 */
export const migration011GlobalOffset = {
  version: 11,
  up(db: any) {
    db.prepare(
      `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    ).run('global_offset_min', '0', Date.now());
  },
};
