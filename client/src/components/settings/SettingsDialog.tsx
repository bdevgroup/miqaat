import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAutoLaunch } from '@/hooks/useAutoLaunch';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings as SettingsIcon } from 'lucide-react';
import {
  CALCULATION_METHODS, CUSTOM_METHOD_ID, MADHABS, PRAYER_ORDER, RECITERS,
  type AppSettings, type PrayerName,
} from '@/types';
import { useUpdateSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n/useI18n';
import { pickName } from '@/lib/localizedName';
import { useCustomReciters } from '@/hooks/useCustomReciters';
import { buildCustomReciterId } from '@/lib/reciter';
import { CustomRecitersPanel } from './CustomRecitersPanel';
import { PrayerOffsetsPanel } from './PrayerOffsetsPanel';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import type { ThemeMode } from '@/types';

// Per-prayer reciter override keys. Sunrise has no override — there's no
// athan for sunrise. Empty value = "use the global reciter".
const PER_PRAYER_RECITER_KEY: Partial<Record<PrayerName, keyof AppSettings>> = {
  fajr: 'reciter_fajr',
  dhuhr: 'reciter_dhuhr',
  asr: 'reciter_asr',
  maghrib: 'reciter_maghrib',
  isha: 'reciter_isha',
};

// Radix Select rejects empty string values; sentinel encodes "use default".
const USE_DEFAULT_VALUE = '__default__';

export function SettingsDialog({ settings }: { settings: AppSettings }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateSettings();
  const autoLaunch = useAutoLaunch();
  const { t, lang } = useI18n();
  const customReciters = useCustomReciters();
  const customList = customReciters.data ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t('ui.settings')}>
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('ui.settings')}</TooltipContent>
      </Tooltip>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-4 overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('ui.settings')}</DialogTitle>
          <DialogDescription>{t('settings.desc')}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-2">
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t('settings.calc.section')}
          </h3>

          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <Label>{t('settings.calc_method')}</Label>
            <Select
              value={settings.calc_method}
              onValueChange={(v) => update.mutate({ calc_method: v })}
            >
              <SelectTrigger className="w-70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALCULATION_METHODS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {settings.calc_method === CUSTOM_METHOD_ID && (
            <div className="flex flex-col gap-3 rounded-md border border-dashed bg-accent/10 p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('settings.custom_angles')}
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <Label htmlFor="custom-fajr">{t('settings.custom_fajr_angle')}</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="custom-fajr"
                    type="number"
                    step="0.1"
                    min="10"
                    max="22"
                    value={settings.custom_fajr_angle}
                    onChange={(e) => update.mutate({ custom_fajr_angle: e.target.value })}
                    className="w-24 text-right font-mono"
                  />
                  <span className="text-xs text-muted-foreground">°</span>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <Label htmlFor="custom-isha">{t('settings.custom_isha_angle')}</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="custom-isha"
                    type="number"
                    step="0.1"
                    min="10"
                    max="22"
                    value={settings.custom_isha_angle}
                    disabled={Number(settings.custom_isha_interval) > 0}
                    onChange={(e) => update.mutate({ custom_isha_angle: e.target.value })}
                    className="w-24 text-right font-mono"
                  />
                  <span className="text-xs text-muted-foreground">°</span>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <Label htmlFor="custom-isha-interval">
                  {t('settings.custom_isha_interval')}
                </Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="custom-isha-interval"
                    type="number"
                    step="1"
                    min="0"
                    max="120"
                    value={settings.custom_isha_interval}
                    onChange={(e) => update.mutate({ custom_isha_interval: e.target.value })}
                    className="w-24 text-right font-mono"
                  />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('settings.custom_angles.hint')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <Label>{t('settings.madhab')}</Label>
            <Select
              value={settings.madhab}
              onValueChange={(v) => update.mutate({ madhab: v })}
            >
              <SelectTrigger className="w-70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MADHABS.map((m, i) => (
                  <SelectItem key={`${m.id}-${i}`} value={m.id}>
                    {m.name}{m.note ? ` · ${m.note}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <Label>{t('settings.time_format')}</Label>
            <Select
              value={settings.time_format}
              onValueChange={(v) => update.mutate({ time_format: v as '12h' | '24h' })}
            >
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">{t('settings.tf.24h')}</SelectItem>
                <SelectItem value="12h">{t('settings.tf.12h')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Per-prayer time adjustments — fine-tune each prayer ±60 min
              to match the user's local mosque or community schedule. */}
          <PrayerOffsetsPanel settings={settings} />
        </section>

        <Separator />

        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t('settings.appearance')}
          </h3>

          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <Label>{t('settings.theme')}</Label>
            <Select
              value={settings.theme}
              onValueChange={(v) => update.mutate({ theme: v as ThemeMode })}
            >
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="miqat">{t('settings.theme.miqat')}</SelectItem>
                <SelectItem value="light">{t('settings.theme.light')}</SelectItem>
                <SelectItem value="dark">{t('settings.theme.dark')}</SelectItem>
                <SelectItem value="paper">{t('settings.theme.paper')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <Label>{t('settings.motif')}</Label>
            <Select
              value={settings.motif}
              onValueChange={(v) => update.mutate({ motif: v })}
            >
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="star">{t('settings.motif.star')}</SelectItem>
                <SelectItem value="dots">{t('settings.motif.dots')}</SelectItem>
                <SelectItem value="none">{t('settings.motif.none')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t('settings.athan_custom')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('settings.athan_custom.hint')}
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <Label>{t('settings.athan_custom.global')}</Label>
            <Select
              value={settings.reciter}
              onValueChange={(v) => update.mutate({ reciter: v })}
            >
              <SelectTrigger className="w-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECITERS.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {pickName(r, lang).name}
                  </SelectItem>
                ))}
                {customList.length > 0 && (
                  <>
                    <div className="border-t my-1" />
                    {customList.map((r) => (
                      <SelectItem key={`custom-${r.id}`} value={buildCustomReciterId(r.id)}>
                        ★ {r.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 rounded-md border bg-card/40 p-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('settings.athan_custom.per_prayer')}
            </div>
            <ul className="flex flex-col gap-1">
              {PRAYER_ORDER.map((name) => {
                const reciterKey = PER_PRAYER_RECITER_KEY[name];
                if (!reciterKey) return null; // Sunrise — no athan
                const value = (settings[reciterKey] as string) || USE_DEFAULT_VALUE;
                const globalReciter = RECITERS.find((r) => r.id === settings.reciter);
                const globalCustom = customList.find(
                  (r) => buildCustomReciterId(r.id) === settings.reciter,
                );
                const globalLabel = globalCustom
                  ? `★ ${globalCustom.name}`
                  : globalReciter
                    ? pickName(globalReciter, lang).name
                    : (settings.reciter || 'none');
                return (
                  <li
                    key={name}
                    className="flex items-center justify-between gap-2 py-1"
                  >
                    <Label className="text-sm">{t(`prayer.${name}`)}</Label>
                    <Select
                      value={value}
                      onValueChange={(v) =>
                        update.mutate({
                          [reciterKey]: v === USE_DEFAULT_VALUE ? '' : v,
                        } as Partial<AppSettings>)
                      }
                    >
                      <SelectTrigger className="h-8 w-50 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={USE_DEFAULT_VALUE}>
                          {t('settings.athan_custom.use_default')} ({globalLabel})
                        </SelectItem>
                        {RECITERS.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {pickName(r, lang).name}
                          </SelectItem>
                        ))}
                        {customList.length > 0 && (
                          <>
                            <div className="border-t my-1" />
                            {customList.map((r) => (
                              <SelectItem
                                key={`custom-${r.id}`}
                                value={buildCustomReciterId(r.id)}
                              >
                                ★ {r.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Custom-reciter management — upload + list + delete. Selecting
              a custom reciter as default or per-prayer happens in the
              Selects above, where they appear with a ★ prefix. */}
          <CustomRecitersPanel />
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t('settings.home_design')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('settings.home_design.hint')}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-md border bg-card/40 p-3">
            <div className="pr-3">
              <Label>{t('settings.passed_dim')}</Label>
              <div className="text-xs text-muted-foreground">
                {t('settings.passed_dim.desc')}
              </div>
            </div>
            <Switch
              checked={(settings.passed_dim_mode ?? 'all') === 'all'}
              onCheckedChange={(v) =>
                update.mutate({ passed_dim_mode: v ? 'all' : 'current' })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-md border bg-card/40 p-3">
            <div className="pr-3">
              <Label>{t('settings.hero_ambient')}</Label>
              <div className="text-xs text-muted-foreground">
                {t('settings.hero_ambient.desc')}
              </div>
            </div>
            <Switch
              checked={settings.hero_ambient === 'true'}
              onCheckedChange={(v) =>
                update.mutate({ hero_ambient: String(v) })
              }
            />
          </div>

          <p className="text-[11px] italic text-muted-foreground">
            {t('settings.home_design.tip_layout')}
          </p>
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t('settings.jumuah')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('settings.jumuah.hint')}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-md border bg-card/40 p-3">
            <div className="pr-3">
              <Label>{t('settings.jumuah.master')}</Label>
              <div className="text-xs text-muted-foreground">
                {t('settings.jumuah.master.desc')}
              </div>
            </div>
            <Switch
              checked={settings.jumuah_enhancements === 'true'}
              onCheckedChange={(v) =>
                update.mutate({ jumuah_enhancements: String(v) })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-md border bg-card/40 p-3">
            <div className="pr-3">
              <Label>{t('settings.jumuah.kahf_alert')}</Label>
              <div className="text-xs text-muted-foreground">
                {t('settings.jumuah.kahf_alert.desc')}
              </div>
            </div>
            <Switch
              checked={settings.jumuah_kahf_alert === 'true'}
              disabled={settings.jumuah_enhancements !== 'true'}
              onCheckedChange={(v) =>
                update.mutate({ jumuah_kahf_alert: String(v) })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-md border bg-card/40 p-3">
            <div className="pr-3">
              <Label>{t('settings.jumuah.pre_alert')}</Label>
              <div className="text-xs text-muted-foreground">
                {t('settings.jumuah.pre_alert.desc')}
              </div>
            </div>
            <Switch
              checked={settings.jumuah_pre_alert === 'true'}
              disabled={settings.jumuah_enhancements !== 'true'}
              onCheckedChange={(v) =>
                update.mutate({ jumuah_pre_alert: String(v) })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-md border bg-card/40 p-3">
            <div className="pr-3">
              <Label>{t('settings.jumuah.acceptance_alert')}</Label>
              <div className="text-xs text-muted-foreground">
                {t('settings.jumuah.acceptance_alert.desc')}
              </div>
            </div>
            <Switch
              checked={settings.jumuah_acceptance_alert === 'true'}
              disabled={settings.jumuah_enhancements !== 'true'}
              onCheckedChange={(v) =>
                update.mutate({ jumuah_acceptance_alert: String(v) })
              }
            />
          </div>

          {/* Preview override — dev/QA aid, lets you see the Friday surface
              on any day without changing the system clock. Tinted dashed
              border so it's visually distinct from real settings. */}
          <div className="flex items-center justify-between rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
            <div className="pr-3">
              <Label className="flex items-center gap-1.5">
                {t('settings.jumuah.preview')}
                <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                  {t('settings.jumuah.preview.badge')}
                </span>
              </Label>
              <div className="text-xs text-muted-foreground">
                {t('settings.jumuah.preview.desc')}
              </div>
            </div>
            <Switch
              checked={settings.jumuah_preview === 'true'}
              disabled={settings.jumuah_enhancements !== 'true'}
              onCheckedChange={(v) =>
                update.mutate({ jumuah_preview: String(v) })
              }
            />
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t('settings.alerts')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('settings.alerts.hint')}
          </p>
        </section>

        {autoLaunch.supported && (
          <>
            <Separator />
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t('settings.system')}
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('settings.auto_launch')}</Label>
                  <div className="text-xs text-muted-foreground">
                    {t('settings.auto_launch.desc')}
                  </div>
                </div>
                <Switch
                  checked={autoLaunch.enabled}
                  disabled={!autoLaunch.ready}
                  onCheckedChange={(v) => autoLaunch.toggle(v)}
                />
              </div>
            </section>
          </>
        )}

        <Separator />

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Diagnostics
          </h3>
          <DiagnosticsPanel />
        </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
