import { Card } from '@/components/ui/card';
import { HijriCard } from '@/components/date/HijriCard';
import { NextPrayerBanner } from '@/components/prayer/NextPrayerBanner';
import { NextPrayerBannerSkeleton } from '@/components/prayer/NextPrayerBannerSkeleton';
import { PrayerGrid } from '@/components/prayer/PrayerGrid';
import { PrayerGridSkeleton } from '@/components/prayer/PrayerGridSkeleton';
import { PrayerSourceBadge } from '@/components/prayer/PrayerSourceBadge';
import { AthanPlayer } from '@/components/athan/AthanPlayer';
import { RadioPlayer } from '@/components/athan/RadioPlayer';
import { QiblaCard } from '@/components/qibla/QiblaCard';
import { QiblaCardSkeleton } from '@/components/qibla/QiblaCardSkeleton';
import { JumuahHero } from '@/components/jumuah/JumuahHero';
import { JumuahAdhkar } from '@/components/jumuah/JumuahAdhkar';
import { useTick } from '@/contexts/TickContext';
import { isJumuahActive } from '@/lib/jumuah';
import { MapPin } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import type { LayoutProps } from './types';

export function LayoutSplit({
  settings, location, prayerTimesQ, next, motifEnabled, tz,
}: LayoutProps) {
  const { t } = useI18n();
  const now = useTick();
  const showSkeleton = !!location && prayerTimesQ.isLoading;
  const friday = isJumuahActive(now, settings, tz);
  return (
    <main className="flex flex-1 overflow-hidden">
      {/* Left rail — clock/date + Athan player (the "what's about to play"
          channel sits next to the time so the eye stays in one column). */}
      <aside className="hidden w-90 min-w-0 shrink-0 overflow-x-hidden overflow-y-auto border-r bg-card/30 p-4 md:block">
        <div className="flex flex-col gap-3">
          <HijriCard tz={tz} />
          <div data-tour="athan-player">
            <AthanPlayer settings={settings} />
          </div>
        </div>
      </aside>

      <section className="flex flex-1 flex-col overflow-auto p-5">
        {/* `min-h-full` makes the column span the section's full height even
            when content is shorter, so QiblaCard's `flex-1` below has space
            to grow into. `min-h-0` keeps inner overflow honest. */}
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
              <PrayerGridSkeleton />
              <QiblaCardSkeleton />
            </>
          )}

          {prayerTimesQ.data && (
            <>
              {friday && (
                <JumuahHero settings={settings} prayerTimes={prayerTimesQ.data} />
              )}
              <div data-tour="next-prayer">
                <NextPrayerBanner
                  next={next}
                  settings={settings}
                  motifEnabled={motifEnabled}
                  prayerTimes={prayerTimesQ.data}
                />
              </div>
              <div data-tour="prayer-grid">
                <PrayerGrid
                  times={prayerTimesQ.data}
                  next={next}
                  settings={settings}
                />
              </div>

              {friday ? (
                /* Friday two-column: Adhkar + Qibla share the remaining
                   vertical space. lg breakpoint mirrors the right-rail
                   breakpoint, so when the radio rail is visible the centre
                   has enough width to split. Below lg, falls back to the
                   stacked single-column path so nothing gets squashed. */
                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
                  <JumuahAdhkar settings={settings} prayerTimes={prayerTimesQ.data} />
                  <div data-tour="qibla" className="flex min-h-105 flex-col lg:min-h-0">
                    <QiblaCard
                      lat={location?.lat}
                      lng={location?.lng}
                      className="flex-1"
                    />
                  </div>
                </div>
              ) : (
                /* Default: Qibla fills the rest of the centre column —
                   `flex-1` + `min-h-0` so the compass scales fluidly and
                   the map mode gets full vertical real estate. */
                <div data-tour="qibla" className="flex min-h-0 flex-1 flex-col">
                  <QiblaCard
                    lat={location?.lat}
                    lng={location?.lng}
                    className="flex-1"
                  />
                </div>
              )}

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

      {/* Right rail — Live radio (passive listening). Was on the left
          before, but the Athan player belongs next to the next-prayer
          countdown; radio is the secondary feature and lives here. */}
      <aside className="hidden w-80 min-w-0 shrink-0 overflow-x-hidden overflow-y-auto border-l bg-card/30 p-4 lg:block">
        <div className="flex flex-col gap-3">
          <RadioPlayer settings={settings} />
        </div>
      </aside>
    </main>
  );
}
