// LayoutClassic intentionally renders its own inline next-prayer hero
// (not <NextPrayerBanner />) — the classic dashboard composition needs a
// 3-column top row, so the ambient hero treatment doesn't apply here.
import { Card } from '@/components/ui/card';
import { Countdown } from '@/components/prayer/Countdown';
import { PrayerGrid } from '@/components/prayer/PrayerGrid';
import { PrayerGridSkeleton } from '@/components/prayer/PrayerGridSkeleton';
import { PrayerSourceBadge } from '@/components/prayer/PrayerSourceBadge';
import { AthanPlayer } from '@/components/athan/AthanPlayer';
import { RadioPlayer } from '@/components/athan/RadioPlayer';
import { QiblaCard } from '@/components/qibla/QiblaCard';
import { QiblaCardSkeleton } from '@/components/qibla/QiblaCardSkeleton';
import { HijriCard } from '@/components/date/HijriCard';
import { StarMotif } from '@/components/motifs/StarMotif';
import { formatTime } from '@/lib/time';
import { MapPin } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import { displayCity } from '@/lib/locationDisplay';
import type { LayoutProps } from './types';

/** Layout A · Classic Dashboard — centred prayer list with sidebars. */
export function LayoutClassic({
  settings, location, prayerTimesQ, next, motifEnabled, tz,
}: LayoutProps) {
  const { t } = useI18n();
  const showSkeleton = !!location && prayerTimesQ.isLoading;
  return (
    <main className="flex-1 overflow-auto p-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        {/* Top stat row: date · countdown · location */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <HijriCard tz={tz} />

          <Card className="relative flex flex-col items-center justify-center gap-2 overflow-hidden p-5">
            {motifEnabled && (
              <StarMotif
                size={180}
                className="absolute -right-8 -top-8 text-foreground/5"
              />
            )}
            <div className="relative text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t('ui.next')}
            </div>
            <div className="relative font-display text-3xl">
              {next.name ? t(`prayer.${next.name}`) : '—'}
            </div>
            <div className="relative font-mono text-3xl tabular-nums">
              <Countdown toIso={next.iso} />
            </div>
            {next.iso && (
              <div className="relative text-xs text-muted-foreground">
                {t('ui.at')} {formatTime(next.iso, settings.time_format, tz)}
              </div>
            )}
          </Card>

          {location ? (
            <Card className="flex flex-col justify-center p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-xs uppercase tracking-wider">{t('ui.location')}</span>
              </div>
              <div className="mt-1 font-medium">
                {displayCity(location, t('loc.gps.current'))}
                {location.country ? `, ${location.country}` : ''}
              </div>
              <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
              </div>
            </Card>
          ) : (
            <Card className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {t('loc.no_location')}
            </Card>
          )}
        </div>

        {showSkeleton && (
          <>
            <PrayerGridSkeleton />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <AthanPlayer settings={settings} />
              <RadioPlayer settings={settings} />
              <QiblaCardSkeleton />
            </div>
          </>
        )}

        {prayerTimesQ.data && (
          <>
            <PrayerGrid times={prayerTimesQ.data} next={next} settings={settings} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <AthanPlayer settings={settings} />
              <RadioPlayer settings={settings} />
              <QiblaCard lat={location?.lat} lng={location?.lng} />
            </div>
            <div className="flex justify-end">
              <PrayerSourceBadge
                source={prayerTimesQ.data.source}
                cached={prayerTimesQ.data.cached}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
