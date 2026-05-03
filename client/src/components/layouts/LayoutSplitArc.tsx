import { Card } from '@/components/ui/card';
import { HijriCard } from '@/components/date/HijriCard';
import { NextPrayerBanner } from '@/components/prayer/NextPrayerBanner';
import { NextPrayerBannerSkeleton } from '@/components/prayer/NextPrayerBannerSkeleton';
import { PrayerArcStrip } from '@/components/prayer/PrayerArcStrip';
import { PrayerSourceBadge } from '@/components/prayer/PrayerSourceBadge';
import { AthanPlayer } from '@/components/athan/AthanPlayer';
import { RadioPlayer } from '@/components/athan/RadioPlayer';
import { QiblaCard } from '@/components/qibla/QiblaCard';
import { QiblaCardSkeleton } from '@/components/qibla/QiblaCardSkeleton';
import { JumuahHero } from '@/components/jumuah/JumuahHero';
import { JumuahAdhkar } from '@/components/jumuah/JumuahAdhkar';
import { useTick } from '@/contexts/TickContext';
import { isJumuahActive } from '@/lib/jumuah';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import type { LayoutProps } from './types';

/**
 * Variant C — same Split skeleton, but the prayer-card grid is replaced
 * with a horizontal sun-arc strip carrying the same prayer-time info plus
 * a "where in the day are we" indicator.
 */
export function LayoutSplitArc({
  settings, location, prayerTimesQ, next, motifEnabled, tz,
}: LayoutProps) {
  const { t } = useI18n();
  const now = useTick();
  const showSkeleton = !!location && prayerTimesQ.isLoading;
  const friday = isJumuahActive(now, settings, tz);
  return (
    <main className="flex flex-1 overflow-hidden">
      {/* Same rail composition as LayoutSplit — clock + Athan on the left,
          Radio on the right. Variant C only differs in the centre. */}
      <aside className="hidden w-90 shrink-0 overflow-y-auto border-r bg-card/30 p-4 md:block">
        <div className="flex flex-col gap-3">
          <HijriCard tz={tz} />
          <AthanPlayer settings={settings} />
        </div>
      </aside>

      <section className="flex flex-1 flex-col overflow-auto p-5">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-1 flex-col gap-4">
          {!location && (
            <Card className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {t('loc.choose')}
            </Card>
          )}

          {showSkeleton && (
            <>
              <NextPrayerBannerSkeleton />
              <Skeleton className="h-64 w-full rounded-lg" />
              <QiblaCardSkeleton />
            </>
          )}

          {prayerTimesQ.data && (
            <>
              {friday && (
                <JumuahHero settings={settings} prayerTimes={prayerTimesQ.data} />
              )}
              <NextPrayerBanner
                next={next}
                settings={settings}
                motifEnabled={motifEnabled}
                prayerTimes={prayerTimesQ.data}
              />
              <PrayerArcStrip
                times={prayerTimesQ.data}
                nextName={next.name}
                timeFormat={settings.time_format}
                tz={tz}
              />
              {friday && (
                <JumuahAdhkar settings={settings} prayerTimes={prayerTimesQ.data} />
              )}
              <QiblaCard
                lat={location?.lat}
                lng={location?.lng}
                className="min-h-0 flex-1"
              />
              <div className="flex justify-end">
                <PrayerSourceBadge
                  source={prayerTimesQ.data.source}
                  cached={prayerTimesQ.data.cached}
                />
              </div>
            </>
          )}
        </div>
      </section>

      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l bg-card/30 p-4 lg:block">
        <div className="flex flex-col gap-3">
          <RadioPlayer settings={settings} />
        </div>
      </aside>
    </main>
  );
}
