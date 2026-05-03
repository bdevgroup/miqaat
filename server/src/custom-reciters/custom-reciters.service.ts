import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DatabaseService } from '../common/database.service';

export interface CustomReciterRow {
  id: number;
  name: string;
  filename: string;
  duration_ms: number | null;
  size_bytes: number;
  created_at: number;
}

/**
 * Custom Athan reciters — user-uploaded audio files. Files live on disk
 * under `<userData>/custom-athans/<filename>`; the DB only tracks metadata.
 *
 * The directory sits alongside the SQLite DB (same userData root) so they
 * share lifecycle: backup one, backup both; move userData, both follow.
 */
@Injectable()
export class CustomRecitersService {
  private readonly logger = new Logger(CustomRecitersService.name);
  constructor(private readonly db: DatabaseService) {}

  /** Disk directory holding the audio files. Created lazily on first use. */
  getDir(): string {
    // The DB lives in the userData root; custom-athans is a sibling folder.
    const dbPath =
      process.env.DB_PATH ??
      path.resolve(__dirname, '..', '..', 'miqaat.db');
    const dir = path.join(path.dirname(dbPath), 'custom-athans');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  list(): CustomReciterRow[] {
    return this.db.db
      .prepare(
        `SELECT id, name, filename, duration_ms, size_bytes, created_at
         FROM custom_reciters
         ORDER BY created_at DESC`,
      )
      .all() as CustomReciterRow[];
  }

  get(id: number): CustomReciterRow {
    const row = this.db.db
      .prepare(
        `SELECT id, name, filename, duration_ms, size_bytes, created_at
         FROM custom_reciters WHERE id = ?`,
      )
      .get(id) as CustomReciterRow | undefined;
    if (!row) throw new NotFoundException(`Custom reciter ${id} not found`);
    return row;
  }

  /**
   * Insert a row + return it. The caller (controller) is responsible for
   * having already written the file to disk via Multer; we just record it.
   */
  create(input: {
    name: string;
    filename: string;
    sizeBytes: number;
    durationMs?: number | null;
  }): CustomReciterRow {
    const stmt = this.db.db.prepare(
      `INSERT INTO custom_reciters (name, filename, duration_ms, size_bytes, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    );
    const result = stmt.run(
      input.name.trim() || 'Untitled reciter',
      input.filename,
      input.durationMs ?? null,
      input.sizeBytes,
      Date.now(),
    );
    return this.get(Number(result.lastInsertRowid));
  }

  /** Update the duration after the renderer has measured it. */
  setDuration(id: number, durationMs: number): CustomReciterRow {
    this.db.db
      .prepare(`UPDATE custom_reciters SET duration_ms = ? WHERE id = ?`)
      .run(Math.max(0, Math.floor(durationMs)), id);
    return this.get(id);
  }

  /** Rename a custom reciter (display label only, file untouched). */
  rename(id: number, name: string): CustomReciterRow {
    this.db.db
      .prepare(`UPDATE custom_reciters SET name = ? WHERE id = ?`)
      .run(name.trim() || 'Untitled reciter', id);
    return this.get(id);
  }

  /** Remove the row + delete the file from disk. Idempotent on the FS side. */
  remove(id: number): void {
    const row = this.get(id);
    const filePath = path.join(this.getDir(), row.filename);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      this.logger.warn(
        `Failed to delete file ${filePath}: ${(err as Error).message}`,
      );
    }
    this.db.db.prepare(`DELETE FROM custom_reciters WHERE id = ?`).run(id);
  }

  /** Resolve the absolute filesystem path for a row. */
  filePath(row: CustomReciterRow): string {
    return path.join(this.getDir(), row.filename);
  }
}
