import { useEffect, useRef } from 'react';
import { DateTime } from 'luxon';
import type { PrayerTimesResponse, AppSettings } from '@/types';
import { useTick } from '@/contexts/TickContext';
import { isFriday, isThursday } from '@/lib/jumuah';

const FIRE_WINDOW_MS = 60_000;

/**
 * Three Friday-specific reminders, each gated by its own settings flag and
 * the master `jumuah_enhancements`. De-duped by date+kind so a slow tick
 * doesn't double-fire.
 *
 *   Thursday eve (~19:00 local)         → Surah Al-Kahf reminder
 *   Friday, 1 h before Dhuhr            → first ajr-hour starts now
 *   Friday, 1 h before Maghrib          → hour of acceptance
 *
 * Falls back silently when OS notification permission isn't granted —
 * we don't queue toasts internally.
 */
export function useJumuahNotifications(
  times: PrayerTimesResponse | undefined,
  settings: AppSettings,
) {
  const now = useTick();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (settings.jumuah_enhancements !== 'true') return;
    if (settings.notifications_enabled !== 'true') return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    const tz = settings.timezone || undefined;
    const nowMs = now.getTime();
    const todayISO =
      DateTime.fromJSDate(now).setZone(tz ?? 'local').toISODate() ?? '';

    // 1. Thursday-eve Kahf reminder — fired at 19:00 local on Thursdays.
    if (settings.jumuah_kahf_alert === 'true' && isThursday(now, tz)) {
      const fireAt = DateTime.fromISO(todayISO, { zone: tz ?? 'local' })
        .set({ hour: 19, minute: 0, second: 0 })
        .toMillis();
      const key = `${todayISO}-kahf`;
      const delta = fireAt - nowMs;
      if (delta <= 0 && delta > -FIRE_WINDOW_MS && !firedRef.current.has(key)) {
        firedRef.current.add(key);
        try {
          new Notification('Surah Al-Kahf reminder', {
            body: 'Read Surah Al-Kahf tonight or tomorrow before Maghrib — light between the two Fridays.',
            silent: false,
          });
        } catch {}
      }
    }

    // The Friday-only alerts need today's prayer times.
    if (!times) return;
    if (!isFriday(now, tz)) return;

    // 2. Pre-Jumu'ah — 1 h before Dhuhr.
    if (settings.jumuah_pre_alert === 'true') {
      const dhuhrMs = new Date(times.dhuhr).getTime();
      const fireAt = dhuhrMs - 60 * 60 * 1000;
      const key = `${times.date}-jumuah-pre`;
      const delta = fireAt - nowMs;
      if (delta <= 0 && delta > -FIRE_WINDOW_MS && !firedRef.current.has(key)) {
        firedRef.current.add(key);
        try {
          new Notification('Jumu’ah in 1 hour', {
            body: 'The first ajr-hour starts now — leaving for the mosque earns the camel.',
            silent: false,
          });
        } catch {}
      }
    }

    // 3. Hour of acceptance — 1 h before Maghrib on Friday.
    if (settings.jumuah_acceptance_alert === 'true') {
      const maghribMs = new Date(times.maghrib).getTime();
      const fireAt = maghribMs - 60 * 60 * 1000;
      const key = `${times.date}-jumuah-acceptance`;
      const delta = fireAt - nowMs;
      if (delta <= 0 && delta > -FIRE_WINDOW_MS && !firedRef.current.has(key)) {
        firedRef.current.add(key);
        try {
          new Notification('Hour of acceptance', {
            body: 'A du’a in this last hour before Maghrib on Friday is a moment Allah accepts.',
            silent: false,
          });
        } catch {}
      }
    }
  }, [times, now, settings]);
}
