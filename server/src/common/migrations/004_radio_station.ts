export const migration004RadioStation = {
  version: 4,
  up(db: any) {
    const now = Date.now();
    db.prepare(
      `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    ).run('radio_station', 'tarateel', now);
  },
};
