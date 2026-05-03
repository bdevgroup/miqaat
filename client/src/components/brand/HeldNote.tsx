import { useEffect, useRef, useState } from 'react';
import { useAudio } from '@/stores/audio';
import { cn } from '@/lib/cn';

/**
 * Waveform mark — "The Held Note".
 *
 * When paused, renders the static decay-into-stillness shape. When audio is
 * playing, the mid-points wobble with a pseudo-waveform driven by rAF; the
 * tail always trails off to a flat line (the "stillness" after Allāhu Akbar).
 */
export function HeldNote({
  size = 28,
  className,
  animated = true,
  color = 'currentColor',
}: {
  size?: number;
  className?: string;
  animated?: boolean;
  color?: string;
}) {
  const playing = useAudio((s) => s.playing);
  const [amps, setAmps] = useState<number[]>(STATIC_AMPS);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing || !animated) {
      setAmps(STATIC_AMPS);
      return;
    }
    let t = 0;
    const tick = () => {
      t += 0.08;
      const next = STATIC_AMPS.map((a, i) => {
        // Leave the flat tail untouched so the decay shape is preserved.
        if (i > STATIC_AMPS.length - 4) return a;
        const wobble = Math.sin(t * (1 + i * 0.15) + i) * 8;
        return a + wobble;
      });
      setAmps(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, animated]);

  const points = amps
    .map((a, i) => {
      const x = 10 + i * (160 / (amps.length - 1));
      return `${x} ${80 + a}`;
    })
    .join(' L ');

  return (
    <svg
      viewBox="0 0 180 160"
      width={size * (180 / 80)}
      height={size}
      className={cn('overflow-visible', className)}
      aria-label="held note"
    >
      <path
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Amplitudes modeled on the concept sheet's "The Held Note" — jagged peaks
// that smooth out into a flat line on the right (the alif "decaying into
// stillness"). Values in SVG units, centred at y=80.
const STATIC_AMPS = [
  0, 0, -40, 40, -60, 60, -70, 70, -60, 60,
  -40, 40, -20, 20, -10, 10, -2, 2, 0, 0, 0, 0,
];
