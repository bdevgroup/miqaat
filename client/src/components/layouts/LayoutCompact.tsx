import { Countdown } from '@/components/prayer/Countdown';
import { StarMotif } from '@/components/motifs/StarMotif';
import { Skeleton } from '@/components/ui/skeleton';
import { PRAYER_ORDER } from '@/types';
import { formatTime } from '@/lib/time';
import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n/useI18n';
import type { LayoutProps } from './types';

/**
 * Compact mode — a dense single-row layout for small windows / quick glance.
 * No sidebars, no hero. Just the essentials in one strip.
 */
export function LayoutCompact({
  settings, prayerTimesQ, next, motifEnabled, tz,
}: LayoutProps) {
  const { t } = useI18n();
  return (
    <main className="flex flex-1 flex-col gap-3 overflow-auto p-3">
      <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-lg border bg-card p-3">
        {motifEnabled && (
          <StarMotif
            size={140}
            className="absolute -right-6 -top-6 text-foreground/[0.05]"
          />
        )}
        <div className="relative flex items-center gap-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {t('ui.next.short')}
          </div>
          <div className="font-display text-xl">
            {next.name ? t(`prayer.${next.name}`) : '—'}
          </div>
        </div>
        <div className="relative flex items-center gap-3">
          <div className="font-mono text-2xl tabular-nums text-primary">
            <Countdown toIso={next.iso} />
          </div>
          {next.iso && (
            <div className="font-mono text-xs text-muted-foreground">
              @ {formatTime(next.iso, settings.time_format, tz)}
            </div>
          )}
        </div>
      </div>

      {prayerTimesQ.isLoading && !prayerTimesQ.data && (
        <div className="grid grid-cols-6 gap-1.5">
          {PRAYER_ORDER.map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-0.5 rounded-md border bg-card px-1 py-2"
            >
              <Skeleton className="h-2 w-6" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      )}

      {prayerTimesQ.data && (
        <div className="grid grid-cols-6 gap-1.5">
          {PRAYER_ORDER.map((name) => {
            const iso = prayerTimesQ.data![name];
            const isNext = next.name === name;
            const isCurrent = next.currentName === name;
            return (
              <div
                key={name}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-md border bg-card px-1 py-2',
                  isNext && 'border-primary/60 bg-primary/5',
                  isCurrent && !isNext && 'bg-accent/30',
                )}
              >
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {t(`prayer.${name}`).slice(0, 3)}
                </div>
                <div
                  className={cn(
                    'font-mono text-xs tabular-nums',
                    isNext && 'font-semibold text-primary',
                  )}
                >
                  {formatTime(iso, settings.time_format, tz)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
