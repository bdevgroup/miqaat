import { cn } from '@/lib/cn';

export function StarMotif({
  className,
  strokeWidth = 0.8,
  size = 160,
}: {
  className?: string;
  strokeWidth?: number;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn('pointer-events-none', className)}
    >
      <g stroke="currentColor" strokeWidth={strokeWidth} fill="none">
        <polygon points="20,4 23,17 36,20 23,23 20,36 17,23 4,20 17,17" />
        <polygon
          points="20,8 28,12 32,20 28,28 20,32 12,28 8,20 12,12"
          transform="rotate(22.5 20 20)"
        />
        <circle cx="20" cy="20" r="14" />
      </g>
    </svg>
  );
}
