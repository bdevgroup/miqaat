import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadBetterSqlite3 } from './sqlite-loader';
import { runMigrations, SCHEMA_VERSION } from './migrations';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private _db: any;

  get db() {
    if (!this._db) throw new Error('Database not initialized');
    return this._db;
  }

  onModuleInit() {
    const dbPath =
      process.env.DB_PATH ??
      path.resolve(__dirname, '..', '..', 'miqaat.db');

    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const Database = loadBetterSqlite3();
    this._db = new Database(dbPath);
    this._db.pragma('journal_mode = WAL');
    this._db.pragma('foreign_keys = ON');
    this.logger.log(`SQLite opened at ${dbPath}`);

    runMigrations(this._db, this.logger);
    const current = this._db.pragma('user_version', { simple: true }) as number;
    this.logger.log(`Schema version: ${current} (latest: ${SCHEMA_VERSION})`);
  }

  onModuleDestroy() {
    if (this._db) {
      this._db.close();
      this._db = null;
    }
  }
}
