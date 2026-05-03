import { Card } from '@/components/ui/card';
import { Countdown } from '@/components/prayer/Countdown';
import { Skeleton } from '@/components/ui/skeleton';
import { PRAYER_ORDER } from '@/types';
import { formatTime } from '@/lib/time';
import { useTick } from '@/contexts/TickContext';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n/useI18n';
import type { LayoutProps } from './types';

/**
 * Layout C · Sun Arc Timeline — one SVG arc sweeping from Fajr → Isha,
 * with prayer dots placed along it and a moving "now" marker.
 */
export function LayoutSunArc({
  settings, location, prayerTimesQ, next, tz,
}: LayoutProps) {
  const now = useTick();
  const { t } = useI18n();
  return (
    <main className="flex-1 overflow-auto p-5">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        {!location && (
          <Card className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {t('loc.choose')}
          </Card>
        )}

        {location && prayerTimesQ.isLoading && (
          <Card className="p-6">
            <div className="relative h-64 w-full">
              <svg
                viewBox="0 0 900 400"
                className="h-full w-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  d="M 50 360 Q 450 40 850 360"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.15"
                  strokeWidth="1.5"
                  className="text-foreground animate-pulse"
                />
              </svg>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </Card>
        )}

        {prayerTimesQ.data && (
          <>
            <Card className="p-6">
              <SunArc
                times={prayerTimesQ.data}
                now={now}
                timeFormat={settings.time_format}
                tz={tz}
                nextName={next.name}
                t={t}
              />
              <div className="mt-4 flex items-center justify-center gap-3 text-center">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {t('ui.next')}
                </div>
                <div className="font-display text-3xl">
                  {next.name ? t(`prayer.${next.name}`) : '—'}
                </div>
                <div className="font-mono text-2xl tabular-nums text-primary">
                  <Countdown toIso={next.iso} />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}

function SunArc({
  times, now, timeFormat, tz, nextName, t,
}: {
  times: {
    fajr: string; sunrise: string; dhuhr: string;
    asr: string; maghrib: string; isha: string;
  };
  now: Date;
  timeFormat: '12h' | '24h';
  tz?: string;
  nextName: string | null;
  t: (k: string) => string;
}) {
  const startMs = new Date(times.fajr).getTime();
  const endMs = new Date(times.isha).getTime();
  const span = Math.max(1, endMs - startMs);

  // Arc from (50,360) to (850,360), peak at (450,40)
  const W = 900;
  const H = 400;
  const pathD = `M 50 360 Q 450 40 850 360`;

  const pointAt = (t: number) => {
    const clamped = Math.max(0, Math.min(1, (t - startMs) / span));
    // Parametric quadratic Bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
    const u = clamped;
    const mu = 1 - u;
    const x = mu * mu * 50 + 2 * mu * u * 450 + u * u * 850;
    const y = mu * mu * 360 + 2 * mu * u * 40 + u * u * 360;
    return { x, y, t: clamped };
  };

  const marks = PRAYER_ORDER.map((name) => {
    const iso = (times as Record<string, string>)[name];
    const ms = new Date(iso).getTime();
    return { name, iso, ms, ...pointAt(ms), isNext: nextName === name };
  });

  const nowPt = pointAt(Math.min(now.getTime(), endMs));

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="sunArcGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <path
          d={`${pathD} L 850 360 L 50 360 Z`}
          fill="url(#sunArcGrad)"
          className="text-primary"
        />
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          className="text-foreground"
        />
        {/* Baseline */}
        <line x1="40" y1="360" x2="860" y2="360" stroke="currentColor" strokeOpacity="0.15" />

        {/* Prayer dots */}
        {marks.map((m) => (
          <g key={m.name}>
            <circle
              cx={m.x}
              cy={m.y}
              r={m.isNext ? 8 : 5}
              fill="currentColor"
              className={m.isNext ? 'text-primary' : 'text-foreground'}
              fillOpacity={m.isNext ? 1 : 0.8}
            />
            <text
              x={m.x}
              y={m.y - (m.isNext ? 18 : 14)}
              textAnchor="middle"
              fontSize="14"
              fontWeight={m.isNext ? 600 : 400}
              fill="currentColor"
              className={cn('capitalize', m.isNext ? 'text-primary' : 'text-muted-foreground')}
            >
              {t(`prayer.${m.name}`)}
            </text>
            <text
              x={m.x}
              y={380}
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
              className="font-mono text-muted-foreground"
            >
              {formatTime(m.iso, timeFormat, tz)}
            </text>
          </g>
        ))}

        {/* Now marker */}
        <g transform={`translate(${nowPt.x} ${nowPt.y})`}>
          <circle r="12" fill="currentColor" fillOpacity="0.15" className="text-primary" />
          <circle r="6" fill="currentColor" className="text-primary" />
          <text y={-18} textAnchor="middle" fontSize="11" fill="currentColor"
            className="font-mono text-primary">
            now
          </text>
        </g>
      </svg>
    </div>
  );
}
