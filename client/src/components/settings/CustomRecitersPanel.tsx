import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { UploadCloud, Trash2, Play, Square, Loader2, FileAudio } from 'lucide-react';
import {
  useCustomReciters, useUploadCustomReciter, useDeleteCustomReciter,
  useSetCustomReciterDuration,
} from '@/hooks/useCustomReciters';
import { useAudio } from '@/stores/audio';
import { useI18n } from '@/i18n/useI18n';
import { buildCustomReciterId } from '@/lib/reciter';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXT = /\.(mp3|m4a|aac|ogg|wav)$/i;

/**
 * "Custom reciters" subsection used inside Settings → Athan customization.
 *
 * Flow: user clicks "Add custom Athan" → file picker (audio only) → small
 * dialog asks for a display name → upload happens (sets duration_ms after
 * the renderer measures it via a hidden <audio>). List below shows each
 * uploaded file with a Preview / Delete button. Selecting a custom reciter
 * as the default or per-prayer override happens in the existing reciter
 * Selects, which now include "custom:<id>" entries appended to the
 * shipped list.
 */
export function CustomRecitersPanel() {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ file: File; defaultName: string } | null>(null);
  const [name, setName] = useState('');

  const list = useCustomReciters();
  const upload = useUploadCustomReciter();
  const remove = useDeleteCustomReciter();
  const setDuration = useSetCustomReciterDuration();
  const audio = useAudio();

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so picking the same file twice fires onChange
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error(t('custom.error.too_large').replace('{{max}}', '10 MB'));
      return;
    }
    if (!ALLOWED_EXT.test(file.name)) {
      toast.error(t('custom.error.bad_format'));
      return;
    }
    // Drop the extension so the user starts with a clean default name.
    const defaultName = file.name.replace(/\.[^.]+$/, '');
    setName(defaultName);
    setPending({ file, defaultName });
  };

  const onConfirm = async () => {
    if (!pending) return;
    const file = pending.file;
    const trimmed = name.trim() || pending.defaultName;
    try {
      // Measure duration in the renderer first (the <audio> element knows).
      // We pass it along so the server stores it on first insert.
      const durationMs = await measureAudioDurationMs(file);
      const created = await upload.mutateAsync({
        file, name: trimmed, durationMs: Math.round(durationMs),
      });
      // If the renderer measurement didn't yield (some browsers/codecs),
      // we still get a row back; user can re-measure later.
      if (!created.duration_ms && durationMs > 0) {
        setDuration.mutate({ id: created.id, durationMs: Math.round(durationMs) });
      }
      toast.success(t('custom.uploaded').replace('{{name}}', trimmed));
      setPending(null);
    } catch (err) {
      const msg = (err as Error).message ?? 'Upload failed';
      toast.error(msg);
    }
  };

  const onPreview = (id: number, displayName: string) => {
    const url = audioUrlFor(id);
    audio.play(url, {
      context: 'manual',
      reciterId: buildCustomReciterId(id),
    });
    toast(t('custom.preview').replace('{{name}}', displayName));
  };

  const onStop = () => audio.stop();

  const onDelete = async (id: number, displayName: string) => {
    if (!confirm(t('custom.confirm_delete').replace('{{name}}', displayName))) return;
    try {
      await remove.mutateAsync(id);
      toast.success(t('custom.deleted'));
    } catch (err) {
      toast.error((err as Error).message ?? 'Delete failed');
    }
  };

  const isPlayingThis = (id: number) =>
    audio.playing && audio.meta?.reciterId === buildCustomReciterId(id);

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t('custom.title')}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {t('custom.subtitle')}
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onPickFile}>
          <UploadCloud className="h-3.5 w-3.5" />
          {t('custom.add')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/wav,.mp3,.m4a,.ogg,.wav"
          className="hidden"
          onChange={onFileChosen}
        />
      </div>

      {list.isLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> {t('custom.loading')}
        </div>
      )}

      {list.data && list.data.length === 0 && (
        <div className="text-xs italic text-muted-foreground">
          {t('custom.empty')}
        </div>
      )}

      {list.data && list.data.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {list.data.map((r) => {
            const playing = isPlayingThis(r.id);
            return (
              <li
                key={r.id}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm',
                  playing && 'border-primary/60 bg-primary/5',
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FileAudio className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{r.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formatBytes(r.size_bytes)}
                      {r.duration_ms ? ` · ${formatDuration(r.duration_ms)}` : ''}
                    </span>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => (playing ? onStop() : onPreview(r.id, r.name))}
                  title={playing ? t('ui.stop') : t('ui.play')}
                >
                  {playing ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive/80 hover:text-destructive"
                  onClick={() => onDelete(r.id, r.name)}
                  title={t('custom.delete')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Name-the-upload dialog */}
      <Dialog open={!!pending} onOpenChange={(v) => { if (!v) setPending(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('custom.name_dialog.title')}</DialogTitle>
            <DialogDescription>{t('custom.name_dialog.body')}</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={pending?.defaultName ?? ''}
            onKeyDown={(e) => { if (e.key === 'Enter') onConfirm(); }}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)}>
              {t('custom.name_dialog.cancel')}
            </Button>
            <Button onClick={onConfirm} disabled={upload.isPending} className="gap-1.5">
              {upload.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t('custom.name_dialog.upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function audioUrlFor(id: number): string {
  // The streaming endpoint lives at the server's API root.
  const apiBase =
    typeof window !== 'undefined' && window.__API_URL__
      ? window.__API_URL__
      : '';
  return `${apiBase}/api/custom-reciters/${id}/audio`;
}

/** Read the duration of an audio file via a transient <audio> element. */
function measureAudioDurationMs(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('audio');
    const cleanup = () => {
      a.removeAttribute('src');
      URL.revokeObjectURL(url);
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve(0);
    }, 8_000);
    a.preload = 'metadata';
    a.onloadedmetadata = () => {
      window.clearTimeout(timeout);
      const ms = isFinite(a.duration) ? a.duration * 1000 : 0;
      cleanup();
      resolve(ms);
    };
    a.onerror = () => {
      window.clearTimeout(timeout);
      cleanup();
      resolve(0);
    };
    a.src = url;
  });
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
