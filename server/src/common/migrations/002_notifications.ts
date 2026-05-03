export const migration002Notifications = {
  version: 2,
  up(db: any) {
    const now = Date.now();
    const seed = db.prepare(
      `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    );
    const defaults: Record<string, string> = {
      notify_fajr: 'true',
      notify_sunrise: 'false',
      notify_dhuhr: 'true',
      notify_asr: 'true',
      notify_maghrib: 'true',
      notify_isha: 'true',
      pre_notify_minutes: '0',
    };
    for (const [k, v] of Object.entries(defaults)) {
      seed.run(k, v, now);
    }
  },
};
