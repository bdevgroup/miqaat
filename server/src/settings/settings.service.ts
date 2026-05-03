import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

@Injectable()
export class SettingsService {
  constructor(private readonly db: DatabaseService) {}

  getAll(): Record<string, string> {
    const rows = this.db.db
      .prepare('SELECT key, value FROM settings')
      .all() as Array<{ key: string; value: string }>;
    const out: Record<string, string> = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  }

  get(key: string): string | null {
    const row = this.db.db
      .prepare('SELECT value FROM settings WHERE key = ?')
      .get(key) as { value: string } | undefined;
    return row?.value ?? null;
  }

  upsertMany(patch: Record<string, string>): Record<string, string> {
    const now = Date.now();
    const stmt = this.db.db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    );
    const tx = this.db.db.transaction(() => {
      for (const [k, v] of Object.entries(patch)) {
        stmt.run(k, String(v), now);
      }
    });
    tx();
    return this.getAll();
  }
}
