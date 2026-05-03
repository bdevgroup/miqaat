import { useEffect } from 'react';
import { TickProvider, useTick } from '@/contexts/TickContext';
import { useApplyTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/hooks/useSettings';
import { useCurrentLocation } from '@/hooks/useLocations';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useNextPrayer } from '@/hooks/useNextPrayer';
import { Countdown } from '@/components/prayer/Countdown';
import { PRAYER_ORDER } from '@/types';
import { formatTime } from '@/lib/time';
import { cn } from '@/lib/cn';
import { DateTime } from 'luxon';
import { LogoMark } from '@/components/brand/LogoMark';
import { X } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';

function WidgetInner() {
  useApplyTheme();
  const { t } = useI18n();
  const { data: settings } = useSettings();
  const { data: location } = useCurrentLocation();
  const now = useTick();

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

  useEffect(() => {
    const splash = document.getElementById('splash');
    splash?.remove();
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
  }, []);

  if (!settings) return null;

  const tz = location?.timezone ?? settings.timezone ?? undefined;
  const clock = DateTime.fromJSDate(now).setZone(tz ?? 'local');

  return (
    <div
      className="relative flex h-screen w-screen select-none flex-col overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-2">
        <div className="flex items-baseline gap-2">
          <LogoMark variant="chrome" size={18} />
          <span className="font-mono text-sm tabular-nums">
            {clock.toFormat(settings.time_format === '12h' ? 'h:mm a' : 'HH:mm')}
          </span>
          {location && (
            <span className="max-w-35 truncate text-[10px] text-muted-foreground">
              {location.city}
            </span>
          )}
        </div>
        <button
          onClick={() => window.close()}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          aria-label="Close widget"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1 px-3">
        <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          {t('ui.next.short')} · {next.name ? t(`prayer.${next.name}`) : '—'}
        </div>
        <div className="font-display text-4xl leading-none">
          <Countdown toIso={next.iso} />
        </div>
      </div>

      {prayerTimesQ.data && (
        <div
          className="relative z-10 grid grid-cols-6 divide-x border-t text-[10px]"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {PRAYER_ORDER.map((name) => {
            const iso = prayerTimesQ.data![name];
            const isNext = next.name === name;
            return (
              <div
                key={name}
                className={cn(
                  'flex flex-col items-center py-1',
                  isNext && 'bg-primary/10',
                )}
              >
                <span className="uppercase tracking-wider text-muted-foreground">
                  {t(`prayer.${name}`).slice(0, 3)}
                </span>
                <span className={cn('font-mono tabular-nums', isNext && 'text-primary')}>
                  {formatTime(iso, settings.time_format, tz)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Widget() {
  return (
    <TickProvider>
      <WidgetInner />
    </TickProvider>
  );
}
