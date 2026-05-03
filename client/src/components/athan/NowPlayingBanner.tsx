import { Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/stores/audio';
import { RECITERS } from '@/types';
import { useI18n } from '@/i18n/useI18n';
import { pickName } from '@/lib/localizedName';
import { useCustomReciters } from '@/hooks/useCustomReciters';
import { parseCustomReciterId } from '@/lib/reciter';

/**
 * Floating "now playing" banner — appears at the bottom of the viewport
 * while a scheduled Athan is firing (context === 'athan'). Hides for
 * manual previews from the AthanPlayer test button and for radio streams,
 * which already have their own visible play state on their cards.
 *
 * Auto-dismisses when the audio store transitions out of `playing`. Stop
 * button calls `audio.stop()` which interrupts the chain (Athan + Dua-after).
 */
export function NowPlayingBanner() {
  const { t, lang } = useI18n();
  const playing = useAudio((s) => s.playing);
  const meta = useAudio((s) => s.meta);
  const progress = useAudio((s) => s.progress);
  const duration = useAudio((s) => s.duration);
  const queueLength = useAudio((s) => s.queue.length);
  const stop = useAudio((s) => s.stop);
  // All hooks must run before the conditional early-return below — otherwise
  // the transition from "not playing" to "playing athan" changes the hook
  // count and React throws error #310 (which silently aborted the athan
  // render path on 2026-04-28).
  const customRows = useCustomReciters().data ?? [];

  if (!playing || meta?.context !== 'athan') return null;

  // Custom reciter ids look like "custom:42" — resolve via the live list.
  const customId = meta.reciterId ? parseCustomReciterId(meta.reciterId) : null;
  const customRow = customId !== null ? customRows.find((r) => r.id === customId) : undefined;
  const reciter = RECITERS.find((r) => r.id === meta.reciterId);
  const reciterLabel = customRow
    ? `★ ${customRow.name}`
    : reciter
      ? pickName(reciter, lang).name
      : (meta.reciterId ?? '');
  // Prayer name uses the same i18n keys the rest of the app uses, so the
  // banner reads natively in EN/FR/AR.
  const prayerLabel = meta.prayerName ? t(`prayer.${meta.prayerName}`) : '';
  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-12 z-50 flex justify-center px-4"
    >
      <div className="pointer-events-auto flex w-full max-w-md flex-col gap-2 rounded-lg border border-primary/40 bg-card/95 p-3 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Volume2 className="h-4 w-4" />
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75" />
          </div>

          <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
            <div className="flex items-baseline gap-2 truncate">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                {t('nowplaying.label')}
              </span>
              <span className="font-display text-base text-foreground/90">
                {prayerLabel}
              </span>
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {reciterLabel}
              {queueLength > 0 && (
                <span className="ml-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                  {t('nowplaying.dua_next')}
                </span>
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={stop}
            className="shrink-0 gap-1.5"
          >
            <Square className="h-3.5 w-3.5" />
            {t('ui.stop')}
          </Button>
        </div>

        {/* Progress bar — fills as the audio plays. */}
        <div className="h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
