import { DateTime } from 'luxon';

/**
 * Detect when the system clock and the location's clock disagree in a way
 * the user would feel (and that risks missed prayer notifications).
 *
 * Two flavours of disagreement we care about:
 *
 *   1. Timezone mismatch — system tz != location tz. Common when the user
 *      travels and forgets to update their laptop, or sets a custom
 *      location far from where they physically are. The wall clock and the
 *      OS tray clock will show different hours; users may interpret one as
 *      "wrong" and miss the prayer.
 *
 *   2. Offset mismatch — system tz claims `Africa/Casablanca` but the
 *      actual UTC offset Windows is reporting differs from what luxon
 *      computes for that tz right now. This catches stale Windows tzdata
 *      (Morocco's 2018+ DST rules are notoriously broken on un-patched
 *      machines). The user sees their tray clock "wrong" by an hour even
 *      though the IANA tz name is correct.
 *
 * Both cases produce the same user-facing risk: the app is right, the OS
 * looks wrong (or vice versa), and the user can't tell. We surface a
 * dismissible banner so they can investigate.
 */
export interface ClockMismatch {
  kind: 'tz-name' | 'tz-offset';
  /** Human-readable system zone name (IANA, e.g. "Africa/Casablanca"). */
  systemTz: string;
  /** Human-readable location zone name. */
  locationTz: string;
  /** Current UTC offset Windows is reporting, in minutes. */
  systemOffsetMin: number;
  /** Current UTC offset luxon computes for the location, in minutes. */
  locationOffsetMin: number;
}

/**
 * Returns null when there's no mismatch worth surfacing. Otherwise returns
 * details the banner can format into a message.
 */
export function detectClockMismatch(now: Date, locationTz: string | undefined): ClockMismatch | null {
  const systemTz = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  })();

  // Real wall-clock offset right now (the OS tells us this directly).
  const systemOffsetMin = -now.getTimezoneOffset();

  // What luxon thinks the system tz's offset *should* be — catches stale tzdata.
  const luxonForSystemTz = DateTime.fromJSDate(now).setZone(systemTz).offset;
  if (Math.abs(luxonForSystemTz - systemOffsetMin) >= 15) {
    return {
      kind: 'tz-offset',
      systemTz,
      locationTz: locationTz ?? systemTz,
      systemOffsetMin,
      locationOffsetMin: luxonForSystemTz,
    };
  }

  // No location? Nothing to compare against beyond the offset check above.
  if (!locationTz || locationTz === systemTz) return null;

  const locationOffsetMin = DateTime.fromJSDate(now).setZone(locationTz).offset;
  if (Math.abs(locationOffsetMin - systemOffsetMin) >= 15) {
    return {
      kind: 'tz-name',
      systemTz,
      locationTz,
      systemOffsetMin,
      locationOffsetMin,
    };
  }

  return null;
}

/** Render a UTC offset like +60 → "UTC+1" or -300 → "UTC−5". */
export function formatOffset(min: number): string {
  if (min === 0) return 'UTC';
  const sign = min > 0 ? '+' : '−';
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, '0')}`;
}
