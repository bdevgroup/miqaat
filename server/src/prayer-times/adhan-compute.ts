import * as adhan from 'adhan';

export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

/**
 * Aladhan method IDs → adhan-js CalculationMethod factory + optional overrides.
 * Methods not in adhan-js fall back to CalculationMethod.Other() with custom angles.
 * Reference: https://aladhan.com/calculation-methods
 */
function paramsForAladhanMethod(methodId: number): adhan.CalculationParameters {
  switch (methodId) {
    case 0: return adhan.CalculationMethod.Other();
    case 1: return adhan.CalculationMethod.Karachi();
    case 2: return adhan.CalculationMethod.NorthAmerica();
    case 3: return adhan.CalculationMethod.MuslimWorldLeague();
    case 4: return adhan.CalculationMethod.UmmAlQura();
    case 5: return adhan.CalculationMethod.Egyptian();
    case 7: {
      const p = adhan.CalculationMethod.Other();
      p.fajrAngle = 16; p.ishaAngle = 14; p.maghribAngle = 4;
      return p;
    }
    case 8: return adhan.CalculationMethod.Dubai();
    case 9: return adhan.CalculationMethod.Kuwait();
    case 10: return adhan.CalculationMethod.Qatar();
    case 11: return adhan.CalculationMethod.Singapore();
    case 12: return adhan.CalculationMethod.Tehran();
    case 13: return adhan.CalculationMethod.Turkey();
    case 15: return adhan.CalculationMethod.MoonsightingCommittee();
    default: return adhan.CalculationMethod.MuslimWorldLeague();
  }
}

export interface ComputeOptions {
  lat: number;
  lng: number;
  date: Date;
  method: number;
  madhab: number; // 0=Shafi/Maliki/Hanbali, 1=Hanafi
  /**
   * User-defined twilight angles. Only applied when `method === 0` (Custom).
   * - customFajrAngle: degrees below horizon for Fajr (typical range 12–20)
   * - customIshaAngle: degrees below horizon for Isha (typical range 12–20)
   * - customIshaInterval: if > 0, fixed minutes after Maghrib (overrides angle).
   *   Used by Umm al-Qura during Ramadan (90 min) and similar schemes.
   */
  customFajrAngle?: number;
  customIshaAngle?: number;
  customIshaInterval?: number;
}

export function computePrayerTimes(opts: ComputeOptions): PrayerTimesResult {
  const coords = new adhan.Coordinates(opts.lat, opts.lng);
  const params = paramsForAladhanMethod(opts.method);

  if (opts.method === 0) {
    if (typeof opts.customFajrAngle === 'number' && !Number.isNaN(opts.customFajrAngle)) {
      params.fajrAngle = opts.customFajrAngle;
    }
    if (typeof opts.customIshaAngle === 'number' && !Number.isNaN(opts.customIshaAngle)) {
      params.ishaAngle = opts.customIshaAngle;
    }
    if (
      typeof opts.customIshaInterval === 'number' &&
      !Number.isNaN(opts.customIshaInterval) &&
      opts.customIshaInterval > 0
    ) {
      params.ishaInterval = opts.customIshaInterval;
    }
  }

  params.madhab = opts.madhab === 1 ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;

  const d = new adhan.PrayerTimes(coords, opts.date, params);
  return {
    fajr: d.fajr.toISOString(),
    sunrise: d.sunrise.toISOString(),
    dhuhr: d.dhuhr.toISOString(),
    asr: d.asr.toISOString(),
    maghrib: d.maghrib.toISOString(),
    isha: d.isha.toISOString(),
  };
}
