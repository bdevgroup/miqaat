import { useMemo } from 'react';
import { useTick } from '@/contexts/TickContext';
import { useSettings } from '@/hooks/useSettings';
import { useCurrentLocation } from '@/hooks/useLocations';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { cn } from '@/lib/cn';

/**
 * "The Sundial Mark" — a single dot moving along an arc, positioned by
 * current time within today's Fajr→Isha window. Falls back to a 06:00→20:00
 * window when no prayer-times data is available yet.
 *
 * Two modes: default compact (for TopBar/tray-sized) and `showBaseline` for
 * the bigger stage (for splash/feature cards).
 */
export function SundialMark({
  size = 28,
  className,
  showBaseline = false,
  color = 'currentColor',
  accent,
}: {
  size?: number;
  className?: string;
  showBaseline?: boolean;
  color?: string;
  accent?: string;
}) {
  const now = useTick();
  const { data: settings } = useSettings();
  const { data: location } = useCurrentLocation();

  const prayerTimesQ = usePrayerTimes({
    lat: location?.lat,
    lng: location?.lng,
    method: Number(settings?.calc_method ?? 3),
    madhab: Number(settings?.madhab ?? 0),
    customFajrAngle: Number(settings?.custom_fajr_angle ?? 18),
    customIshaAngle: Number(settings?.custom_isha_angle ?? 17),
    customIshaInterval: Number(settings?.custom_isha_interval ?? 0),
    offsetFajr:    Number(settings?.offset_fajr ?? 0),
    offsetSunrise: Number(settings?.offset_sunrise ?? 0),
    offsetDhuhr:   Number(settings?.offset_dhuhr ?? 0),
    offsetAsr:     Number(settings?.offset_asr ?? 0),
    offsetMaghrib: Number(settings?.offset_maghrib ?? 0),
    offsetIsha:    Number(settings?.offset_isha ?? 0),
    offsetGlobal:  Number(settings?.global_offset_min ?? 0),
  });

  const t = useMemo(() => {
    const nowMs = now.getTime();
    const pt = prayerTimesQ.data;
    if (pt) {
      const fajr = new Date(pt.fajr).getTime();
      const isha = new Date(pt.isha).getTime();
      return clamp((nowMs - fajr) / Math.max(1, isha - fajr), 0, 1);
    }
    // Fallback — just use today's 06:00 → 20:00 window in local tz
    const d = new Date(nowMs);
    const start = new Date(d);
    start.setHours(6, 0, 0, 0);
    const end = new Date(d);
    end.setHours(20, 0, 0, 0);
    return clamp(
      (nowMs - start.getTime()) / (end.getTime() - start.getTime()),
      0,
      1,
    );
  }, [now, prayerTimesQ.data]);

  // Parametric quadratic Bezier: (1-t)²P0 + 2(1-t)t P1 + t² P2
  // P0=(10,50) P1=(50,-5) P2=(90,50) — arc floating above the baseline
  const u = t;
  const mu = 1 - u;
  const x = mu * mu * 10 + 2 * mu * u * 50 + u * u * 90;
  const y = mu * mu * 50 + 2 * mu * u * -5 + u * u * 50;

  const dot = accent ?? 'var(--brand-amber, hsl(var(--primary)))';

  return (
    <svg
      viewBox="0 0 100 60"
      width={size * (100 / 60)}
      height={size}
      className={cn('overflow-visible', className)}
      aria-label="sundial mark"
    >
      {showBaseline && (
        <line
          x1="4" y1="50" x2="96" y2="50"
          stroke={color} strokeWidth="0.8"
          strokeDasharray="1.5 3"
          opacity="0.3"
        />
      )}
      <path
        d="M 10 50 Q 50 -5 90 50"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.4"
      />
      <circle cx={x} cy={y} r="4" fill={dot} />
    </svg>
  );
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
