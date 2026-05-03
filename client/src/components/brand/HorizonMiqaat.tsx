import { cn } from '@/lib/cn';

/**
 * "ميقات" wordmark — the Arabic counterpart to <HorizonAlif />.
 *
 * Brand parallel: where the Latin wordmark places a macron over the `ā`,
 * the Arabic wordmark places the same horizontal "horizon" bar over the
 * `ا` (alif). Both diacritics ARE the horizon — same brand idea, two
 * scripts.
 *
 * IMPORTANT: the word is rendered as a SINGLE text node so Arabic shaping
 * joins the letters into the proper cursive form (مـيـقـاـت → ميقات). An
 * earlier version split each letter into its own <span>, which broke
 * shaping and produced a row of disconnected initial-form glyphs. The
 * macron bar lives in a sibling absolute-positioned <span> sitting over
 * the alif's approximate x-position (eyeballed for Amiri at ~24% from the
 * left edge — the alif is the 4th letter from the right in a 5-letter
 * word with mostly even widths).
 */
export function HorizonMiqaat({
  size = 28,
  className,
  muted = false,
}: {
  size?: number;
  className?: string;
  /** Use ink/muted monochrome instead of the amber accent on the bar. */
  muted?: boolean;
}) {
  const barColor = muted
    ? 'currentColor'
    : 'var(--brand-amber, hsl(var(--primary)))';
  const barHeight = Math.max(2, size * 0.06);
  const barTopGap = size * 0.05;

  return (
    <span
      dir="rtl"
      lang="ar"
      className={cn('relative inline-block leading-none', className)}
      style={{
        fontSize: size,
        fontFamily: 'var(--font-display-arabic)',
        fontWeight: 400,
      }}
      aria-label="ميقات"
    >
      ميقات
      {/* Macron bar — positioned over the alif. Tuned for Amiri; if you
          swap fonts adjust `left` and `width` (in % of the wordmark span). */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '24%',
          width: '14%',
          top: -barTopGap - barHeight,
          height: barHeight,
          background: barColor,
          borderRadius: 1,
        }}
      />
    </span>
  );
}
