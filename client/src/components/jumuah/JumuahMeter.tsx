import { AJR_TIERS, type AjrWindow } from '@/lib/jumuah';
import { useI18n } from '@/i18n/useI18n';
import { formatTime } from '@/lib/time';
import { cn } from '@/lib/cn';

/**
 * The five-segment ajr ladder. Each segment is one of the "hours" between
 * sunrise and Dhuhr. Segments before `now` are marked passed (faded), the
 * current segment glows amber, future segments are outlined.
 *
 * After Dhuhr (state='khutbah') the meter locks with a "imam on minbar /
 * angels close their books" indicator. After Maghrib (state='done') the
 * meter is dim and shows "barakah of the day continues with adhkar".
 */
export function JumuahMeter({
  window,
  timeFormat,
  tz,
}: {
  window: AjrWindow;
  timeFormat: '12h' | '24h';
  tz?: string;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {t('jumuah.meter.title')}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {t(`jumuah.meter.state.${window.state}`)}
        </span>
      </div>

      {/* The 5-segment bar */}
      <div className="flex items-stretch gap-1.5">
        {AJR_TIERS.map((tier, i) => {
          const isCurrent = window.segment === i;
          const isPast = window.segment > i || window.state === 'khutbah' || window.state === 'done';
          const isFuture = !isCurrent && !isPast;
          const startMs = window.segmentBoundaries[i];
          const endMs = window.segmentBoundaries[i + 1];
          return (
            <div
              key={tier.index}
              className={cn(
                'group relative flex flex-1 flex-col items-center justify-between gap-1 rounded-md border p-2 transition-all',
                isCurrent && 'border-primary/70 bg-primary/15 shadow-md ring-2 ring-primary/30',
                isPast && 'opacity-45',
                isFuture && 'opacity-80',
              )}
              data-tier={tier.index}
              data-state={isCurrent ? 'current' : isPast ? 'past' : 'future'}
              title={t(tier.i18nKey)}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {tier.symbol}
              </span>
              <div className="flex flex-col items-center gap-0.5">
                <span className={cn(
                  'text-[10px] font-semibold uppercase tracking-wider',
                  isCurrent ? 'text-primary' : 'text-muted-foreground',
                )}>
                  {t(`jumuah.ordinal.${tier.index}`)}
                </span>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {formatTime(new Date(startMs).toISOString(), timeFormat, tz)}
                  {' – '}
                  {formatTime(new Date(endMs).toISOString(), timeFormat, tz)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {t(tier.i18nKey)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] italic text-muted-foreground">
        {t('jumuah.meter.hadith')}
      </p>
    </div>
  );
}
