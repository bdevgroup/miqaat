/**
 * Flush every row of `prayer_times_cache` once.
 *
 * Why: every cache row written before this version went through the buggy
 * `dateTimeWithDate()` (server/src/prayer-times/prayer-times.service.ts)
 * which treated Aladhan's local-time strings as UTC. In tz-east-of-UTC
 * zones (Morocco UTC+1, the Gulf, etc.) cached rows were 1 h late.
 *
 * The diagnostic was that *adhan-js fresh* rows (correct UTC) and
 * *Aladhan refreshed* rows (1 h late) coexisted in the same DB; users in
 * Morocco who set `global_offset_min = -60` to compensate saw correct
 * times only when the cache happened to be Aladhan-sourced — fresh
 * adhan-js writes appeared 1 h too early. The PDF dump on 2026-05-02
 * showed exactly half the May days off by 60 minutes.
 *
 * Migration 012 nukes every cached row so they're recomputed cleanly by
 * the fixed code on next access. Idempotent: deleting an empty table is
 * a no-op. The schema itself is unchanged.
 */
export const migration012FlushCorruptedCache = {
  version: 12,
  up(db: any) {
    db.prepare('DELETE FROM prayer_times_cache').run();
  },
};
