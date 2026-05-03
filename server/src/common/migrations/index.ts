import { Logger } from '@nestjs/common';
import { migration001Initial } from './001_initial';
import { migration002Notifications } from './002_notifications';
import { migration003CustomAngles } from './003_custom_angles';
import { migration004RadioStation } from './004_radio_station';
import { migration005PerPrayerReciter } from './005_per_prayer_reciter';
import { migration006HomeDesign } from './006_home_design';
import { migration007Jumuah } from './007_jumuah';
import { migration008JumuahPreview } from './008_jumuah_preview';
import { migration009CustomReciters } from './009_custom_reciters';
import { migration010PrayerOffsets } from './010_prayer_offsets';
import { migration011GlobalOffset } from './011_global_offset';
import { migration012FlushCorruptedCache } from './012_flush_corrupted_cache';

type Migration = { version: number; up: (db: any) => void };

const MIGRATIONS: Migration[] = [
  migration001Initial,
  migration002Notifications,
  migration003CustomAngles,
  migration004RadioStation,
  migration005PerPrayerReciter,
  migration006HomeDesign,
  migration007Jumuah,
  migration008JumuahPreview,
  migration009CustomReciters,
  migration010PrayerOffsets,
  migration011GlobalOffset,
  migration012FlushCorruptedCache,
];

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

export function runMigrations(db: any, logger?: Logger): void {
  const current = db.pragma('user_version', { simple: true }) as number;

  for (const m of MIGRATIONS) {
    if (current < m.version) {
      logger?.log(`Applying migration v${m.version}…`);
      const tx = db.transaction(() => {
        m.up(db);
        db.pragma(`user_version = ${m.version}`);
      });
      tx();
    }
  }
}
