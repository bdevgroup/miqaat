import axios from 'axios';
import { Logger } from '@nestjs/common';

const BASE = 'https://api.aladhan.com/v1';
const logger = new Logger('AladhanClient');

export interface AladhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface AladhanTimingsResponse {
  timings: AladhanTimings;
  /** IANA timezone Aladhan computed the timings in (e.g. "Africa/Casablanca").
   *  Critical: the Fajr/Sunrise/etc strings are LOCAL clock times in this
   *  zone — without it we'd misinterpret them as UTC and the cache would be
   *  consistently +1h off in tz-east-of-UTC zones (the bug that hid behind
   *  the global-offset workaround for Morocco users). */
  timezone: string;
}

export interface AladhanHijri {
  date: string;
  day: string;
  month: { number: number; en: string; ar: string };
  year: string;
}

export async function fetchAladhanTimings(opts: {
  date: Date;
  lat: number;
  lng: number;
  method: number;
  school: number;
}): Promise<AladhanTimingsResponse | null> {
  const d = opts.date;
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  try {
    const res = await axios.get(`${BASE}/timings/${dd}-${mm}-${yyyy}`, {
      params: {
        latitude: opts.lat,
        longitude: opts.lng,
        method: opts.method,
        school: opts.school,
      },
      // 3 s was tight for first-launch on residential connections (cold
      // DNS + TLS handshake to api.aladhan.com routinely takes 1.5–2 s
      // and any backpressure pushes past 3 s). 10 s gives the verify
      // step room to succeed; the user already has locally-computed
      // times rendered, so the wait is invisible.
      timeout: 10000,
    });
    const timings = res.data?.data?.timings;
    const timezone = res.data?.data?.meta?.timezone;
    if (!timings || typeof timezone !== 'string' || !timezone) return null;
    return { timings, timezone };
  } catch (err) {
    logger.warn(`Aladhan timings failed: ${(err as Error).message}`);
    return null;
  }
}

export async function fetchAladhanHijri(gregorianDate: string): Promise<AladhanHijri | null> {
  // Format YYYY-MM-DD → DD-MM-YYYY
  const [y, m, d] = gregorianDate.split('-');
  try {
    const res = await axios.get(`${BASE}/gToH/${d}-${m}-${y}`, { timeout: 10000 });
    return res.data?.data?.hijri ?? null;
  } catch (err) {
    logger.warn(`Aladhan Hijri failed: ${(err as Error).message}`);
    return null;
  }
}
