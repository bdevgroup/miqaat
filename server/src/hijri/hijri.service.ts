import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

export interface HijriDate {
  gregorian: string; // YYYY-MM-DD
  hijriDate: string; // DD-MM-YYYY
  day: number;
  month: number;
  monthEn: string;
  monthAr: string;
  year: number;
  source: 'local' | 'aladhan';
}

const MONTH_NAMES_EN = [
  'Muharram', 'Safar', "Rabi' al-awwal", "Rabi' al-thani",
  'Jumada al-awwal', 'Jumada al-thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah',
];

const MONTH_NAMES_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

@Injectable()
export class HijriService {
  constructor(private readonly db: DatabaseService) {}

  get(gregorian: string): HijriDate {
    const cached = this.db.db
      .prepare('SELECT * FROM hijri_cache WHERE gregorian_date = ?')
      .get(gregorian) as any;
    if (cached) {
      return {
        gregorian,
        hijriDate: cached.hijri_date,
        day: cached.hijri_day,
        month: cached.hijri_month,
        monthEn: cached.hijri_month_en,
        monthAr: cached.hijri_month_ar,
        year: cached.hijri_year,
        source: cached.source,
      };
    }

    const computed = this.computeLocal(gregorian);
    this.write(computed);
    return computed;
  }

  private computeLocal(gregorian: string): HijriDate {
    const d = new Date(gregorian + 'T12:00:00Z');
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC',
    });
    const parts = fmt.formatToParts(d);
    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value ?? '0');
    const day = get('day');
    const month = get('month');
    const year = get('year');
    return {
      gregorian,
      hijriDate: `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`,
      day, month, year,
      monthEn: MONTH_NAMES_EN[month - 1] ?? '',
      monthAr: MONTH_NAMES_AR[month - 1] ?? '',
      source: 'local',
    };
  }

  private write(h: HijriDate): void {
    this.db.db
      .prepare(
        `INSERT INTO hijri_cache
          (gregorian_date, hijri_date, hijri_day, hijri_month, hijri_month_en, hijri_month_ar, hijri_year, source, fetched_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(gregorian_date) DO UPDATE SET
          hijri_date = excluded.hijri_date, hijri_day = excluded.hijri_day,
          hijri_month = excluded.hijri_month, hijri_month_en = excluded.hijri_month_en,
          hijri_month_ar = excluded.hijri_month_ar, hijri_year = excluded.hijri_year,
          source = excluded.source, fetched_at = excluded.fetched_at`,
      )
      .run(
        h.gregorian, h.hijriDate, h.day, h.month,
        h.monthEn, h.monthAr, h.year, h.source, Date.now(),
      );
  }
}
