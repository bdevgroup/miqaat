import { Countdown } from '@/components/prayer/Countdown';
import { StarMotif } from '@/components/motifs/StarMotif';
import { formatTime } from '@/lib/time';
import { MapPin } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { displayCity } from '@/lib/locationDisplay';
import type { LayoutProps } from './types';

/** Layout D · Focus Mode — extreme minimal, only the next prayer. */
export function LayoutFocus({
  settings, location, next, motifEnabled, tz,
}: LayoutProps) {
  const { t } = useI18n();
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden p-10">
      {motifEnabled && (
        <StarMotif
          size={820}
          strokeWidth={0.4}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground/3"
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
            {t('ui.next')}
          </div>
          <div className="font-display text-8xl leading-none md:text-9xl">
            {next.name ? t(`prayer.${next.name}`) : '—'}
          </div>
        </div>

        <div className="h-px w-24 bg-border" />

        <div className="flex flex-col items-center gap-2">
          <div className="font-mono text-6xl font-light tabular-nums md:text-7xl">
            <Countdown toIso={next.iso} />
          </div>
          {next.iso && (
            <div className="text-base text-muted-foreground">
              {t('ui.at')} {formatTime(next.iso, settings.time_format, tz)}
            </div>
          )}
        </div>

        {location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="tracking-wider">
              {displayCity(location, t('loc.gps.current'))}{location.country ? `, ${location.country}` : ''}
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
