import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Play, Square, Volume2 } from 'lucide-react';
import { useAudio } from '@/stores/audio';
import { RECITERS, type AppSettings } from '@/types';
import { useUpdateSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n/useI18n';
import { pickName } from '@/lib/localizedName';
import { useCustomReciters } from '@/hooks/useCustomReciters';
import { resolveAthanSource, buildCustomReciterId } from '@/lib/reciter';

/**
 * Athan player — short MP3 reciter for prayer-time playback. Separated from
 * `<RadioPlayer />` because they serve different purposes: Athan fires once
 * at prayer time (or on-demand via Play), radio is passive listening.
 */
export function AthanPlayer({ settings }: { settings: AppSettings }) {
  const update = useUpdateSettings();
  const { t, lang } = useI18n();
  const { playing, src, volume, progress, duration, play, playChain, stop, setVolume } = useAudio();
  const customReciters = useCustomReciters();
  const customList = customReciters.data ?? [];
  const apiUrl = (typeof window !== 'undefined' && window.__API_URL__) || '';

  useEffect(() => {
    setVolume(Number(settings.volume) || 0.8);
  }, [settings.volume, setVolume]);

  // "Athan playing" in this card = a local MP3 OR a custom reciter (which
  // streams from /api/custom-reciters/...). Excludes radio streams from
  // qurango.net so radio doesn't hijack the Play/Stop button here.
  const isCustomUrl = !!src && src.includes('/api/custom-reciters/');
  const isLocalUrl = !!src && src.startsWith('./audio/');
  const athanPlaying = playing && (isLocalUrl || isCustomUrl);
  const isNone = settings.reciter === 'none';

  const onPlay = () => {
    if (isNone) return;
    const source = resolveAthanSource(settings.reciter, customList, apiUrl);
    if (!source) return;
    // `context: 'manual'` — user pressed Play, so the now-playing banner
    // shouldn't appear (this is a preview, not a scheduled firing).
    const meta = { context: 'manual' as const, reciterId: source.reciterId };
    if (settings.play_dua_after === 'true') {
      playChain([source.url, './audio/dua-after-athan.mp3'], meta);
    } else {
      play(source.url, meta);
    }
  };

  return (
    <Card className="flex min-w-0 flex-col gap-4 overflow-hidden p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {t('athan.title')}
      </div>

      <RadioGroup
        value={settings.reciter}
        onValueChange={(v) => update.mutate({ reciter: v })}
        className="gap-2"
      >
        {RECITERS.map((r) => {
          const { name, who } = pickName(r, lang);
          return (
            <Label
              key={r.id}
              htmlFor={`reciter-${r.id}`}
              className="flex cursor-pointer items-center gap-3 rounded-md border bg-card p-3 hover:bg-accent/30"
            >
              <RadioGroupItem value={r.id} id={`reciter-${r.id}`} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                {who && <span className="text-xs text-muted-foreground">{who}</span>}
              </div>
            </Label>
          );
        })}
        {customList.map((r) => {
          const id = buildCustomReciterId(r.id);
          return (
            <Label
              key={id}
              htmlFor={`reciter-${id}`}
              className="flex min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-md border border-primary/30 bg-primary/5 p-3 hover:bg-primary/10"
            >
              <RadioGroupItem value={id} id={`reciter-${id}`} />
              {/* min-w-0 lets the flex child actually shrink so `truncate`
                  can engage. Without it, the inner span would force the
                  parent wide enough to fit the entire filename and overflow
                  the card. The native `title` attribute carries the full
                  name for users who hover the truncated text. */}
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className="truncate text-sm font-medium"
                  title={r.name}
                >
                  ★ {r.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('custom.row.label')}
                </span>
              </div>
            </Label>
          );
        })}
      </RadioGroup>

      <div className="flex items-center justify-between rounded-md border p-2">
        <Button
          size="sm"
          variant={athanPlaying ? 'secondary' : 'default'}
          disabled={isNone}
          onClick={() => (athanPlaying ? stop() : onPlay())}
        >
          {athanPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {athanPlaying ? t('ui.stop') : t('ui.play')}
        </Button>
        <div className="flex flex-1 items-center gap-2 px-3">
          <div className="font-mono text-xs tabular-nums text-muted-foreground">
            {formatSec(athanPlaying ? progress : 0)}
          </div>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-[width]"
              style={{
                width: athanPlaying && duration ? `${(progress / duration) * 100}%` : '0%',
              }}
            />
          </div>
          <div className="font-mono text-xs tabular-nums text-muted-foreground">
            {formatSec(athanPlaying ? duration : 0)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[volume]}
          onValueChange={([v]) => {
            setVolume(v);
            update.mutate({ volume: String(v) });
          }}
          min={0} max={1} step={0.01}
          className="flex-1"
        />
      </div>

      <div className="flex items-center justify-between rounded-md border p-2">
        <Label htmlFor="dua-after" className="text-sm">
          {t('athan.dua_after')}
        </Label>
        <Switch
          id="dua-after"
          checked={settings.play_dua_after === 'true'}
          onCheckedChange={(v) => update.mutate({ play_dua_after: String(v) })}
        />
      </div>
    </Card>
  );
}

function formatSec(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}
