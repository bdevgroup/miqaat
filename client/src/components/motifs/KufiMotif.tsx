import { cn } from '@/lib/cn';

/**
 * Friday-only motif — replaces the 8-pointed StarMotif on Jumu'ah. An
 * 8-petal kufic-inspired flower made of overlapping squares + a centred
 * disk, low-opacity, used as a watermark behind the JumuahHero.
 */
export function KufiMotif({
  size = 240,
  className,
  strokeWidth = 0.6,
}: {
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn('pointer-events-none', className)}
      aria-hidden
    >
      {/* Two overlapping squares rotated 45° apart → 8-pointed star outline */}
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
        <rect x="20" y="20" width="60" height="60" />
        <rect
          x="20" y="20" width="60" height="60"
          transform="rotate(45 50 50)"
        />
        {/* Inner ring + outer ring */}
        <circle cx="50" cy="50" r="42" />
        <circle cx="50" cy="50" r="22" />
        {/* Eight short radial spokes between the rings */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x1 = 50 + Math.sin(angle) * 22;
          const y1 = 50 - Math.cos(angle) * 22;
          const x2 = 50 + Math.sin(angle) * 42;
          const y2 = 50 - Math.cos(angle) * 42;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
        {/* Centre dot */}
        <circle cx="50" cy="50" r="2.5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
