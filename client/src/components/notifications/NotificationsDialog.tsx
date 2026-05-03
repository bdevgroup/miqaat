import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Bell, BellOff, AlertCircle, Play } from 'lucide-react';
import {
  PRAYER_ORDER, PRAYER_LABELS, type AppSettings, type PrayerName,
} from '@/types';
import { useUpdateSettings } from '@/hooks/useSettings';
import { useAudio } from '@/stores/audio';
import { useI18n } from '@/i18n/useI18n';
import { resolveReciter, resolveAthanSource } from '@/lib/reciter';
import { useCustomReciters } from '@/hooks/useCustomReciters';
import { toast } from 'sonner';

const PER_PRAYER_KEY: Record<PrayerName, keyof AppSettings> = {
  fajr: 'notify_fajr',
  sunrise: 'notify_sunrise',
  dhuhr: 'notify_dhuhr',
  asr: 'notify_asr',
  maghrib: 'notify_maghrib',
  isha: 'notify_isha',
};

// Per-prayer reciter Select moved to Settings dialog → "Athan customization"
// section (v1.5(c), 2026-04-26). Notifications now keeps just on/off +
// pre-alert + test — no audio-source picking.

const DUA_URL = './audio/dua-after-athan.mp3';

// Prayers you can test — sunrise excluded because it never plays an athan.
const TESTABLE_PRAYERS: PrayerName[] = [
  'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
];

export function NotificationsDialog({ settings }: { settings: AppSettings }) {
  const [open, setOpen] = useState(false);
  const [testPrayer, setTestPrayer] = useState<PrayerName>('dhuhr');
  const update = useUpdateSettings();
  const { t } = useI18n();
  const { play, playChain } = useAudio();
  const customReciters = useCustomReciters();
  const apiUrl = (typeof window !== 'undefined' && window.__API_URL__) || '';

  const master = settings.notifications_enabled === 'true';
  const permission =
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';

  const requestPerm = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      update.mutate({ notifications_enabled: 'true' });
    }
  };

  /**
   * Simulates a real prayer firing. Runs the same notification + audio-chain
   * logic that `useNotifications` triggers when a prayer time is crossed —
   * bypasses only the clock check and the master/per-prayer gates so you
   * can verify the hardware pathway without waiting.
   */
  const fireTest = () => {
    // 1. Desktop toast (if OS permission granted)
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(`${PRAYER_LABELS[testPrayer]} prayer (test)`, {
          body: `It's time for ${PRAYER_LABELS[testPrayer]}.`,
          silent: false,
        });
      } catch {}
    } else {
      // Fall back to an in-app toast so there's visible feedback even
      // without OS notification permission.
      toast(`${PRAYER_LABELS[testPrayer]} prayer (test)`, {
        description: `It's time for ${PRAYER_LABELS[testPrayer]}.`,
      });
    }

    // 2. Athan audio (per-prayer override → global reciter → no athan).
    //    resolveAthanSource handles built-in + custom reciters uniformly.
    const reciter = resolveReciter(testPrayer, settings);
    const source = resolveAthanSource(reciter, customReciters.data, apiUrl);
    if (source) {
      const meta = {
        context: 'athan' as const,
        prayerName: testPrayer,
        reciterId: source.reciterId,
      };
      if (settings.play_dua_after === 'true') {
        playChain([source.url, DUA_URL], meta);
      } else {
        play(source.url, meta);
      }
    } else {
      toast.warning('Reciter is set to "No Athan" — no audio will play.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t('ui.notifications')}>
              {master ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {master ? t('ui.notifications') : t('ui.notifications.muted')}
        </TooltipContent>
      </Tooltip>
      <DialogContent className="flex max-h-[85vh] max-w-md flex-col gap-4 overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('notif.title')}</DialogTitle>
          <DialogDescription>{t('notif.desc')}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-2">
          {permission !== 'granted' && permission !== 'unsupported' && (
            <div className="flex items-start gap-3 rounded-md border bg-accent/30 p-3 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="flex-1">
                <div className="font-medium">{t('notif.grant')}</div>
                <div className="text-xs text-muted-foreground">
                  {t('notif.status')} <span className="font-mono">{permission}</span>
                </div>
              </div>
              <Button size="sm" onClick={requestPerm}>{t('notif.allow')}</Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>{t('notif.master')}</Label>
              <div className="text-xs text-muted-foreground">{t('notif.master.desc')}</div>
            </div>
            <Switch
              checked={master}
              onCheckedChange={(v) => update.mutate({ notifications_enabled: String(v) })}
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t('notif.per_prayer')}
            </div>
            <ul className="flex flex-col gap-1.5">
              {PRAYER_ORDER.map((name) => {
                const key = PER_PRAYER_KEY[name];
                const checked = (settings[key] as string) === 'true';
                return (
                  <li
                    key={name}
                    className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                  >
                    <Label htmlFor={`notify-${name}`} className="flex-1 cursor-pointer text-sm">
                      {t(`prayer.${name}`)}
                    </Label>
                    <Switch
                      id={`notify-${name}`}
                      checked={checked}
                      disabled={!master}
                      onCheckedChange={(v) => update.mutate({ [key]: String(v) } as Partial<AppSettings>)}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <div>
              <Label>{t('notif.pre_title')}</Label>
              <div className="text-xs text-muted-foreground">{t('notif.pre_desc')}</div>
            </div>
            <Select
              value={settings.pre_notify_minutes}
              onValueChange={(v) => update.mutate({ pre_notify_minutes: v })}
            >
              <SelectTrigger className="w-35" disabled={!master}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t('notif.at_prayer')}</SelectItem>
                <SelectItem value="5">5 {t('notif.min_before')}</SelectItem>
                <SelectItem value="10">10 {t('notif.min_before')}</SelectItem>
                <SelectItem value="15">15 {t('notif.min_before')}</SelectItem>
                <SelectItem value="30">30 {t('notif.min_before')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex flex-col gap-3 rounded-md border border-dashed bg-accent/10 p-3">
            <div>
              <Label>{t('notif.test')}</Label>
              <div className="text-xs text-muted-foreground">{t('notif.test.desc')}</div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={testPrayer}
                onValueChange={(v) => setTestPrayer(v as PrayerName)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TESTABLE_PRAYERS.map((p) => (
                    <SelectItem key={p} value={p}>{t(`prayer.${p}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={fireTest} className="gap-2">
                <Play className="h-3.5 w-3.5" />
                {t('notif.test.fire')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
