/**
 * Custom Athan reciters — user-uploaded MP3/M4A/OGG files. The audio data
 * itself sits on disk under `<userData>/custom-athans/<filename>` so the
 * SQLite DB stays small; this row tracks the metadata + on-disk filename.
 *
 *   name          → user-chosen display label (e.g. "Local mosque imam")
 *   filename      → on-disk basename (id.ext) — always relative to the
 *                   custom-athans directory; never a full path so the data
 *                   stays portable if userData moves
 *   duration_ms   → optional; populated when the renderer measures the
 *                   audio after upload (used for the now-playing progress)
 *   size_bytes    → for the Custom-reciters list display
 */
export const migration009CustomReciters = {
  version: 9,
  up(db: any) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS custom_reciters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        filename TEXT NOT NULL UNIQUE,
        duration_ms INTEGER,
        size_bytes INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_custom_reciters_created
        ON custom_reciters(created_at DESC);
    `);
  },
};
