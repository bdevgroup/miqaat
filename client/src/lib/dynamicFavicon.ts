import type { PrayerTimesResponse } from '@/types';

/**
 * Kinetic favicon — same Sundial composition as the static `favicon.svg`,
 * but the amber dot's position on the arc tracks the real solar time of
 * day. Same coordinate system as `client/public/favicon.svg`:
 *   viewBox 0 0 64 64, arc P0=(10,44) P1=(32,10) P2=(54,44).
 */

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Today's solar progress as a 0..1 ratio. Uses Fajr→Isha when prayer
 *  times are loaded, otherwise a 06:00→20:00 fallback in local tz. */
export function computeSolarT(now: Date, times: PrayerTimesResponse | undefined): number {
  const nowMs = now.getTime();
  if (times) {
    const fajr = new Date(times.fajr).getTime();
    const isha = new Date(times.isha).getTime();
    return clamp((nowMs - fajr) / Math.max(1, isha - fajr), 0, 1);
  }
  const d = new Date(nowMs);
  const start = new Date(d);
  start.setHours(6, 0, 0, 0);
  const end = new Date(d);
  end.setHours(20, 0, 0, 0);
  return clamp((nowMs - start.getTime()) / (end.getTime() - start.getTime()), 0, 1);
}

export function buildFaviconSvg(t: number): string {
  const u = clamp(t, 0, 1);
  const mu = 1 - u;
  // Quadratic Bezier matching favicon.svg's arc.
  const x = mu * mu * 10 + 2 * mu * u * 32 + u * u * 54;
  const y = mu * mu * 44 + 2 * mu * u * 10 + u * u * 44;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="miqāt">
<rect width="64" height="64" rx="12" fill="#0e0d0b"/>
<path d="M 10 44 Q 32 10 54 44" fill="none" stroke="#f5f0e6" stroke-width="1.5" opacity="0.35"/>
<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="5.5" fill="#d4a86a"/>
<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="10" fill="none" stroke="#d4a86a" stroke-width="1" opacity="0.45"/>
</svg>`;
}

export function applyFavicon(svg: string): void {
  if (typeof document === 'undefined') return;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  link.href = url;
}
