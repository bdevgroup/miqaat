import type { SavedLocation } from '@/types';

/**
 * Detect the GPS-saved sentinel ("Current location") so the UI can swap
 * in a translated label without needing a DB migration. Both `LocationPicker`
 * and `Onboarding` write this exact string into `name` + `city` when the
 * user grants geolocation.
 */
export const GPS_SENTINEL = 'Current location';

export function isGpsLocation(loc: Pick<SavedLocation, 'city'>): boolean {
  return loc.city === GPS_SENTINEL;
}

/**
 * Resolve the city label for display. When the saved location is the
 * GPS sentinel, hand back the translation key value the caller passes;
 * otherwise return the stored city as-is.
 */
export function displayCity(
  loc: Pick<SavedLocation, 'city'>,
  translatedGpsLabel: string,
): string {
  return isGpsLocation(loc) ? translatedGpsLabel : loc.city;
}
