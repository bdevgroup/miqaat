import type { PrayerTimesResponse } from '@/types';

/**
 * Solar phase → CSS gradient stops. Used by the time-aware ambient hero
 * (NextPrayerBanner when `hero_ambient` is on). Returns two HSL colour
 * stops + a tagline that names the phase. The hero applies them as a
 * subtle radial gradient on top of the card background, so the colours
 * are kept low-saturation — they should *tint* the surface, not paint it.
 */

export type SolarPhaseId =
  | 'night'
  | 'predawn'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'dusk'
  | 'evening';

export interface SolarPhase {
  id: SolarPhaseId;
  /** Two colours used by the radial gradient — outer & inner. */
  outer: string;
  inner: string;
  /** Foreground colour to apply on the banner — chosen for legibility on
   *  this phase's gradient regardless of the active theme (dark theme
   *  flipping to a cream-bg morning phase would otherwise be unreadable). */
  text: string;
  /** Sundial dot + ray colour for this phase. Follows a warm-sun palette
   *  (pink-orange at predawn → orange at sunrise → yellow at midday →
   *  amber-orange in afternoon → deep red-orange at dusk → muted amber at
   *  night). Picked for visibility against `inner`/`outer` gradients. */
  sun: string;
  /** Dot position along the sundial arc, 0..1 (Fajr=0, Isha=1). */
  t: number;
}

// Brand-aligned legibility palette used by every phase: cream-on-dark or
// warm-black-on-light. Same hues as the Miqāt theme tokens so the banner
// always reads as Miqāt regardless of which theme the rest of the app is in.
const TEXT_LIGHT = 'hsl(40 33% 94%)';   // cream — for dark phases
const TEXT_DARK  = 'hsl(40 14% 10%)';   // warm-black — for light phases

/**
 * Map the current moment to a solar phase + gradient stops. We bias the
 * `t` value so that:
 *  - before Fajr → t = 0 (dot rests at start of arc)
 *  - after Isha  → t = 1 (dot rests at end)
 *  - during day  → linear progress between Fajr and Isha
 */
export function solarPhase(
  now: Date,
  times: PrayerTimesResponse | undefined,
): SolarPhase {
  if (!times) {
    // Fallback when prayer-times aren't loaded yet.
    return { id: 'midday', outer: 'hsl(40 18% 96%)', inner: 'hsl(35 35% 88%)', text: TEXT_DARK, sun: 'hsl(48 95% 55%)', t: 0.5 };
  }
  const nowMs = now.getTime();
  const fajr = new Date(times.fajr).getTime();
  const sunrise = new Date(times.sunrise).getTime();
  const dhuhr = new Date(times.dhuhr).getTime();
  const asr = new Date(times.asr).getTime();
  const maghrib = new Date(times.maghrib).getTime();
  const isha = new Date(times.isha).getTime();

  const t = clamp((nowMs - fajr) / Math.max(1, isha - fajr), 0, 1);

  if (nowMs < fajr) {
    // Cool moon-silver — sundial reads as a "moon at rest" before Fajr.
    return { id: 'night', outer: 'hsl(220 25% 12%)', inner: 'hsl(225 35% 22%)', text: TEXT_LIGHT, sun: 'hsl(40 25% 78%)', t: 0 };
  }
  if (nowMs < sunrise) {
    // Predawn pink-orange — first warmth on the horizon.
    return { id: 'predawn', outer: 'hsl(245 30% 28%)', inner: 'hsl(20 55% 70%)', text: TEXT_LIGHT, sun: 'hsl(15 80% 62%)', t };
  }
  if (nowMs < dhuhr) {
    // Sunrise → mid-morning: vivid orange.
    return { id: 'morning', outer: 'hsl(35 60% 88%)', inner: 'hsl(45 75% 78%)', text: TEXT_DARK, sun: 'hsl(28 92% 55%)', t };
  }
  if (nowMs < asr) {
    // Dhuhr / midday: full bright yellow.
    return { id: 'midday', outer: 'hsl(42 50% 92%)', inner: 'hsl(38 70% 82%)', text: TEXT_DARK, sun: 'hsl(48 95% 56%)', t };
  }
  if (nowMs < maghrib) {
    // Afternoon: golden warming back toward orange.
    return { id: 'afternoon', outer: 'hsl(30 60% 78%)', inner: 'hsl(20 75% 68%)', text: TEXT_DARK, sun: 'hsl(35 88% 55%)', t };
  }
  if (nowMs < isha) {
    // Dusk: deep red-orange (sunset).
    return { id: 'dusk', outer: 'hsl(15 65% 45%)', inner: 'hsl(280 40% 35%)', text: TEXT_LIGHT, sun: 'hsl(12 80% 52%)', t };
  }
  // After Isha — back to muted brand amber.
  return { id: 'evening', outer: 'hsl(225 30% 18%)', inner: 'hsl(245 35% 28%)', text: TEXT_LIGHT, sun: 'hsl(35 55% 58%)', t: 1 };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
