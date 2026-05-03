import { useEffect, useRef } from 'react';
import type { PrayerTimesResponse, AppSettings, PrayerName } from '@/types';
import { PRAYER_ORDER, PRAYER_LABELS } from '@/types';
import { useTick } from '@/contexts/TickContext';

// Widened to 60s so a throttled tick (background tab, OS sleep) doesn't miss
// the firing window. We de-dupe per prayer per date via firedRef.
const FIRE_WINDOW_MS = 60_000;

const PER_PRAYER_KEY: Record<PrayerName, keyof AppSettings> = {
  fajr: 'notify_fajr',
  sunrise: 'notify_sunrise',
  dhuhr: 'notify_dhuhr',
  asr: 'notify_asr',
  maghrib: 'notify_maghrib',
  isha: 'notify_isha',
};

/**
 * Renderer-side prayer-time observer. Responsibilities:
 *  - Pre-alert (X minutes before prayer) as an OS toast.
 *  - OS toast at exact prayer time.
 *
 * Audio is intentionally NOT fired here. The main process schedules a
 * dedicated always-on-top "athan popup" window via `athan-scheduler.ts`,
 * which owns the audio playback regardless of whether the main window is
 * visible. This avoids: (a) double playback when both fire, (b) the
 * background-throttling miss when the main window is hidden in tray.
 */
export function useNotifications(
  times: PrayerTimesResponse | undefined,
  settings: AppSettings,
) {
  const now = useTick();
  const firedRef = useRef<Set<string>>(new Set());

  // Ask for OS permission once when enabled, but don't gate audio on it.
  useEffect(() => {
    if (settings.notifications_enabled !== 'true') return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, [settings.notifications_enabled]);

  useEffect(() => {
    if (!times) return;
    if (settings.notifications_enabled !== 'true') return;

    const canToast =
      typeof Notification !== 'undefined' && Notification.permission === 'granted';
    const preMinutes = Math.max(0, Math.min(120, Number(settings.pre_notify_minutes) || 0));
    const preMs = preMinutes * 60_000;
    const nowMs = now.getTime();

    for (const name of PRAYER_ORDER) {
      const perKey = PER_PRAYER_KEY[name];
      if ((settings[perKey] as string) !== 'true') continue;

      const prayerTime = new Date(times[name]).getTime();

      // Pre-alert — just an OS toast, no athan.
      if (preMs > 0) {
        const preKey = `${times.date}-${name}-pre`;
        const preFireAt = prayerTime - preMs;
        const preDelta = preFireAt - nowMs;
        if (
          preDelta <= 0 &&
          preDelta > -FIRE_WINDOW_MS &&
          !firedRef.current.has(preKey)
        ) {
          firedRef.current.add(preKey);
          if (canToast) {
            try {
              new Notification(`${PRAYER_LABELS[name]} in ${preMinutes} min`, {
                body: `${PRAYER_LABELS[name]} starts in ${preMinutes} minutes.`,
                silent: false,
              });
            } catch {}
          }
        }
      }

      // Main firing — toast + athan audio.
      const mainKey = `${times.date}-${name}`;
      const mainDelta = prayerTime - nowMs;
      if (
        mainDelta <= 0 &&
        mainDelta > -FIRE_WINDOW_MS &&
        !firedRef.current.has(mainKey)
      ) {
        firedRef.current.add(mainKey);
        console.info(
          `[athan] firing ${name} prayer (scheduled ${new Date(prayerTime).toISOString()}, now ${new Date(nowMs).toISOString()})`,
        );

        if (canToast) {
          try {
            new Notification(`${PRAYER_LABELS[name]} prayer`, {
              body: `It's time for ${PRAYER_LABELS[name]}.`,
              silent: false,
            });
          } catch { /* notification API quirks — non-fatal */ }
        }
        // Audio playback is handled by the main-process athan popup, not
        // here. See `electron/src/athan-scheduler.ts`.
      }
    }
  }, [times, now, settings]);
}
