import { Card } from '@/components/ui/card';
import { Countdown } from './Countdown';
import { StarMotif } from '@/components/motifs/StarMotif';
import type { NextPrayer } from '@/hooks/useNextPrayer';
import { formatTime } from '@/lib/time';
import { useI18n } from '@/i18n/useI18n';
import { useTick } from '@/contexts/TickContext';
import { solarPhase } from '@/lib/solarPhase';
import { cn } from '@/lib/cn';
import type { AppSettings, PrayerTimesResponse } from '@/types';

export function NextPrayerBanner({
  next,
  settings,
  motifEnabled,
  prayerTimes,
}: {
  next: NextPrayer;
  settings: AppSettings;
  motifEnabled: boolean;
  /** Optional — required only for the time-aware ambient hero. */
  prayerTimes?: PrayerTimesResponse;
}) {
  const { t } = useI18n();
  const now = useTick();
  const tz = settings.timezone || undefined;
  const ambient = settings.hero_ambient === 'true';
  const phase = ambient ? solarPhase(now, prayerTimes) : null;

  return (
    <Card
      className={cn(
        'relative overflow-hidden p-8 transition-colors duration-1000',
      )}
      style={
        phase
          ? {
              // `color` here forces the banner's text to phase.text regardless
              // of the active theme (otherwise dark theme + cream morning bg
              // = white-on-cream and unreadable). All children inherit it;
              // muted labels just lower opacity, keeping legibility.
              color: phase.text,
              backgroundImage: `radial-gradient(circle at 78% 30%, ${phase.inner} 0%, ${phase.outer} 75%)`,
            }
          : undefined
      }
      data-phase={phase?.id ?? 'static'}
    >
      {/* Static motif (off when ambient — the sundial mark takes over) */}
      {motifEnabled && !ambient && (
        <StarMotif
          size={260}
          className="absolute -right-12 -top-12 text-foreground/6"
        />
      )}

      {/* Ambient sundial watermark — replaces the star when hero_ambient is on.
          The arc + baseline follow the phase's text colour so they read on
          both light and dark gradients; the dot itself shifts hue across
          the day (silver moon → pink-orange → yellow → red-orange → amber). */}
      {phase && (
        <AmbientSundial
          t={phase.t}
          stroke={phase.text}
          sun={phase.sun}
          className="absolute -right-8 top-0 h-full w-auto opacity-25"
        />
      )}

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <span
            className={cn(
              'text-sm uppercase tracking-[0.18em]',
              phase ? 'opacity-80' : 'text-muted-foreground',
            )}
          >
            {t('ui.next')}
          </span>
          {next.name && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                phase
                  ? 'bg-current/15 text-current backdrop-blur-sm'
                  : 'bg-primary/10 text-primary',
              )}
            >
              {t(`prayer.${next.name}`)}
            </span>
          )}
          {phase && (
            <span className="ml-auto text-[10px] uppercase tracking-[0.2em] opacity-65">
              {t(`phase.${phase.id}`)}
            </span>
          )}
        </div>
        {/* Single-baseline phrase: "in 2h 02m 17s    at 17:10". Labels are
            small inline prefixes — no more column-stacked layout where
            Caveat's script descenders staggered against Mono's flat
            baseline. Both fonts now share the same text baseline via
            `items-baseline`, which is what the eye actually reads as
            "aligned". The two phrase groups are nested so the inner gap
            (label↔value, tight) differs from the outer gap (between IN
            and AT phrases, generous). */}
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'text-xs uppercase tracking-[0.22em]',
                phase ? 'opacity-65' : 'text-muted-foreground',
              )}
            >
              {t('ui.in')}
            </span>
            <div className="font-display text-6xl leading-none md:text-7xl">
              <Countdown toIso={next.iso} />
            </div>
          </div>
          {next.iso && (
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-xs uppercase tracking-[0.22em]',
                  phase ? 'opacity-65' : 'text-muted-foreground',
                )}
              >
                {t('ui.at')}
              </span>
              <div className="font-mono text-4xl font-medium tabular-nums md:text-5xl">
                {formatTime(next.iso, settings.time_format, tz)}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function AmbientSundial({
  t,
  stroke,
  sun,
  className,
}: {
  t: number;
  stroke: string;
  /** Phase-aware sun colour. Falls back to brand amber for safety. */
  sun?: string;
  className?: string;
}) {
  // Same geometry as the favicon arc, scaled for hero use.
  const u = Math.min(1, Math.max(0, t));
  const mu = 1 - u;
  const x = mu * mu * 10 + 2 * mu * u * 50 + u * u * 90;
  const y = mu * mu * 50 + 2 * mu * u * -5 + u * u * 50;
  const dot = sun ?? '#d4a86a';

  // 8 rays at 45° intervals, starting from 12 o'clock. Length ≈ 3 SVG units
  // — translates to roughly 4 px once the SVG is rendered at hero scale.
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = ((i * 45 - 90) * Math.PI) / 180;
    const rIn = 5.2;
    const rOut = 8.2;
    return {
      x1: x + Math.cos(a) * rIn,
      y1: y + Math.sin(a) * rIn,
      x2: x + Math.cos(a) * rOut,
      y2: y + Math.sin(a) * rOut,
    };
  });

  return (
    <svg
      viewBox="0 0 100 60"
      preserveAspectRatio="xMaxYMid meet"
      className={className}
      aria-hidden="true"
    >
      <path d="M 10 50 Q 50 -5 90 50" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.55" />
      <line x1="6" y1="50" x2="94" y2="50" stroke={stroke} strokeWidth="0.4" strokeDasharray="1.2 2.5" opacity="0.4" />

      {/* Pulsing halo — expands outward and fades, like animate-ping but in
          SVG units so it tracks the sun's position. SMIL is fine in
          Electron's Chromium and avoids the CSS `r` animation gotcha. */}
      <circle cx={x} cy={y} r="4" fill="none" stroke={dot} strokeWidth="0.5">
        <animate attributeName="r" values="4;9;9" keyTimes="0;0.7;1" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0" keyTimes="0;0.7;1" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* Sun rays — gentle opacity pulse, in step with the halo. */}
      <g>
        {rays.map((r, i) => (
          <line
            key={i}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke={dot}
            strokeWidth="0.55"
            strokeLinecap="round"
            opacity="0.85"
          >
            <animate
              attributeName="opacity"
              values="0.85;0.4;0.85"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </line>
        ))}
      </g>

      {/* Static halo + sun core */}
      <circle cx={x} cy={y} r="7" fill="none" stroke={dot} strokeWidth="0.6" opacity="0.5" />
      <circle cx={x} cy={y} r="3.5" fill={dot}>
        <animate
          attributeName="r"
          values="3.5;3.9;3.5"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
