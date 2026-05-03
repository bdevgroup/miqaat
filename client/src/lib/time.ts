import { DateTime } from 'luxon';

export function formatTime(iso: string, format: '12h' | '24h', tz?: string): string {
  const dt = DateTime.fromISO(iso, { zone: tz ?? 'local' });
  return format === '12h' ? dt.toFormat('h:mm a') : dt.toFormat('HH:mm');
}

export function todayISO(tz?: string): string {
  return DateTime.now().setZone(tz ?? 'local').toISODate() ?? '';
}

/** Per-locale unit suffixes for the countdown. We tried single-letter
 *  Arabic abbreviations (س/د/ث) but mixing them with LTR digits inside an
 *  LTR-forced span produced visible bidi reordering — the eye couldn't
 *  pair each unit with its digit. Latin h/m/s are internationally
 *  recognized and bidi-safe; we keep the table here so swapping back is
 *  one-line should we revisit. */
export const UNIT_SUFFIX = {
  en: { h: 'h', m: 'm', s: 's' },
  fr: { h: 'h', m: 'm', s: 's' },
  ar: { h: 'h', m: 'm', s: 's' },
} as const;

export function diffHumanHMS(
  fromIso: string,
  now: Date,
  units: { h: string; m: string; s: string } = UNIT_SUFFIX.en,
): string {
  const then = DateTime.fromISO(fromIso);
  const nowDt = DateTime.fromJSDate(now);
  let sec = Math.max(0, Math.floor(then.diff(nowDt, 'seconds').seconds));
  const h = Math.floor(sec / 3600); sec -= h * 3600;
  const m = Math.floor(sec / 60); sec -= m * 60;
  if (h > 0) return `${h}${units.h} ${String(m).padStart(2, '0')}${units.m} ${String(sec).padStart(2, '0')}${units.s}`;
  if (m > 0) return `${m}${units.m} ${String(sec).padStart(2, '0')}${units.s}`;
  return `${sec}${units.s}`;
}

export function systemTimezone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
  catch { return 'UTC'; }
}
