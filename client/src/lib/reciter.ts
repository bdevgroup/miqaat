import type { AppSettings, CustomReciter, PrayerName } from '@/types';

const PER_PRAYER_RECITER_KEY: Partial<Record<PrayerName, keyof AppSettings>> = {
  fajr: 'reciter_fajr',
  dhuhr: 'reciter_dhuhr',
  asr: 'reciter_asr',
  maghrib: 'reciter_maghrib',
  isha: 'reciter_isha',
};

/**
 * Custom-reciter id encoding. Stored in settings as `custom:<numericId>`
 * so it sits in the same single string field as built-in reciter ids
 * (`makkah`, `madina`, ...) without needing a parallel column.
 */
const CUSTOM_PREFIX = 'custom:';

export function isCustomReciterId(id: string): boolean {
  return id.startsWith(CUSTOM_PREFIX);
}

export function buildCustomReciterId(rowId: number): string {
  return `${CUSTOM_PREFIX}${rowId}`;
}

export function parseCustomReciterId(id: string): number | null {
  if (!id.startsWith(CUSTOM_PREFIX)) return null;
  const n = Number(id.slice(CUSTOM_PREFIX.length));
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Returns the reciter id to use for a given prayer:
 * the per-prayer override if set, otherwise the global default.
 * Sunrise has no override key — returns the global setting unchanged.
 */
export function resolveReciter(prayer: PrayerName, settings: AppSettings): string {
  const key = PER_PRAYER_RECITER_KEY[prayer];
  if (!key) return settings.reciter;
  const override = (settings[key] as string | undefined)?.trim();
  return override && override.length > 0 ? override : settings.reciter;
}

export interface AthanSource {
  /** Audio URL the global <audio> element should load. */
  url: string;
  /** Reciter id (built-in like `makkah` or custom like `custom:42`). */
  reciterId: string;
  /** Display label (built-in name or custom row's `name`). */
  displayName: string;
}

/**
 * Translate a reciter id into a playable audio URL + display name.
 *
 * - `none` → returns null (caller should skip Athan playback)
 * - `custom:<n>` → looks up the row in `customReciters` and points at the
 *   server's streaming endpoint. Returns null if the row no longer exists
 *   (e.g. user deleted it after the per-prayer override was set).
 * - anything else → built-in reciter at `./audio/athan-<id>.mp3`
 *
 * Centralises the URL construction so callers don't have to know about
 * the custom-reciter encoding or the streaming endpoint shape.
 */
export function resolveAthanSource(
  reciterId: string,
  customReciters: CustomReciter[] | undefined,
  apiUrl: string,
): AthanSource | null {
  if (!reciterId || reciterId === 'none') return null;

  const customRowId = parseCustomReciterId(reciterId);
  if (customRowId !== null) {
    const row = customReciters?.find((r) => r.id === customRowId);
    if (!row) return null; // referenced row got deleted — skip silently
    return {
      url: `${apiUrl}/api/custom-reciters/${row.id}/audio`,
      reciterId,
      displayName: row.name,
    };
  }

  // Built-in reciter (id like 'makkah', 'madina', ...)
  return {
    url: `./audio/athan-${reciterId}.mp3`,
    reciterId,
    displayName: reciterId,
  };
}
