import { useMemo } from 'react';
import type { PrayerName, PrayerTimesResponse } from '@/types';
import { PRAYER_ORDER } from '@/types';
import { useTick } from '@/contexts/TickContext';

export interface NextPrayer {
  name: PrayerName | null;
  iso: string | null;
  currentName: PrayerName | null;
}

export function useNextPrayer(times: PrayerTimesResponse | undefined): NextPrayer {
  const now = useTick();
  return useMemo(() => {
    if (!times) return { name: null, iso: null, currentName: null };
    const entries = PRAYER_ORDER.map((p) => ({
      name: p,
      date: new Date(times[p]),
    }));

    let currentName: PrayerName | null = null;
    let nextName: PrayerName | null = null;
    let nextIso: string | null = null;

    for (let i = 0; i < entries.length; i++) {
      if (entries[i].date.getTime() > now.getTime()) {
        nextName = entries[i].name;
        nextIso = entries[i].date.toISOString();
        currentName = i > 0 ? entries[i - 1].name : null;
        break;
      }
    }

    if (!nextName) {
      // All prayers passed — next is tomorrow's fajr
      const tomorrow = new Date(times.fajr);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      nextName = 'fajr';
      nextIso = tomorrow.toISOString();
      currentName = 'isha';
    }

    return { name: nextName, iso: nextIso, currentName };
  }, [times, now]);
}
