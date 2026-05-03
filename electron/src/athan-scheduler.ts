import http from 'node:http';
import log from 'electron-log/main';
import { openAthanPopup } from './windows/athan-popup-window';

const PRAYERS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
type Prayer = typeof PRAYERS[number];

export interface SchedulerCtx {
  apiUrl: string;
  port: number;
  devURL?: string;
  prodIndex?: string;
}

interface ScheduledTimer {
  prayer: Prayer;
  iso: string;
  reciterId: string | undefined;
  playDuaAfter: boolean;
  timeout: NodeJS.Timeout;
}

let timers: ScheduledTimer[] = [];
let inflight = false;

/**
 * Re-fetches the next 24 h of prayer times from the local NestJS server,
 * applies user offsets server-side, and schedules a `setTimeout` per
 * upcoming prayer. When each timer fires, it opens the athan popup window
 * and (eventually) re-runs itself to schedule tomorrow's prayers.
 *
 * Idempotent: clears existing timers before scheduling new ones, so callers
 * can fire-and-forget on every settings change.
 */
export async function refreshAthanSchedule(ctx: SchedulerCtx): Promise<void> {
  if (inflight) {
    // A rapid succession of settings changes shouldn't pile up overlapping
    // refreshes; drop the duplicate.
    return;
  }
  inflight = true;
  try {
    timers.forEach((t) => clearTimeout(t.timeout));
    timers = [];

    const upcoming = await fetchUpcoming(ctx.port);
    const now = Date.now();
    const HORIZON_MS = 26 * 60 * 60 * 1000; // 26 h — covers tomorrow's Fajr in any tz

    for (const p of upcoming) {
      const fireAt = new Date(p.iso).getTime();
      const delay = fireAt - now;
      if (delay <= 0) continue;
      if (delay > HORIZON_MS) continue;

      const timeout = setTimeout(() => {
        log.info(`[athan-scheduler] firing ${p.prayer} at ${p.iso}`);
        openAthanPopup({
          prayer: p.prayer,
          iso: p.iso,
          reciterId: p.reciterId,
          playDuaAfter: p.playDuaAfter,
          apiUrl: ctx.apiUrl,
          devURL: ctx.devURL,
          prodIndex: ctx.prodIndex,
        });
        // After firing, refresh the schedule a few seconds later. By then
        // the just-fired prayer is in the past so it'll be skipped, but
        // tomorrow's Fajr (if in horizon) will get scheduled.
        setTimeout(() => { void refreshAthanSchedule(ctx); }, 5000);
      }, delay);

      timers.push({
        prayer: p.prayer,
        iso: p.iso,
        reciterId: p.reciterId,
        playDuaAfter: p.playDuaAfter,
        timeout,
      });

      const mins = Math.round(delay / 60_000);
      log.info(`[athan-scheduler] queued ${p.prayer} in ${mins} min (${p.iso}) reciter=${p.reciterId ?? 'default'}`);
    }

    if (timers.length === 0) {
      log.info('[athan-scheduler] no upcoming prayers in horizon (notifications off, no location, or all expired)');
    }
  } catch (err) {
    log.warn(`[athan-scheduler] refresh failed: ${(err as Error).message}`);
  } finally {
    inflight = false;
  }
}

interface UpcomingItem {
  prayer: Prayer;
  iso: string;
  reciterId: string | undefined;
  playDuaAfter: boolean;
}

interface SettingsRow {
  notifications_enabled?: string;
  notify_fajr?: string; notify_sunrise?: string; notify_dhuhr?: string;
  notify_asr?: string; notify_maghrib?: string; notify_isha?: string;
  reciter?: string;
  reciter_fajr?: string; reciter_dhuhr?: string;
  reciter_asr?: string; reciter_maghrib?: string; reciter_isha?: string;
  play_dua_after?: string;
  calc_method?: string; madhab?: string;
  custom_fajr_angle?: string; custom_isha_angle?: string; custom_isha_interval?: string;
  offset_fajr?: string; offset_sunrise?: string; offset_dhuhr?: string;
  offset_asr?: string; offset_maghrib?: string; offset_isha?: string;
  global_offset_min?: string;
}

interface PrayerTimesRow {
  fajr: string; sunrise: string; dhuhr: string;
  asr: string; maghrib: string; isha: string;
}

interface LocationRow {
  lat: number; lng: number; timezone: string | null;
}

async function fetchUpcoming(port: number): Promise<UpcomingItem[]> {
  const settings = await httpGet<SettingsRow>(port, '/api/settings');
  if (settings.notifications_enabled !== 'true') return [];

  const location = await httpGet<LocationRow | null>(port, '/api/locations/current');
  if (!location) return [];

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const params = new URLSearchParams({
    lat: String(location.lat),
    lng: String(location.lng),
    from: today,
    to: tomorrow,
    method: settings.calc_method ?? '3',
    madhab: settings.madhab ?? '0',
  });
  if (settings.calc_method === '0') {
    if (settings.custom_fajr_angle) params.set('fa', settings.custom_fajr_angle);
    if (settings.custom_isha_angle) params.set('ia', settings.custom_isha_angle);
    if (settings.custom_isha_interval) params.set('ii', settings.custom_isha_interval);
  }
  // Send only non-zero offsets to keep cache keys clean.
  const offsets: Record<string, string | undefined> = {
    of: settings.offset_fajr, os: settings.offset_sunrise, od: settings.offset_dhuhr,
    oa: settings.offset_asr, om: settings.offset_maghrib, oi: settings.offset_isha,
    og: settings.global_offset_min,
  };
  for (const [k, v] of Object.entries(offsets)) {
    if (v && v !== '0') params.set(k, v);
  }

  const range = await httpGet<PrayerTimesRow[]>(port, `/api/prayer-times/range?${params.toString()}`);
  const playDuaAfter = settings.play_dua_after === 'true';

  const out: UpcomingItem[] = [];
  for (const day of range) {
    for (const p of PRAYERS) {
      // Sunrise has no athan — informational only.
      if (p === 'sunrise') continue;
      // Per-prayer toggle off → skip.
      const notifyKey = `notify_${p}` as const;
      if ((settings[notifyKey] as string) !== 'true') continue;

      const perPrayer = (settings[`reciter_${p}` as keyof SettingsRow] as string | undefined) ?? '';
      const reciterId = perPrayer || settings.reciter || 'makkah';

      out.push({ prayer: p, iso: day[p], reciterId, playDuaAfter });
    }
  }

  return out.sort((a, b) => new Date(a.iso).getTime() - new Date(b.iso).getTime());
}

function httpGet<T>(port: number, path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}${path}`, (res) => {
      let body = '';
      res.on('data', (chunk: Buffer) => { body += chunk.toString('utf8'); });
      res.on('end', () => {
        if (res.statusCode !== undefined && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} for ${path}`));
          return;
        }
        try {
          resolve(JSON.parse(body) as T);
        } catch (err) {
          reject(err as Error);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(new Error('timeout')); });
  });
}

export function describeSchedule(): Array<{ prayer: string; iso: string; reciterId: string | undefined }> {
  return timers.map((t) => ({ prayer: t.prayer, iso: t.iso, reciterId: t.reciterId }));
}
