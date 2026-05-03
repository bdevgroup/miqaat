import { cn } from '@/lib/cn';
import { type PrayerName } from '@/types';
import { formatTime } from '@/lib/time';
import { useI18n } from '@/i18n/useI18n';
import {
  Sunrise, Sun, CloudSun, Sunset, Moon, CloudMoon,
} from 'lucide-react';

const ICONS: Record<PrayerName, typeof Sunrise> = {
  fajr: CloudMoon,
  sunrise: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: Moon,
};

export function PrayerCard({
  name,
  iso,
  isCurrent,
  isNext,
  isPassed,
  jumuahLabel = false,
  timeFormat,
  tz,
}: {
  name: PrayerName;
  iso: string;
  /** Most-recently-passed prayer (always exactly one once Fajr is past). */
  isCurrent: boolean;
  /** Upcoming prayer the countdown points at. */
  isNext: boolean;
  /** Already-elapsed prayer (multiple once afternoon hits). */
  isPassed: boolean;
  /** True only for the Dhuhr card on Friday — relabels to "Jumu'ah". */
  jumuahLabel?: boolean;
  timeFormat: '12h' | '24h';
  tz?: string;
}) {
  const Icon = ICONS[name];
  const { t } = useI18n();
  // Three mutually-exclusive visual states:
  //   NEXT     → strong primary outline + ring + filled badge
  //   PASSED   → faded card (current = slightly less faded + outlined badge)
  //   UPCOMING → neutral card
  return (
    <div
      data-prayer={name}
      data-state={isNext ? 'next' : isPassed ? 'passed' : 'upcoming'}
      className={cn(
        'group relative flex flex-col items-center gap-2 rounded-lg border bg-card p-5 text-card-foreground transition-all',
        isNext && 'border-primary/60 ring-2 ring-primary/30 shadow-md',
        isPassed && !isCurrent && 'opacity-40',
        isPassed && isCurrent && 'opacity-65',
      )}
    >
      {isNext && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          {t('ui.next.short')}
        </span>
      )}
      {isPassed && isCurrent && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full border bg-background px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          {t('ui.passed')}
        </span>
      )}
      <Icon
        className={cn(
          'h-6 w-6 transition-colors',
          isNext ? 'text-primary' : 'text-muted-foreground',
        )}
      />
      <div className={cn(
        'text-xs font-medium uppercase tracking-wider',
        jumuahLabel ? 'text-primary' : 'text-muted-foreground',
      )}>
        {jumuahLabel ? t('prayer.jumuah') : t(`prayer.${name}`)}
      </div>
      <div
        className={cn(
          'font-mono text-2xl font-medium tabular-nums',
          isNext && 'text-primary',
        )}
      >
        {formatTime(iso, timeFormat, tz)}
      </div>
    </div>
  );
}
