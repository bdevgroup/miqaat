import { Card } from '@/components/ui/card';
import { useTick } from '@/contexts/TickContext';
import { PRAYER_ORDER, type PrayerName, type PrayerTimesResponse } from '@/types';
import { formatTime } from '@/lib/time';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/cn';

/**
 * Sun-arc + 6-prayer strip — the variant-C home composition. The arc is
 * the whole-day timeline (Fajr→Isha), the dot below the arc shows where
 * "now" sits in that window, and the numeric row underneath is the same
 * info the prayer-card grid would show but compressed into one band.
 */
export function PrayerArcStrip({
  times,
  nextName,
  timeFormat,
  tz,
}: {
  times: PrayerTimesResponse;
  nextName: PrayerName | null;
  timeFormat: '12h' | '24h';
  tz?: string;
}) {
  const now = useTick();
  const { t } = useI18n();
  const startMs = new Date(times.fajr).getTime();
  const endMs = new Date(times.isha).getTime();
  const span = Math.max(1, endMs - startMs);

  // Arc on a 1000×260 viewBox — wide and shallow so it reads as horizon, not dome.
  const W = 1000;
  const H = 260;
  const path = `M 40 220 Q 500 -40 960 220`;

  const pointAt = (ms: number) => {
    const u = Math.max(0, Math.min(1, (ms - startMs) / span));
    const mu = 1 - u;
    const x = mu * mu * 40 + 2 * mu * u * 500 + u * u * 960;
    const y = mu * mu * 220 + 2 * mu * u * -40 + u * u * 220;
    return { x, y, u };
  };

  const marks = PRAYER_ORDER.map((name) => {
    const iso = times[name];
    return { name, iso, ms: new Date(iso).getTime(), ...pointAt(new Date(iso).getTime()) };
  });

  const nowPt = pointAt(Math.min(now.getTime(), endMs));
  const nowPast = now.getTime() < startMs ? false : true;

  return (
    <Card data-testid="prayer-grid" className="overflow-hidden p-5">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="arcFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Sun-shadowed area */}
        <path
          d={`${path} L 960 220 L 40 220 Z`}
          fill="url(#arcFill)"
          className="text-primary"
        />

        {/* The arc itself */}
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="1.4"
          className="text-foreground"
        />

        {/* Baseline */}
        <line
          x1="32" y1="220" x2="968" y2="220"
          stroke="currentColor" strokeOpacity="0.18"
          strokeDasharray="2 4"
          className="text-foreground"
        />

        {/* Prayer marks */}
        {marks.map((m) => {
          const isNext = m.name === nextName;
          const isPast = m.ms < now.getTime();
          return (
            <g key={m.name} data-prayer={m.name}>
              {/* drop-line to baseline */}
              <line
                x1={m.x} y1={m.y} x2={m.x} y2={220}
                stroke="currentColor" strokeOpacity={isNext ? 0.55 : 0.18}
                strokeWidth={isNext ? 1.5 : 1}
                className={isNext ? 'text-primary' : 'text-foreground'}
              />
              <circle
                cx={m.x} cy={m.y}
                r={isNext ? 9 : 6}
                fill="currentColor"
                fillOpacity={isPast && !isNext ? 0.35 : 1}
                className={isNext ? 'text-primary' : 'text-foreground'}
              />
              {isNext && (
                <circle
                  cx={m.x} cy={m.y}
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.45"
                  className="text-primary"
                />
              )}
              <text
                x={m.x} y={m.y - (isNext ? 22 : 16)}
                textAnchor="middle"
                fontSize="14"
                fontWeight={isNext ? 600 : 400}
                fill="currentColor"
                fillOpacity={isPast && !isNext ? 0.55 : 1}
                className={cn(isNext ? 'text-primary' : 'text-muted-foreground')}
              >
                {t(`prayer.${m.name}`)}
              </text>
              <text
                x={m.x} y={244}
                textAnchor="middle"
                fontSize="13"
                fill="currentColor"
                fillOpacity={isPast && !isNext ? 0.55 : 0.85}
                className="font-mono text-foreground"
              >
                {formatTime(m.iso, timeFormat, tz)}
              </text>
            </g>
          );
        })}

        {/* "Now" marker */}
        {nowPast && (
          <g transform={`translate(${nowPt.x} ${nowPt.y})`}>
            <circle r="16" fill="currentColor" fillOpacity="0.12" className="text-primary" />
            <circle r="6" fill="currentColor" className="text-primary">
              <animate attributeName="r" values="6;7.5;6" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <text y="-22" textAnchor="middle" fontSize="11"
              fill="currentColor" className="font-mono uppercase tracking-[0.18em] text-primary">
              now
            </text>
          </g>
        )}
      </svg>
    </Card>
  );
}
