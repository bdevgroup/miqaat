import { Card } from '@/components/ui/card';
import { Countdown } from '@/components/prayer/Countdown';
import { StarMotif } from '@/components/motifs/StarMotif';
import { Skeleton } from '@/components/ui/skeleton';
import { PRAYER_ORDER } from '@/types';
import { formatTime } from '@/lib/time';
import { cn } from '@/lib/cn';
import { MapPin } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { displayCity } from '@/lib/locationDisplay';
import type { LayoutProps } from './types';

/** Layout B · Hero First — massive next-prayer takes 60%, compact 6-row below. */
export function LayoutHero({
  settings, location, prayerTimesQ, next, motifEnabled, tz,
}: LayoutProps) {
  const { t } = useI18n();
  return (
    <main className="flex-1 overflow-auto p-5">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Card className="relative flex min-h-[52vh] flex-col items-center justify-center gap-6 overflow-hidden p-10 text-center">
          {motifEnabled && (
            <StarMotif
              size={520}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground/[0.04]"
            />
          )}

          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {t('ui.next')}
            </div>
            <div className="font-display text-7xl leading-none md:text-8xl">
              {next.name ? t(`prayer.${next.name}`) : '—'}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="font-mono text-5xl font-medium tabular-nums md:text-6xl">
              <Countdown toIso={next.iso} />
            </div>
            {next.iso && (
              <div className="text-sm text-muted-foreground">
                {t('ui.at')} {formatTime(next.iso, settings.time_format, tz)}
              </div>
            )}
          </div>

          {location && (
            <div className="relative z-10 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {displayCity(location, t('loc.gps.current'))}{location.country ? `, ${location.country}` : ''}
              </span>
            </div>
          )}
        </Card>

        {!location && (
          <Card className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {t('loc.choose')}
          </Card>
        )}

        {location && prayerTimesQ.isLoading && (
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-6 divide-x">
              {PRAYER_ORDER.map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1 px-2 py-4 text-center">
                  <Skeleton className="h-2.5 w-10" />
                  <Skeleton className="h-5 w-14" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {prayerTimesQ.data && (
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-6 divide-x">
              {PRAYER_ORDER.map((name) => {
                const iso = prayerTimesQ.data![name];
                const isNext = next.name === name;
                const isCurrent = next.currentName === name;
                return (
                  <div
                    key={name}
                    className={cn(
                      'flex flex-col items-center gap-1 px-2 py-4 text-center',
                      isNext && 'bg-primary/10',
                      isCurrent && !isNext && 'bg-accent/30',
                    )}
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t(`prayer.${name}`)}
                    </div>
                    <div
                      className={cn(
                        'font-mono text-lg tabular-nums',
                        isNext && 'text-primary font-semibold',
                      )}
                    >
                      {formatTime(iso, settings.time_format, tz)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
