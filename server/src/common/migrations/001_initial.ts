export const migration001Initial = {
  version: 1,
  up(db: any) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS saved_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        timezone TEXT,
        is_current INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_saved_locations_current
        ON saved_locations(is_current);

      CREATE TABLE IF NOT EXISTS prayer_times_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        date TEXT NOT NULL,
        method INTEGER NOT NULL,
        madhab INTEGER NOT NULL,
        fajr TEXT NOT NULL,
        sunrise TEXT NOT NULL,
        dhuhr TEXT NOT NULL,
        asr TEXT NOT NULL,
        maghrib TEXT NOT NULL,
        isha TEXT NOT NULL,
        source TEXT NOT NULL,
        fetched_at INTEGER NOT NULL,
        UNIQUE(lat, lng, date, method, madhab)
      );
      CREATE INDEX IF NOT EXISTS idx_ptc_lookup
        ON prayer_times_cache(lat, lng, date);

      CREATE TABLE IF NOT EXISTS hijri_cache (
        gregorian_date TEXT PRIMARY KEY,
        hijri_date TEXT NOT NULL,
        hijri_day INTEGER NOT NULL,
        hijri_month INTEGER NOT NULL,
        hijri_month_en TEXT,
        hijri_month_ar TEXT,
        hijri_year INTEGER NOT NULL,
        source TEXT NOT NULL,
        fetched_at INTEGER NOT NULL
      );
    `);

    // Seed default settings
    const now = Date.now();
    const seed = db.prepare(
      `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    );
    const defaults: Record<string, string> = {
      theme: 'miqat',
      layout: 'split',
      language: 'en',
      time_format: '24h',
      calc_method: '3',
      madhab: '0',
      reciter: 'makkah',
      volume: '0.8',
      play_dua_after: 'true',
      notifications_enabled: 'false',
      compact_mode: 'false',
      timezone: '',
      widget_enabled: 'false',
      widget_position: '',
      onboarded: 'false',
      motif: 'star',
    };
    for (const [k, v] of Object.entries(defaults)) {
      seed.run(k, v, now);
    }
  },
};
