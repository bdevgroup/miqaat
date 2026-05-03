export const migration003CustomAngles = {
  version: 3,
  up(db: any) {
    const now = Date.now();
    const seed = db.prepare(
      `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    );
    // Sensible defaults mirror Muslim World League (fajr 18°, isha 17°).
    // ishaInterval: 0 = use angle; >0 = fixed minutes after Maghrib (used in
    // Umm al-Qura during Ramadan, etc.).
    const defaults: Record<string, string> = {
      custom_fajr_angle: '18',
      custom_isha_angle: '17',
      custom_isha_interval: '0',
    };
    for (const [k, v] of Object.entries(defaults)) {
      seed.run(k, v, now);
    }
  },
};
