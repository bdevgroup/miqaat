import { useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { X, Volume2, VolumeX } from 'lucide-react';
import { TickProvider, useTick } from '@/contexts/TickContext';
import { useApplyTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/hooks/useSettings';
import { useCustomReciters } from '@/hooks/useCustomReciters';
import { resolveAthanSource } from '@/lib/reciter';
import { useI18n } from '@/i18n/useI18n';
import { LogoMark } from '@/components/brand/LogoMark';
import { PRAYER_LABELS, type PrayerName } from '@/types';
import { cn } from '@/lib/cn';

const DUA_URL = './audio/dua-after-athan.mp3';

function getParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? '';
}

type Phase = 'playing' | 'dua' | 'elapsed';

function AthanPopupInner() {
  useApplyTheme();
  const { t, lang } = useI18n();
  const { data: settings } = useSettings();
  const { data: customReciters } = useCustomReciters();
  const now = useTick();

  const prayer = (getParam('prayer') || 'fajr') as PrayerName;
  const iso = getParam('iso');
  const reciterIdParam = getParam('reciterId');
  const playDuaAfterParam = getParam('playDuaAfter') === '1';

  const apiUrl = (window as { __API_URL__?: string }).__API_URL__ ?? '';

  const prayerStart = useMemo(() => DateTime.fromISO(iso), [iso]);

  const [phase, setPhase] = useState<Phase>('playing');
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Resolve which audio file to play. Empty reciterIdParam falls back to
  // settings (per-prayer override → global default → 'makkah').
  const reciterId = useMemo(() => {
    if (reciterIdParam) return reciterIdParam;
    if (!settings) return 'makkah';
    const perPrayerKey = `reciter_${prayer}` as const;
    const perPrayer = (settings[perPrayerKey as keyof typeof settings] as string | undefined) ?? '';
    return perPrayer || settings.reciter || 'makkah';
  }, [reciterIdParam, settings, prayer]);

  const source = useMemo(
    () => resolveAthanSource(reciterId, customReciters ?? [], apiUrl),
    [reciterId, customReciters, apiUrl],
  );

  // Ensure window starts focused so OS surfaces it above other apps. Doesn't
  // steal focus permanently — user can click away freely. Also rip out the
  // splash overlay (defined in index.html) — it's shared with the main app
  // and stays on top of our popup until removed (Widget.tsx does the same).
  useEffect(() => {
    document.getElementById('splash')?.remove();
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
    try { window.focus(); } catch { /* ignore */ }
  }, []);

  // Drive playback. Athan first; when it ends, optionally play dua; when
  // both finish, transition to "elapsed" phase.
  useEffect(() => {
    if (!source) {
      setError('No reciter configured');
      setPhase('elapsed');
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = source.url;
    audio.muted = muted;
    audio.volume = settings ? Number(settings.volume ?? 0.8) : 0.8;

    let didDua = false;
    const onEnded = () => {
      if (!didDua && playDuaAfterParam) {
        didDua = true;
        setPhase('dua');
        audio.src = DUA_URL;
        audio.play().catch(() => {
          setPhase('elapsed');
        });
        return;
      }
      setPhase('elapsed');
    };
    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => setProgress(audio.currentTime || 0);
    const onErr = () => {
      setError('Playback failed');
      setPhase('elapsed');
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('error', onErr);

    audio.play().catch(() => {
      setError('Autoplay blocked');
      setPhase('elapsed');
    });

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('error', onErr);
      audio.pause();
    };
    // We intentionally re-run only when source changes; muted handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source?.url, playDuaAfterParam]);

  // Muted toggle without restarting playback.
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // Listen for "athan:update" if the main process re-uses this window for
  // a back-to-back prayer (rare — only happens if popup wasn't closed yet).
  useEffect(() => {
    const electronAPI = (window as { electronAPI?: { onAthanUpdate?(cb: (e: unknown) => void): () => void } }).electronAPI;
    const off = electronAPI?.onAthanUpdate?.(() => {
      // Cheapest path: reload window so URL params reflect new prayer.
      window.location.reload();
    });
    return () => off?.();
  }, []);

  const elapsedSec = Math.max(0, Math.floor((now.getTime() - prayerStart.toMillis()) / 1000));
  const elapsedLabel = useMemo(() => formatElapsed(elapsedSec, lang), [elapsedSec, lang]);

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;
  const reciterLabel = source?.displayName ?? reciterId;
  const prayerLabel = t(`prayer.${prayer}`) || PRAYER_LABELS[prayer];

  // The wrapper div is draggable so the user can move the popup; transparent
  // background outside the rounded card lets the OS show through.
  return (
    <div
      className="flex h-screen w-screen items-stretch p-1"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <audio ref={audioRef} preload="auto" />

      <div className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-xl border border-primary/30 bg-card/95 p-3 text-foreground shadow-2xl backdrop-blur">
        {/* Top row: brand + close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark variant="chrome" size={16} />
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-primary">
              {phase === 'elapsed'
                ? t('athanpopup.elapsed_label')
                : phase === 'dua'
                  ? t('athanpopup.dua_label')
                  : t('athanpopup.playing_label')}
            </span>
          </div>
          <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            {phase !== 'elapsed' && (
              <button
                onClick={() => setMuted((m) => !m)}
                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            )}
            <button
              onClick={() => window.close()}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Hero row: prayer name + time / elapsed */}
        <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
          <div className="font-display text-3xl leading-none">{prayerLabel}</div>
          {phase === 'elapsed' ? (
            <>
              <div className="font-display text-2xl text-primary">{elapsedLabel}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t('athanpopup.since')} {prayerStart.toFormat('HH:mm')}
              </div>
            </>
          ) : (
            <>
              <div className="font-mono text-xs text-muted-foreground tabular-nums">
                {prayerStart.toFormat('HH:mm')}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">{reciterLabel}</div>
            </>
          )}
        </div>

        {/* Progress bar — only while audio is playing */}
        {phase !== 'elapsed' && (
          <div className="h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn('h-full bg-primary transition-[width] duration-300', error && 'bg-destructive')}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        {error && (
          <div className="text-center text-[10px] text-destructive">{error}</div>
        )}
      </div>
    </div>
  );
}

/**
 * Format an elapsed-seconds duration as "1h 23m" / "12m 34s" / "45s".
 * Stays Latin-digit + Latin-letter for bidi safety in Arabic UI (we hit
 * this exact bidi mess in `time.ts::diffHumanHMS` already).
 */
function formatElapsed(sec: number, _lang: string): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

export default function AthanPopup() {
  return (
    <TickProvider>
      <AthanPopupInner />
    </TickProvider>
  );
}
