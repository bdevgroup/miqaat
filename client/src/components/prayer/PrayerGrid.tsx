import { PRAYER_ORDER, type PrayerTimesResponse, type AppSettings } from '@/types';
import { PrayerCard } from './PrayerCard';
import { useTick } from '@/contexts/TickContext';
import { isJumuahActive } from '@/lib/jumuah';
import type { NextPrayer } from '@/hooks/useNextPrayer';

export function PrayerGrid({
  times,
  next,
  settings,
}: {
  times: PrayerTimesResponse;
  next: NextPrayer;
  settings: AppSettings;
}) {
  const now = useTick();
  const dimAll = (settings.passed_dim_mode ?? 'all') === 'all';
  const tz = settings.timezone || undefined;
  // On Fridays, the Dhuhr card displays as "Jumu'ah" (when enhancements
  // are on; preview override also flips this). The underlying ISO time is
  // still Dhuhr — congregational Jumu'ah replaces it.
  const friday = isJumuahActive(now, settings, tz);
  return (
    <div data-testid="prayer-grid" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {PRAYER_ORDER.map((name) => {
        const iso = times[name];
        const isPast = new Date(iso).getTime() <= now.getTime();
        const isNext = next.name === name;
        const isCurrent = next.currentName === name;
        const isPassed = dimAll ? isPast && !isNext : isCurrent && !isNext;
        return (
          <PrayerCard
            key={name}
            name={name}
            iso={iso}
            isCurrent={isCurrent}
            isNext={isNext}
            isPassed={isPassed}
            jumuahLabel={friday && name === 'dhuhr'}
            timeFormat={settings.time_format}
            tz={tz}
          />
        );
      })}
    </div>
  );
}
