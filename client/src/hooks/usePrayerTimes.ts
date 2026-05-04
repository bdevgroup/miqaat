import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PrayerTimesResponse, HijriDate, QiblaResponse } from '@/types';
import { todayISO } from '@/lib/time';

export interface PrayerOffsetOpts {
  /** Per-prayer minute offsets, ±60 max. Sent as `of`/`os`/`od`/`oa`/`om`/`oi`. */
  offsetFajr?: number;
  offsetSunrise?: number;
  offsetDhuhr?: number;
  offsetAsr?: number;
  offsetMaghrib?: number;
  offsetIsha?: number;
  /** Global shift, ±120 min — added on top of every per-prayer offset.
   *  Sent as `og`. Used for OS-tz mismatches (e.g. Morocco summer time). */
  offsetGlobal?: number;
}

interface CommonPrayerOpts extends PrayerOffsetOpts {
  lat: number | null | undefined;
  lng: number | null | undefined;
  method: number;
  madhab: number;
  /** Only honoured when method === 0 (Custom). */
  customFajrAngle?: number;
  customIshaAngle?: number;
  customIshaInterval?: number;
}

function customParams(opts: CommonPrayerOpts): Record<string, number | undefined> {
  if (opts.method !== 0) return {};
  return {
    fa: opts.customFajrAngle,
    ia: opts.customIshaAngle,
    ii: opts.customIshaInterval,
  };
}

/** Per-prayer + global offsets — only sent when non-zero, to keep cached
 *  server responses identical to the canonical case for users with no
 *  adjustments. */
function offsetParams(opts: PrayerOffsetOpts): Record<string, number | undefined> {
  const out: Record<string, number | undefined> = {};
  if (opts.offsetFajr) out.of = opts.offsetFajr;
  if (opts.offsetSunrise) out.os = opts.offsetSunrise;
  if (opts.offsetDhuhr) out.od = opts.offsetDhuhr;
  if (opts.offsetAsr) out.oa = opts.offsetAsr;
  if (opts.offsetMaghrib) out.om = opts.offsetMaghrib;
  if (opts.offsetIsha) out.oi = opts.offsetIsha;
  if (opts.offsetGlobal) out.og = opts.offsetGlobal;
  return out;
}

export function usePrayerTimes(opts: CommonPrayerOpts & {
  date?: string;
  tz?: string;
}) {
  const date = opts.date ?? todayISO(opts.tz);
  return useQuery({
    queryKey: [
      'prayer-times',
      opts.lat, opts.lng, date, opts.method, opts.madhab,
      opts.customFajrAngle, opts.customIshaAngle, opts.customIshaInterval,
      // Offset values participate in the cache key so changing any offset
      // triggers a refetch (the response is offset-applied server-side).
      opts.offsetFajr, opts.offsetSunrise, opts.offsetDhuhr,
      opts.offsetAsr, opts.offsetMaghrib, opts.offsetIsha,
      opts.offsetGlobal,
    ],
    queryFn: async (): Promise<PrayerTimesResponse> => {
      const { data } = await api.get<PrayerTimesResponse>('/prayer-times', {
        params: {
          lat: opts.lat, lng: opts.lng, date,
          method: opts.method, madhab: opts.madhab,
          ...customParams(opts),
          ...offsetParams(opts),
        },
      });
      return data;
    },
    enabled: opts.lat != null && opts.lng != null,
    staleTime: 60 * 60_000,
    // While the response is still locally-computed, the server is
    // fetching the verified copy from Aladhan in the background. Poll
    // every 15 s so the "Local" badge flips to "Verified" as soon as
    // the cache row is upgraded — without this, the user could sit on
    // the local view for up to an hour (the staleTime). Once source
    // becomes 'aladhan' the polling stops automatically.
    refetchInterval: (query) => {
      const data = query.state.data as PrayerTimesResponse | undefined;
      return data?.source === 'aladhan' ? false : 15_000;
    },
    refetchIntervalInBackground: false,
  });
}

export function useHijri(date?: string) {
  const d = date ?? todayISO();
  return useQuery({
    queryKey: ['hijri', d],
    queryFn: async (): Promise<HijriDate> => {
      const { data } = await api.get<HijriDate>('/hijri', { params: { date: d } });
      return data;
    },
    staleTime: 12 * 60 * 60_000,
  });
}

export function usePrayerTimesRange(opts: CommonPrayerOpts & {
  from: string;
  to: string;
}) {
  return useQuery({
    queryKey: [
      'prayer-times', 'range',
      opts.lat, opts.lng, opts.from, opts.to, opts.method, opts.madhab,
      opts.customFajrAngle, opts.customIshaAngle, opts.customIshaInterval,
      opts.offsetFajr, opts.offsetSunrise, opts.offsetDhuhr,
      opts.offsetAsr, opts.offsetMaghrib, opts.offsetIsha,
      opts.offsetGlobal,
    ],
    queryFn: async (): Promise<PrayerTimesResponse[]> => {
      const { data } = await api.get<PrayerTimesResponse[]>('/prayer-times/range', {
        params: {
          lat: opts.lat, lng: opts.lng,
          from: opts.from, to: opts.to,
          method: opts.method, madhab: opts.madhab,
          ...customParams(opts),
          ...offsetParams(opts),
        },
      });
      return data;
    },
    enabled: opts.lat != null && opts.lng != null && !!opts.from && !!opts.to,
    staleTime: 60 * 60_000,
  });
}

export function useQibla(lat?: number | null, lng?: number | null) {
  return useQuery({
    queryKey: ['qibla', lat, lng],
    queryFn: async (): Promise<QiblaResponse> => {
      const { data } = await api.get<QiblaResponse>('/qibla', {
        params: { lat, lng },
      });
      return data;
    },
    enabled: lat != null && lng != null,
    staleTime: Infinity,
  });
}
