import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { TopBar } from '@/components/layout/TopBar';
import { BottomBar } from '@/components/layout/BottomBar';
import { UpdateBanner } from '@/components/layout/UpdateBanner';
import { ClockMismatchBanner } from '@/components/layout/ClockMismatchBanner';
import { AppShellSkeleton } from '@/components/layout/AppShellSkeleton';
import { LayoutRouter } from '@/components/layouts/LayoutRouter';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { AudioElement } from '@/components/athan/AudioElement';
import { NowPlayingBanner } from '@/components/athan/NowPlayingBanner';
import { TickProvider } from '@/contexts/TickContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useApplyTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/i18n/useI18n';
import { useSettings } from '@/hooks/useSettings';
import { useCurrentLocation } from '@/hooks/useLocations';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useNextPrayer } from '@/hooks/useNextPrayer';
import { useNotifications } from '@/hooks/useNotifications';
import { useJumuahNotifications } from '@/hooks/useJumuahNotifications';
import { useDynamicFavicon } from '@/hooks/useDynamicFavicon';
import { useTick } from '@/contexts/TickContext';
import { isJumuahActive } from '@/lib/jumuah';
import { JumuahRibbon } from '@/components/jumuah/JumuahRibbon';
import { systemTimezone } from '@/lib/time';
import { useUpdateSettings } from '@/hooks/useSettings';
import { runTour } from '@/lib/tour';

function Shell() {
  useApplyTheme();
  const { t: tForTour } = useI18n();

  const settingsQ = useSettings();
  const locationQ = useCurrentLocation();
  const updateSettings = useUpdateSettings();
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const settings = settingsQ.data;
  const location = locationQ.data;

  const prayerTimesQ = usePrayerTimes({
    lat: location?.lat,
    lng: location?.lng,
    method: Number(settings?.calc_method ?? 3),
    madhab: Number(settings?.madhab ?? 0),
    tz: location?.timezone ?? settings?.timezone ?? undefined,
    customFajrAngle: Number(settings?.custom_fajr_angle ?? 18),
    customIshaAngle: Number(settings?.custom_isha_angle ?? 17),
    customIshaInterval: Number(settings?.custom_isha_interval ?? 0),
    offsetFajr:    Number(settings?.offset_fajr ?? 0),
    offsetSunrise: Number(settings?.offset_sunrise ?? 0),
    offsetDhuhr:   Number(settings?.offset_dhuhr ?? 0),
    offsetAsr:     Number(settings?.offset_asr ?? 0),
    offsetMaghrib: Number(settings?.offset_maghrib ?? 0),
    offsetIsha:    Number(settings?.offset_isha ?? 0),
    offsetGlobal:  Number(settings?.global_offset_min ?? 0),
  });

  const next = useNextPrayer(prayerTimesQ.data);
  useNotifications(prayerTimesQ.data, settings ?? ({} as never));
  useJumuahNotifications(prayerTimesQ.data, settings ?? ({} as never));
  useDynamicFavicon(prayerTimesQ.data);
  const tickNow = useTick();

  useEffect(() => {
    const splash = document.getElementById('splash');
    if (splash && settings) {
      splash.classList.add('fade-out');
      window.setTimeout(() => splash.remove(), 400);
    }
  }, [settings]);

  useEffect(() => {
    if (settings && settings.onboarded !== 'true') setOnboardingOpen(true);
  }, [settings]);

  // First-launch product tour. Only fires once onboarding is complete
  // (location set, etc.) so the spotlight has real data behind it. The
  // 1.2 s delay lets layout settle after splash fades + content loads —
  // driver.js measures DOM at start, so jumping in too early targets a
  // half-built UI. `tour_completed='true'` is set on dismiss/finish.
  useEffect(() => {
    if (!settings) return;
    if (settings.onboarded !== 'true') return;
    if (settings.tour_completed === 'true') return;
    const id = window.setTimeout(() => {
      runTour(tForTour, {
        onDone: () => updateSettings.mutate({ tour_completed: 'true' }),
      });
    }, 1200);
    return () => window.clearTimeout(id);
  }, [settings, tForTour, updateSettings]);

  useEffect(() => {
    if (settings && !settings.timezone) {
      const tz = systemTimezone();
      fetch(
        (window as any).__API_URL__
          ? `${(window as any).__API_URL__}/api/settings`
          : '/api/settings',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timezone: tz }),
        },
      ).catch(() => {});
    }
  }, [settings]);

  // Midnight refetch — invalidate the prayer-times cache at local-tz
  // rollover so we're not stuck on yesterday's times.
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!settings) return;
    const tz = location?.timezone ?? settings.timezone ?? undefined;
    let id: number | undefined;
    const schedule = () => {
      const zone = tz ?? 'local';
      const nextMidnight = DateTime.now().setZone(zone).plus({ days: 1 }).startOf('day');
      const delay = Math.max(1000, nextMidnight.toMillis() - Date.now() + 1000);
      id = window.setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['prayer-times'] });
        queryClient.invalidateQueries({ queryKey: ['hijri'] });
        schedule();
      }, delay);
    };
    schedule();
    return () => { if (id !== undefined) window.clearTimeout(id); };
  }, [settings, location?.timezone, queryClient]);

  if (!settings) return <AppShellSkeleton />;

  const motifEnabled = settings.motif === 'star';
  const tz = location?.timezone ?? settings.timezone ?? undefined;
  const showJumuahRibbon = isJumuahActive(tickNow, settings, tz);

  return (
    <div className="flex h-full flex-col bg-background">
      <UpdateBanner />
      <TopBar settings={settings} />
      <ClockMismatchBanner />
      {showJumuahRibbon && <JumuahRibbon />}

      <LayoutRouter
        settings={settings}
        location={location}
        prayerTimesQ={prayerTimesQ}
        next={next}
        motifEnabled={motifEnabled}
        tz={tz}
      />

      <BottomBar settings={settings} />

      <Onboarding open={onboardingOpen} onDone={() => setOnboardingOpen(false)} />
      <AudioElement />
      <NowPlayingBanner />
    </div>
  );
}

export default function App() {
  return (
    <TickProvider>
      <TooltipProvider delayDuration={250} skipDelayDuration={150}>
        <Shell />
      </TooltipProvider>
    </TickProvider>
  );
}
