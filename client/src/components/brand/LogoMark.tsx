import { useEffect, useState } from 'react';
import { useAudio } from '@/stores/audio';
import { HorizonAlif } from './HorizonAlif';
import { HorizonMiqaat } from './HorizonMiqaat';
import { HeldNote } from './HeldNote';
import { SundialMark } from './SundialMark';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/cn';

/**
 * Kinetic brand state machine.
 *
 *   default        → HorizonAlif wordmark ("miqāt")
 *   idle rotation  → SundialMark for a few seconds every ~20s, then back
 *   athan playing  → HeldNote waveform (animated while audio plays)
 *
 * `variant="chrome"` is the compact inline form (TopBar, widget, tray). It
 * shows just the mark and no subtitle. `variant="hero"` is for splash and
 * onboarding — bigger, with the "miqāt" wordmark paired to a caption.
 */
export type LogoVariant = 'chrome' | 'hero';

const ROTATE_EVERY_MS = 20_000;
const HOLD_SUNDIAL_MS = 6_000;

export function LogoMark({
  variant = 'chrome',
  size,
  className,
}: {
  variant?: LogoVariant;
  size?: number;
  className?: string;
}) {
  const playing = useAudio((s) => s.playing);
  const { lang } = useI18n();
  const [face, setFace] = useState<'wordmark' | 'sundial'>('wordmark');
  // Wordmark script — pick the Arabic ميقات variant when the active locale
  // is Arabic, otherwise the Latin "miqāt". HeldNote / SundialMark are
  // language-neutral and shared across locales.
  const Wordmark = lang === 'ar' ? HorizonMiqaat : HorizonAlif;

  useEffect(() => {
    if (playing) return;
    let t: number;
    const loop = () => {
      t = window.setTimeout(() => {
        setFace('sundial');
        t = window.setTimeout(() => {
          setFace('wordmark');
          loop();
        }, HOLD_SUNDIAL_MS);
      }, ROTATE_EVERY_MS);
    };
    loop();
    return () => window.clearTimeout(t);
  }, [playing]);

  const chromeSize = size ?? (variant === 'hero' ? 96 : 28);

  if (playing) {
    return (
      <span
        data-brand-state="heldnote"
        className={cn('inline-flex items-center', className)}
        aria-label="miqāt · athan playing"
      >
        <HeldNote size={chromeSize} />
      </span>
    );
  }

  if (face === 'sundial') {
    return (
      <span
        data-brand-state="sundial"
        className={cn('inline-flex items-center', className)}
        aria-label="miqāt · sun position"
      >
        <SundialMark size={chromeSize} showBaseline={variant === 'hero'} />
      </span>
    );
  }

  return (
    <span data-brand-state="wordmark" className={cn('inline-flex items-center', className)}>
      <Wordmark size={chromeSize} />
    </span>
  );
}
