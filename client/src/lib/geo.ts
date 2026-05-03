import { api } from './api';

export interface ApproxLocation {
  lat: number;
  lng: number;
  /** 'gps' = browser geolocation API; 'ip' = server-side IP geolocation. */
  source: 'gps' | 'ip';
  city?: string;
  country?: string;
  timezone?: string;
}

/**
 * Try the browser's geolocation API first; on failure (or in Electron, where
 * it always fails without a Google API key), fall back to a server-side IP
 * lookup. The IP lookup is city-level accurate, which is plenty for prayer
 * times.
 */
export async function requestApproximateLocation(): Promise<ApproxLocation> {
  try {
    const pos = await getCurrentPositionAsync({
      enableHighAccuracy: false,
      timeout: 6000,
      maximumAge: 60_000,
    });
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      source: 'gps',
    };
  } catch {
    const { data } = await api.get<{
      lat: number; lng: number; city: string; country: string; timezone: string | null;
    }>('/locations/ip-lookup');
    return {
      lat: data.lat,
      lng: data.lng,
      source: 'ip',
      city: data.city || undefined,
      country: data.country || undefined,
      timezone: data.timezone || undefined,
    };
  }
}

function getCurrentPositionAsync(opts: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('navigator.geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, opts);
  });
}
