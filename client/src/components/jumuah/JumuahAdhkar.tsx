import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BookOpen, ExternalLink, Heart, RotateCcw, Clock } from 'lucide-react';
import { useTick } from '@/contexts/TickContext';
import {
  inHourOfAcceptance,
  readSalawat,
  writeSalawat,
} from '@/lib/jumuah';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/cn';
import type { AppSettings, PrayerTimesResponse } from '@/types';

const KAHF_URL = 'https://quran.com/al-kahf';

/**
 * Friday adhkar panel — Surah Al-Kahf reminder, salawat tasbih, and a
 * conditional banner for the hour of acceptance (last hour before Maghrib
 * on Friday). Shown alongside the JumuahHero on Fridays.
 */
export function JumuahAdhkar({
  settings,
  prayerTimes,
}: {
  settings: AppSettings;
  prayerTimes: PrayerTimesResponse;
}) {
  const now = useTick();
  const { t } = useI18n();
  const tz = settings.timezone || undefined;

  const [count, setCount] = useState(() => readSalawat(now, tz));

  // Re-read at midnight rollover so the counter resets visually.
  useEffect(() => {
    setCount(readSalawat(now, tz));
    // We deliberately re-read on every minute boundary — cheap, and means
    // the daily reset doesn't require a midnight scheduler. The 1 Hz tick
    // would be wasteful here, so gate by minute change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(now.getTime() / 60000), tz]);

  const incrementSalawat = () => {
    const next = count + 1;
    setCount(next);
    writeSalawat(now, next, tz);
  };

  const resetSalawat = () => {
    setCount(0);
    writeSalawat(now, 0, tz);
  };

  const openKahf = () => {
    const api = window.electronAPI;
    if (api?.openExternal) {
      api.openExternal(KAHF_URL).catch(() => {});
    } else {
      window.open(KAHF_URL, '_blank', 'noopener,noreferrer');
    }
  };

  const acceptanceHour = inHourOfAcceptance(now, prayerTimes, tz);

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {t('jumuah.adhkar.title')}
      </div>

      {/* Hour of acceptance — only when in the last hour before Maghrib */}
      {acceptanceHour && (
        <div className="flex items-start gap-3 rounded-md border border-primary/40 bg-primary/10 p-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold text-primary">
              {t('jumuah.acceptance.title')}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('jumuah.acceptance.body')}
            </div>
          </div>
        </div>
      )}

      {/* Surah Al-Kahf */}
      <section className="flex flex-col gap-2 rounded-md border bg-card/40 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{t('jumuah.kahf.title')}</span>
            <span className="text-xs text-muted-foreground">{t('jumuah.kahf.subtitle')}</span>
          </div>
          <BookOpen className="h-4 w-4 shrink-0 text-primary" />
        </div>
        <p className="text-xs italic text-muted-foreground">
          {t('jumuah.kahf.hadith')}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 self-start"
          onClick={openKahf}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t('jumuah.kahf.cta')}
        </Button>
      </section>

      <Separator />

      {/* Salawat counter */}
      <section className="flex flex-col gap-2 rounded-md border bg-card/40 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{t('jumuah.salawat.title')}</span>
            <span className="text-xs text-muted-foreground">{t('jumuah.salawat.subtitle')}</span>
          </div>
          <Heart className="h-4 w-4 shrink-0 text-primary" />
        </div>
        <p className="text-xs italic text-muted-foreground">
          {t('jumuah.salawat.hadith')}
        </p>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={incrementSalawat}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md border bg-primary/10 px-4 py-3 transition-all',
              'hover:bg-primary/20 active:scale-[0.98]',
            )}
            aria-label={t('jumuah.salawat.tap')}
          >
            <span className="font-mono text-3xl font-medium tabular-nums text-primary">
              {count}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('jumuah.salawat.unit')}
            </span>
          </button>
          <Button
            size="icon"
            variant="ghost"
            onClick={resetSalawat}
            title={t('jumuah.salawat.reset')}
            disabled={count === 0}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {t('jumuah.salawat.daily_reset')}
        </p>
      </section>
    </Card>
  );
}
