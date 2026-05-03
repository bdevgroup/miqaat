/**
 * Offline unit test for the Qibla bearing calculation.
 *
 * Fixtures are from standard Qibla references (± 0.5° tolerance accounts
 * for minor differences in spherical-vs-ellipsoidal earth models).
 */
import { QiblaController } from '../src/qibla/qibla.controller';

const ctl = new QiblaController();

function get(lat: number, lng: number) {
  return ctl.get(String(lat), String(lng));
}

describe('QiblaController.get', () => {
  it.each([
    { city: 'NYC',        lat:  40.7128, lng:  -74.0060, bearing:  58.48 },
    { city: 'London',     lat:  51.5072, lng:   -0.1276, bearing: 118.99 },
    { city: 'Jakarta',    lat:  -6.2088, lng:  106.8456, bearing: 295.15 },
    { city: 'Casablanca', lat:  33.5731, lng:   -7.5898, bearing:  93.68 },
    { city: 'Tokyo',      lat:  35.6762, lng:  139.6503, bearing: 293.02 },
    { city: 'Sydney',     lat: -33.8688, lng:  151.2093, bearing: 277.50 },
  ])('computes Qibla bearing from $city within 0.5°', ({ lat, lng, bearing }) => {
    const r = get(lat, lng);
    const diff = Math.abs(r.bearing - bearing);
    expect(diff).toBeLessThanOrEqual(0.5);
  });

  it('returns Makkah coordinates unchanged', () => {
    const r = get(40.7128, -74.0060);
    expect(r.makkah.lat).toBeCloseTo(21.4225, 3);
    expect(r.makkah.lng).toBeCloseTo(39.8262, 3);
  });

  it('computes distance to Makkah in kilometres (sanity)', () => {
    // NYC → Makkah is ~10,300 km
    const r = get(40.7128, -74.0060);
    expect(r.distanceKm).toBeGreaterThan(10_000);
    expect(r.distanceKm).toBeLessThan(10_500);
  });

  it('bearing from Makkah itself is 0 km away', () => {
    const r = get(21.4225, 39.8262);
    expect(r.distanceKm).toBeLessThan(1);
  });
});
