import { DateTime } from 'luxon';
import type { AppSettings, PrayerTimesResponse } from '@/types';

/**
 * Friday helpers — Jumu'ah falls on the 6th day of the week (Saturday=7,
 * Sunday=1 in luxon's ISO weekday numbering, so Friday=5).
 *
 * The "ajr ladder" implements the hadith of Abu Hurayra (Bukhari 881,
 * Muslim 850): whoever goes early to Jumu'ah earns ajr graded by which of
 * five "hours" between sunrise and Dhuhr they arrive in:
 *   1st → camel  ·  2nd → cow  ·  3rd → ram  ·  4th → hen  ·  5th → egg
 * Once the imam climbs the minbar (= Dhuhr), the angels close their books
 * and no further ajr is recorded for early arrival.
 *
 * Scholarly note on hour boundaries: we use Sunrise → Dhuhr divided into
 * five equal segments. This is the most common modern interpretation
 * (al-Nawawi, Ibn Hajar). Some scholars mark the start at Fajr; we don't
 * surface that as a setting yet.
 */

export type AjrTier = {
  /** 1..5 (the "first" through "fifth" hour). */
  index: 1 | 2 | 3 | 4 | 5;
  /** Animal symbol — the hadith's grading. */
  symbol: string;
  /** Animal name (for screen readers + tooltip), translated by caller. */
  i18nKey: 'jumuah.ajr.camel' | 'jumuah.ajr.cow' | 'jumuah.ajr.ram' | 'jumuah.ajr.hen' | 'jumuah.ajr.egg';
};

export const AJR_TIERS: AjrTier[] = [
  { index: 1, symbol: '🐪', i18nKey: 'jumuah.ajr.camel' },
  { index: 2, symbol: '🐄', i18nKey: 'jumuah.ajr.cow' },
  { index: 3, symbol: '🐏', i18nKey: 'jumuah.ajr.ram' },
  { index: 4, symbol: '🐔', i18nKey: 'jumuah.ajr.hen' },
  { index: 5, symbol: '🥚', i18nKey: 'jumuah.ajr.egg' },
];

/** True when `now` falls on a Friday in the supplied timezone. */
export function isFriday(now: Date, tz?: string): boolean {
  return DateTime.fromJSDate(now).setZone(tz ?? 'local').weekday === 5;
}

/** True when `now` is on Thursday in the supplied timezone — used to fire
 *  the Surah Al-Kahf reminder on Thursday evening (Friday eve in Islamic
 *  reckoning, since the Islamic day starts at Maghrib). */
export function isThursday(now: Date, tz?: string): boolean {
  return DateTime.fromJSDate(now).setZone(tz ?? 'local').weekday === 4;
}

/**
 * Single source of truth for "should the Friday surface render right now?"
 * Combines:
 *   - Master switch `jumuah_enhancements`
 *   - Real day-of-week check (`isFriday`)
 *   - Preview override `jumuah_preview` for QA without changing the system clock
 *
 * Used by App.tsx (ribbon), LayoutSplit/SplitArc (hero + adhkar), and
 * PrayerGrid (Dhuhr → Jumu'ah relabel) so the gating logic stays one place.
 */
export function isJumuahActive(
  now: Date,
  settings: Pick<AppSettings, 'jumuah_enhancements' | 'jumuah_preview'>,
  tz?: string,
): boolean {
  if (settings.jumuah_enhancements !== 'true') return false;
  if (settings.jumuah_preview === 'true') return true;
  return isFriday(now, tz);
}

export interface AjrWindow {
  /** Tier 1..5, or null when outside the early-arrival window. */
  tier: AjrTier | null;
  /** Which of the 5 segments `now` sits in (0..4), or -1 when outside. */
  segment: number;
  /** Sunrise / Dhuhr boundaries in ms — the meter's start and end. */
  startMs: number;
  endMs: number;
  /** State machine: 'pending' before sunrise, 'active' during the ajr
   *  window, 'khutbah' once Dhuhr has passed (but before Maghrib), 'done'
   *  after Maghrib. */
  state: 'pending' | 'active' | 'khutbah' | 'done';
  /** Per-segment boundaries (ms timestamps) — 6 values delimiting 5 segments. */
  segmentBoundaries: number[];
}

/** Compute the user's current position on the ajr ladder. Pure function
 *  so it's testable; the React side wraps it with a 1 Hz tick re-eval. */
export function ajrWindow(now: Date, times: PrayerTimesResponse | undefined): AjrWindow | null {
  if (!times) return null;
  const startMs = new Date(times.sunrise).getTime();
  const endMs = new Date(times.dhuhr).getTime();
  const maghribMs = new Date(times.maghrib).getTime();
  const nowMs = now.getTime();

  const span = Math.max(1, endMs - startMs);
  const segmentMs = span / 5;
  const segmentBoundaries = [
    startMs,
    startMs + segmentMs,
    startMs + segmentMs * 2,
    startMs + segmentMs * 3,
    startMs + segmentMs * 4,
    endMs,
  ];

  if (nowMs < startMs) {
    return { tier: null, segment: -1, startMs, endMs, state: 'pending', segmentBoundaries };
  }
  if (nowMs >= endMs) {
    return {
      tier: null,
      segment: -1,
      startMs,
      endMs,
      state: nowMs >= maghribMs ? 'done' : 'khutbah',
      segmentBoundaries,
    };
  }

  // We're inside the early-arrival window — pick the segment.
  const segment = Math.min(4, Math.floor((nowMs - startMs) / segmentMs));
  return {
    tier: AJR_TIERS[segment],
    segment,
    startMs,
    endMs,
    state: 'active',
    segmentBoundaries,
  };
}

/** True when `now` is in the last hour before Maghrib on a Friday — the
 *  widely-cited "hour of acceptance" interpretation (one of several in the
 *  classical literature, but the strongest per Ibn al-Qayyim's Zad al-Ma'ad). */
export function inHourOfAcceptance(now: Date, times: PrayerTimesResponse | undefined, tz?: string): boolean {
  if (!times || !isFriday(now, tz)) return false;
  const maghribMs = new Date(times.maghrib).getTime();
  const oneHourBefore = maghribMs - 60 * 60 * 1000;
  const nowMs = now.getTime();
  return nowMs >= oneHourBefore && nowMs < maghribMs;
}

/* -------------------------------------------------------------------------- */
/* Salawat counter — daily-resetting localStorage key. */

function salawatKey(now: Date, tz?: string): string {
  const date = DateTime.fromJSDate(now).setZone(tz ?? 'local').toISODate() ?? '';
  return `miqaat:salawat:${date}`;
}

export function readSalawat(now: Date, tz?: string): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(salawatKey(now, tz));
  return raw ? Number(raw) || 0 : 0;
}

export function writeSalawat(now: Date, count: number, tz?: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(salawatKey(now, tz), String(Math.max(0, count)));
}
