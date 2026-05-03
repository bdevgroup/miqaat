import { Card } from '@/components/ui/card';
import { useHijri } from '@/hooks/usePrayerTimes';
import { useTick } from '@/contexts/TickContext';
import { useI18n } from '@/i18n/useI18n';
import { DateTime } from 'luxon';

/**
 * Locale → luxon locale string. The `-u-nu-latn` extension forces Latin
 * digits (so AR shows "26" rather than "٢٦") to keep the wall clock
 * visually consistent with prayer times rendered elsewhere.
 */
const LUXON_LOCALES = { en: 'en', fr: 'fr', ar: 'ar-u-nu-latn' } as const;

/** "AH" suffix per locale — used after the Hijri year. */
const HIJRI_ERA_SUFFIX = { en: 'AH', fr: 'AH', ar: 'هـ' } as const;

export function HijriCard({ tz }: { tz?: string }) {
  const now = useTick();
  const { data: hijri } = useHijri();
  const { lang } = useI18n();
  const greg = DateTime.fromJSDate(now)
    .setZone(tz ?? 'local')
    .setLocale(LUXON_LOCALES[lang]);

  // Pick the locale-appropriate Hijri month name. The server returns both
  // the English transliteration and the Arabic form; we prefer Arabic in
  // the AR locale, English everywhere else.
  const hijriMonth = hijri
    ? lang === 'ar' ? hijri.monthAr : hijri.monthEn
    : '';

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-col">
        <span className="font-mono text-4xl font-medium tabular-nums leading-none">
          {greg.toFormat('HH:mm')}
          <span className="text-lg text-muted-foreground">
            :{greg.toFormat('ss')}
          </span>
        </span>
        <span className="mt-2 text-sm text-muted-foreground">
          {greg.toFormat('EEEE, d LLLL yyyy')}
        </span>
      </div>
      {hijri && (
        <div className="border-t pt-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="font-display text-2xl leading-none">
            {hijri.day} {hijriMonth}
          </div>
          <div className="text-sm text-muted-foreground">
            {hijri.year} {HIJRI_ERA_SUFFIX[lang]}
            {lang !== 'ar' && (
              <>
                {' · '}
                <span dir="rtl" className="font-medium">{hijri.monthAr}</span>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
