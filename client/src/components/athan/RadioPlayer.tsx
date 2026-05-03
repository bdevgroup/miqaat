import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Play, Square, Radio, ExternalLink } from 'lucide-react';
import { useAudio } from '@/stores/audio';
import { RADIO_STATIONS, findRadioStation, type AppSettings } from '@/types';
import { useUpdateSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n/useI18n';
import { pickStationName } from '@/lib/localizedName';
import { cn } from '@/lib/cn';

/**
 * Live radio player — separate card for long-running streams and external
 * web-player links (Sucuri/HLS-protected sources). Never fires at prayer
 * time; strictly user-initiated. Shares the global `<audio>` element and
 * volume slider with AthanPlayer.
 */
export function RadioPlayer({ settings }: { settings: AppSettings }) {
  const update = useUpdateSettings();
  const { t, lang } = useI18n();
  const { playing, src, play, stop } = useAudio();

  const currentStation = findRadioStation(settings.radio_station);
  const isExternal = !!currentStation?.externalUrl;
  // Radio is "playing" only when the current src is a remote stream URL.
  const radioPlaying = playing && !!src && /^https?:\/\//i.test(src);

  const onPlay = () => {
    if (!currentStation) return;
    if (currentStation.externalUrl) {
      if (window.electronAPI?.openExternal) {
        window.electronAPI.openExternal(currentStation.externalUrl).catch(() => {});
      } else {
        window.open(currentStation.externalUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    if (currentStation.streamUrl) {
      play(currentStation.streamUrl, { context: 'radio' });
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <Radio className="h-3.5 w-3.5" />
        {t('radio.title')}
      </div>

      <RadioGroup
        value={settings.radio_station}
        onValueChange={(v) => update.mutate({ radio_station: v })}
        className="gap-2"
      >
        {RADIO_STATIONS.map((s) => {
          const { name, who } = pickStationName(s, lang);
          return (
            <Label
              key={s.id}
              htmlFor={`station-${s.id}`}
              className="flex cursor-pointer items-center gap-3 rounded-md border bg-card p-3 hover:bg-accent/30"
            >
              <RadioGroupItem value={s.id} id={`station-${s.id}`} />
              <div className="flex flex-1 items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{name}</span>
                  {who && <span className="text-xs text-muted-foreground">{who}</span>}
                </div>
                {s.externalUrl && (
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="external" />
                )}
              </div>
            </Label>
          );
        })}
      </RadioGroup>

      <div className="flex items-center justify-between rounded-md border p-2">
        <Button
          size="sm"
          variant={radioPlaying && !isExternal ? 'secondary' : 'default'}
          disabled={!currentStation}
          onClick={() => (radioPlaying && !isExternal ? stop() : onPlay())}
        >
          {isExternal ? (
            <>
              <ExternalLink className="h-3.5 w-3.5" />
              {t('radio.open_external')}
            </>
          ) : radioPlaying ? (
            <>
              <Square className="h-3.5 w-3.5" />
              {t('ui.stop')}
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              {t('ui.play')}
            </>
          )}
        </Button>
        {radioPlaying && !isExternal && (
          <div className="flex items-center gap-2 pr-2">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              {t('radio.live')}
            </span>
          </div>
        )}
      </div>

      <p className={cn('text-xs text-muted-foreground', isExternal && 'text-foreground/70')}>
        {isExternal ? t('radio.note.external') : t('radio.note')}
      </p>
    </Card>
  );
}
