import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAudio } from '@/stores/audio';
import { useI18n } from '@/i18n/useI18n';

/**
 * Headless, app-root-mounted <audio>. Keeps playback alive regardless of
 * which UI component is visible. Consumes and drives the zustand store.
 */
export function AudioElement() {
  const ref = useRef<HTMLAudioElement>(null);
  const playing = useAudio((s) => s.playing);
  const src = useAudio((s) => s.src);
  const volume = useAudio((s) => s.volume);
  const advance = useAudio((s) => s.advance);
  const stop = useAudio((s) => s.stop);
  const setProgress = useAudio((s) => s.setProgress);
  const setDuration = useAudio((s) => s.setDuration);
  const { t } = useI18n();

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = volume;
  }, [volume]);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    if (playing && src) {
      if (a.src !== src) {
        a.src = src;
        a.currentTime = 0;
      }
      a.play().catch((err) => {
        reportError(src, err?.message, t);
        stop();
      });
    } else {
      a.pause();
      if (!src) a.currentTime = 0;
    }
  }, [playing, src, stop, t]);

  const handleError = () => {
    // Use the original `src` from the store (the URL passed to play()),
    // NOT `ref.current.src` which is the resolved absolute URL — a local
    // "./audio/…" always resolves to "http://localhost…" at runtime and
    // would fool an http-prefix check into thinking it's a remote stream.
    reportError(src, undefined, t);
    stop();
  };

  return (
    <audio
      ref={ref}
      onTimeUpdate={(e) => setProgress((e.target as HTMLAudioElement).currentTime)}
      onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
      onEnded={() => advance()}
      onError={handleError}
      hidden
      preload="auto"
    />
  );
}

/** True when the URL was passed as an absolute http(s) link to play().
 *  Local file paths ("./audio/…") return false regardless of how the
 *  browser resolves them at runtime. */
function isStreamUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}

function reportError(
  url: string | null,
  detail: string | undefined,
  t: (k: string) => string,
): void {
  if (!url) return;
  // Dua-after is always optional — users may never drop the MP3. A missing
  // dua is not an error worth alarming the user about; swallow it silently.
  if (url.includes('dua-after-athan')) return;

  if (isStreamUrl(url)) {
    toast.error(t('athan.stream_error'), {
      description: detail || t('athan.stream_error.hint'),
    });
  } else {
    // Local MP3 failed — almost always "file missing in client/public/audio/".
    toast.error(t('athan.file_error'), {
      description: (detail ? `${detail}\n` : '') + t('athan.file_error.hint'),
    });
  }
}
