import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTick } from '@/contexts/TickContext';
import { useCurrentLocation } from '@/hooks/useLocations';
import {
  detectClockMismatch,
  formatOffset,
  type ClockMismatch,
} from '@/lib/clockMismatch';
import { useI18n } from '@/i18n/useI18n';

/**
 * Slim warning strip rendered between the TopBar and the main layout when
 * the system clock and the location's clock disagree by ≥15 min. Fixes a
 * real risk: stale Windows tzdata or the user travelling without updating
 * the laptop tz means prayer notifications can fire at the wrong wall-clock
 * moment, even though `useNotifications` is computing absolute timestamps.
 *
 * Dismissible per-session via localStorage `miqaat:clock-mismatch:dismiss`
 * (signed against the offset pair so a different mismatch later still
 * surfaces). Re-checks every minute, not on the 1 Hz tick.
 */
const DISMISS_KEY = 'miqaat:clock-mismatch:dismiss';

export function ClockMismatchBanner() {
  const now = useTick();
  const { data: location } = useCurrentLocation();
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(DISMISS_KEY);
  });

  // Re-evaluate on minute boundaries — sub-minute precision isn't relevant
  // and avoids re-running on every tick. State is stable across most ticks
  // because system tz changes are rare.
  const minute = Math.floor(now.getTime() / 60_000);
  const [mismatch, setMismatch] = useState<ClockMismatch | null>(null);
  useEffect(() => {
    setMismatch(detectClockMismatch(now, location?.timezone ?? undefined));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minute, location?.timezone]);

  if (!mismatch) return null;

  const signature = `${mismatch.systemOffsetMin}:${mismatch.locationOffsetMin}:${mismatch.kind}`;
  if (dismissed === signature) return null;

  const dismiss = () => {
    setDismissed(signature);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, signature);
    }
  };

  return (
    <div
      className="flex items-center gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs"
      role="alert"
    >
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-semibold text-amber-700 dark:text-amber-400">
          {t('clock.mismatch.title')}
        </span>
        <span className="text-muted-foreground">
          {mismatch.kind === 'tz-name' ? (
            <>
              {t('clock.mismatch.body.tz')}{' '}
              <span className="font-mono">{mismatch.systemTz}</span> ({formatOffset(mismatch.systemOffsetMin)})
              {' · '}
              <span className="font-mono">{mismatch.locationTz}</span> ({formatOffset(mismatch.locationOffsetMin)})
              {'. '}
              {t('clock.mismatch.action')}
            </>
          ) : (
            <>
              {t('clock.mismatch.body.offset')}{' '}
              <span className="font-mono">{mismatch.systemTz}</span>
              {' '}
              ({formatOffset(mismatch.systemOffsetMin)}{' '}
              {t('clock.mismatch.body.expected')}{' '}
              {formatOffset(mismatch.locationOffsetMin)})
              {'. '}
              {t('clock.mismatch.action.tzdata')}
            </>
          )}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
        onClick={dismiss}
        aria-label={t('clock.mismatch.dismiss')}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
