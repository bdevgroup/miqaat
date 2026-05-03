import { cn } from '@/lib/cn';

/**
 * "miqāt" wordmark — the macron over the ā IS the horizon.
 *
 * Renders in Instrument Serif italic. By default both diacritics sit above
 * the letters (transliteration: i + ā). The `i` mark currently sits BELOW
 * the letter as a visual test (per Youssef's request 2026-04-26) — toggle
 * via the `iBarPosition` prop.
 */
export function HorizonAlif({
  size = 28,
  className,
  muted = false,
  iBarPosition = 'bottom',
}: {
  size?: number;
  className?: string;
  /** Use ink/muted monochrome instead of the amber accent on the ā macron. */
  muted?: boolean;
  /** Where the small bar on the `i` sits — `'top'` is the standard
   *  transliteration position; `'bottom'` is the test variant. */
  iBarPosition?: 'top' | 'bottom';
}) {
  // Use font-size as the scale. The wrapper uses em-based layout so a single
  // `fontSize` prop controls everything.
  const barTop = size * 0.07;
  const barThickness = Math.max(2, size * 0.06);

  return (
    <span
      // dir="ltr" on the wordmark prevents the Latin letters from being
      // visually reversed when the page is RTL (Arabic locale). The wordmark
      // is a brand mark, not running text — it must always read left-to-right.
      dir="ltr"
      className={cn(
        'inline-flex items-baseline leading-none',
        'font-display-serif italic',
        className,
      )}
      style={{ fontSize: size, letterSpacing: '-0.02em' }}
      aria-label="miqāt"
    >
      <span>m</span>
      <Letter
        macronColor={muted ? 'currentColor' : 'currentColor'}
        offset={barTop}
        thickness={barThickness}
        inset="10%"
        position={iBarPosition}
      >
        i
      </Letter>
      <span>q</span>
      <Letter
        macronColor={muted ? 'currentColor' : 'var(--brand-amber, hsl(var(--primary)))'}
        offset={barTop}
        thickness={barThickness}
        inset="0%"
        position="top"
      >
        a
      </Letter>
      <span>t</span>
    </span>
  );
}

function Letter({
  children, macronColor, offset, thickness, inset, position,
}: {
  children: React.ReactNode;
  macronColor: string;
  offset: number;
  thickness: number;
  inset: string;
  position: 'top' | 'bottom';
}) {
  // Position the bar above (top: -offset) or below (top: 100% + small gap).
  const barStyle: React.CSSProperties =
    position === 'top'
      ? { top: -offset }
      : { top: `calc(100% + ${offset * 0.4}px)` };

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: inset,
          right: inset,
          height: thickness,
          background: macronColor,
          borderRadius: 1,
          ...barStyle,
        }}
      />
      {children}
    </span>
  );
}
