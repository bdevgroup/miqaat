import type { UseQueryResult } from '@tanstack/react-query';
import type { AppSettings, PrayerTimesResponse, SavedLocation } from '@/types';
import type { NextPrayer } from '@/hooks/useNextPrayer';

export interface LayoutProps {
  settings: AppSettings;
  location: SavedLocation | null | undefined;
  prayerTimesQ: UseQueryResult<PrayerTimesResponse, unknown>;
  next: NextPrayer;
  motifEnabled: boolean;
  tz?: string;
}
