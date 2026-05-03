import { useEffect, useRef } from 'react';
import { useTick } from '@/contexts/TickContext';
import { applyFavicon, buildFaviconSvg, computeSolarT } from '@/lib/dynamicFavicon';
import type { PrayerTimesResponse } from '@/types';

/**
 * Updates the page's favicon to reflect the sun's current position on the
 * sundial arc (Fajr → Isha if known, else 06:00 → 20:00 local). Throttled
 * to ~once per minute — the dot moves <1 px per minute on a 64-px arc.
 */
export function useDynamicFavicon(times: PrayerTimesResponse | undefined): void {
  const now = useTick();
  const lastT = useRef<number>(-1);

  useEffect(() => {
    const t = computeSolarT(now, times);
    // Re-render when the dot has moved at least 0.5 px on the 64-px arc —
    // matches roughly one update per minute for a 14-hour solar window.
    if (Math.abs(t - lastT.current) < 1 / 128) return;
    lastT.current = t;
    applyFavicon(buildFaviconSvg(t));
  }, [now, times]);
}
