import { Card } from '@/components/ui/card';
import { Sparkles, Mic } from 'lucide-react';
import { useTick } from '@/contexts/TickContext';
import { ajrWindow } from '@/lib/jumuah';
import { useI18n } from '@/i18n/useI18n';
import { formatTime } from '@/lib/time';
import type { AppSettings, PrayerTimesResponse } from '@/types';
import { JumuahMeter } from './JumuahMeter';
import { KufiMotif } from '@/components/motifs/KufiMotif';
import { Countdown } from '@/components/prayer/Countdown';

/**
 * Friday-only hero. Shape depends on where the day is at:
 *
 *   pending / active  → Full Hero — greeting + countdown + 5-segment ajr ladder.
 *                       This is the prime moment: the meter actively guides the
 *                       user through the early-arrival window.
 *   khutbah           → Slim banner only — "Khutbah in session". Countdown +
 *                       meter no longer have any actionable value (Jumu'ah is
 *                       happening), so we drop them and let NextPrayerBanner
 *                       (which now points at Asr) own the hero spot below.
 *   done              → Returns null. Ribbon at the top + Adhkar panel below
 *                       the grid already carry the "today is Jumu'ah" presence.
 *
 * The Friday Adhkar panel and the Dhuhr → "Jumu'ah" relabel stay regardless
 * of state — they're not tied to this component.
 */
export function JumuahHero({
  settings,
  prayerTimes,
}: {
  settings: AppSettings;
  prayerTimes: PrayerTimesResponse;
}) {
  const now = useTick();
  const { t } = useI18n();
  const tz = settings.timezone || undefined;
  const win = ajrWindow(now, prayerTimes);
  if (!win) return null;
  if (win.state === 'done') return null;

  // After Dhuhr but before Maghrib — slim "Khutbah in session" card. One row.
  if (win.state === 'khutbah') {
    return (
      <Card
        className="relative flex items-center gap-3 overflow-hidden border-primary/40 p-4"
        style={{
          backgroundImage:
            'linear-gradient(90deg, hsl(33 60% 55% / 0.18) 0%, hsl(33 60% 55% / 0.06) 100%)',
        }}
        data-friday="true"
        data-jumuah-state="khutbah"
      >
        <Mic className="h-5 w-5 shrink-0 text-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-primary">
            {t('jumuah.hero.khutbah.title')}
          </span>
          <span className="text-xs text-muted-foreground">
            {t('jumuah.hero.khutbah.body')}
          </span>
        </div>
      </Card>
    );
  }

  // Pre-Jumu'ah — the prime Hero. Greeting + countdown + ajr meter.
  const dhuhrIso = prayerTimes.dhuhr;
  return (
    <Card
      className="relative overflow-hidden border-primary/40 p-6"
      style={{
        backgroundImage:
          'radial-gradient(circle at 85% 0%, hsl(33 60% 60% / 0.22) 0%, hsl(33 60% 50% / 0.05) 60%, transparent 100%)',
      }}
      data-friday="true"
      data-jumuah-state={win.state}
    >
      <KufiMotif
        size={300}
        className="absolute -right-16 -top-16 text-primary/15"
      />
      <div className="relative flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-primary">
            {t('jumuah.hero.eyebrow')}
          </span>
        </div>
        <span className="font-display text-2xl text-foreground/85">
          {t('jumuah.hero.greeting')}
        </span>
      </div>

      <div className="relative mt-4 flex flex-wrap items-end gap-x-8 gap-y-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t('jumuah.hero.in')}
          </span>
          <div className="font-display text-5xl leading-none md:text-6xl">
            <Countdown toIso={dhuhrIso} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t('jumuah.hero.at')}
          </span>
          <div className="font-mono text-3xl font-medium tabular-nums md:text-4xl">
            {formatTime(dhuhrIso, settings.time_format, tz)}
          </div>
        </div>
      </div>

      <div className="relative mt-5">
        <JumuahMeter window={win} timeFormat={settings.time_format} tz={tz} />
      </div>
    </Card>
  );
}
