import { driver, type Driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * First-launch product tour. Uses driver.js (~6 KB) for the highlight
 * spotlight + tooltip overlay. Steps target stable `data-tour` attributes
 * so refactors of the targeted components don't silently break the tour
 * — if you remove an element, search for its `data-tour` value before
 * deleting it.
 *
 * Lifecycle:
 *  - `runTour({ t })` is called from App.tsx the first time settings load
 *    AND `settings.tour_completed !== 'true'`.
 *  - On the last step (or on early dismiss), we PATCH `tour_completed=true`
 *    so it never re-fires automatically.
 *  - The Help dialog has a "Replay tour" button that calls `runTour` again
 *    regardless of the flag.
 */

type T = (key: string, params?: Record<string, string | number>) => string;

let activeDriver: Driver | null = null;

export interface TourCallbacks {
  /** Called when the user finishes or dismisses — used to persist the flag. */
  onDone?: () => void;
}

export function runTour(t: T, callbacks?: TourCallbacks): void {
  // If a tour is already running (e.g. user clicked "Replay" mid-flow), tear
  // it down before starting fresh.
  if (activeDriver) {
    try { activeDriver.destroy(); } catch { /* ignore */ }
    activeDriver = null;
  }

  const steps: DriveStep[] = [
    {
      // Welcome step — no element, just a centered intro card.
      popover: {
        title: t('tour.welcome.title'),
        description: t('tour.welcome.body'),
        side: 'over',
      },
    },
    {
      element: '[data-tour="next-prayer"]',
      popover: {
        title: t('tour.next_prayer.title'),
        description: t('tour.next_prayer.body'),
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="prayer-grid"]',
      popover: {
        title: t('tour.prayer_grid.title'),
        description: t('tour.prayer_grid.body'),
        side: 'top',
      },
    },
    {
      element: '[data-tour="athan-player"]',
      popover: {
        title: t('tour.athan_player.title'),
        description: t('tour.athan_player.body'),
        side: 'right',
      },
    },
    {
      element: '[data-tour="location"]',
      popover: {
        title: t('tour.location.title'),
        description: t('tour.location.body'),
        side: 'bottom',
        align: 'end',
      },
    },
    {
      element: '[data-tour="qibla"]',
      popover: {
        title: t('tour.qibla.title'),
        description: t('tour.qibla.body'),
        side: 'top',
      },
    },
    {
      element: '[data-tour="monthly"]',
      popover: {
        title: t('tour.monthly.title'),
        description: t('tour.monthly.body'),
        side: 'top',
      },
    },
    {
      element: '[data-tour="settings"]',
      popover: {
        title: t('tour.settings.title'),
        description: t('tour.settings.body'),
        side: 'bottom',
        align: 'end',
      },
    },
    {
      element: '[data-tour="help"]',
      popover: {
        title: t('tour.done.title'),
        description: t('tour.done.body'),
        side: 'top',
      },
    },
  ];

  // Filter out steps whose target isn't in the DOM right now (e.g. a layout
  // that hides the right rail). Keeps the tour clean instead of skipping
  // through invisible spotlights.
  const present = steps.filter((s) => {
    if (!s.element) return true;
    return !!document.querySelector(s.element as string);
  });

  activeDriver = driver({
    showProgress: true,
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.55)',
    nextBtnText: t('tour.next'),
    prevBtnText: t('tour.prev'),
    doneBtnText: t('tour.done'),
    progressText: t('tour.progress'),
    popoverClass: 'miqaat-tour',
    onDestroyStarted: () => {
      // Fired when user closes via X, ESC, or "Done" — anything that ends
      // the tour. Single source of truth for completion bookkeeping.
      callbacks?.onDone?.();
      activeDriver?.destroy();
      activeDriver = null;
    },
    steps: present,
  });

  // Start asynchronously so any in-progress React render finishes first
  // (driver.js measures the DOM at start; we want stable layout).
  setTimeout(() => activeDriver?.drive(), 60);
}

export function isTourActive(): boolean {
  return activeDriver !== null;
}
