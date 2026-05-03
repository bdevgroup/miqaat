import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Minus, Plus, RotateCcw, Globe } from 'lucide-react';
import { PRAYER_ORDER, type AppSettings, type PrayerName } from '@/types';
import { useUpdateSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/cn';

const OFFSET_KEY: Record<PrayerName, keyof AppSettings> = {
  fajr: 'offset_fajr',
  sunrise: 'offset_sunrise',
  dhuhr: 'offset_dhuhr',
  asr: 'offset_asr',
  maghrib: 'offset_maghrib',
  isha: 'offset_isha',
};

const MIN = -60;
const MAX = 60;

/**
 * Common DST/timezone-correction values for the global shift Select. We
 * include hour offsets (the typical case — Morocco summer time, OS tzdata
 * mismatches) plus 30-minute steps for half-hour timezones (India, Iran,
 * Newfoundland) and edge cases.
 */
const GLOBAL_OPTIONS: Array<{ value: number; key: string }> = [
  { value: -120, key: 'settings.offsets.global.minus_2h' },
  { value: -60,  key: 'settings.offsets.global.minus_1h' },
  { value: -30,  key: 'settings.offsets.global.minus_30' },
  { value: 0,    key: 'settings.offsets.global.auto' },
  { value: 30,   key: 'settings.offsets.global.plus_30' },
  { value: 60,   key: 'settings.offsets.global.plus_1h' },
  { value: 120,  key: 'settings.offsets.global.plus_2h' },
];

/**
 * "Time adjustments" subsection of Settings → Calculation. Each prayer
 * gets a ±60 minute offset for fine-tuning against the user's local mosque
 * or community schedule. Offsets are applied server-side after cache lookup
 * (canonical cache stays shared; offsets are a presentation transform), so
 * changes take effect on the next render without invalidating anything else.
 */
export function PrayerOffsetsPanel({ settings }: { settings: AppSettings }) {
  const { t } = useI18n();
  const update = useUpdateSettings();

  const setOffset = (key: keyof AppSettings, value: number) => {
    const clamped = Math.max(MIN, Math.min(MAX, Math.trunc(value || 0)));
    update.mutate({ [key]: String(clamped) } as Partial<AppSettings>);
  };

  const resetAll = () => {
    update.mutate({
      offset_fajr: '0', offset_sunrise: '0', offset_dhuhr: '0',
      offset_asr: '0', offset_maghrib: '0', offset_isha: '0',
      global_offset_min: '0',
    } as Partial<AppSettings>);
  };

  const globalOffset = Number(settings.global_offset_min || '0') || 0;
  const setGlobalOffset = (mins: number) => {
    update.mutate({ global_offset_min: String(mins) } as Partial<AppSettings>);
  };

  const anyNonZero =
    globalOffset !== 0 ||
    PRAYER_ORDER.some(
      (n) => Number((settings[OFFSET_KEY[n]] as string) || '0') !== 0,
    );

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t('settings.offsets.title')}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {t('settings.offsets.subtitle')}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs"
          onClick={resetAll}
          disabled={!anyNonZero}
        >
          <RotateCcw className="h-3 w-3" /> {t('settings.offsets.reset')}
        </Button>
      </div>

      {/* Global shift — applies to ALL prayers in addition to per-prayer
          offsets. Featured row visually distinct from the per-prayer list
          because it's the one that fixes OS-tz mismatches (Morocco
          summer-time problem). */}
      <div
        className={cn(
          'flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2',
          globalOffset !== 0 && 'border-primary/40 bg-primary/5',
        )}
      >
        <div className="flex items-center gap-2">
          <Globe
            className={cn(
              'h-3.5 w-3.5',
              globalOffset !== 0 ? 'text-primary' : 'text-muted-foreground',
            )}
          />
          <div className="flex flex-col">
            <Label className="text-sm font-medium">
              {t('settings.offsets.global.title')}
            </Label>
            <span className="text-[10px] text-muted-foreground">
              {t('settings.offsets.global.subtitle')}
            </span>
          </div>
        </div>
        <Select
          value={String(globalOffset)}
          onValueChange={(v) => setGlobalOffset(Number(v) || 0)}
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GLOBAL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {t(opt.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {t('settings.offsets.per_prayer')}
      </div>

      <ul className="flex flex-col gap-1">
        {PRAYER_ORDER.map((name) => {
          const key = OFFSET_KEY[name];
          const raw = (settings[key] as string) || '0';
          const value = Number(raw) || 0;
          return (
            <li
              key={name}
              className="flex items-center justify-between gap-2 py-1"
            >
              <Label className="text-sm">{t(`prayer.${name}`)}</Label>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setOffset(key, value - 1)}
                  disabled={value <= MIN}
                  aria-label="-1"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={MIN}
                    max={MAX}
                    step={1}
                    value={value}
                    onChange={(e) => setOffset(key, Number(e.target.value))}
                    className={cn(
                      'h-7 w-16 px-2 text-center font-mono text-sm tabular-nums',
                      value > 0 && 'text-emerald-600 dark:text-emerald-400',
                      value < 0 && 'text-amber-600 dark:text-amber-400',
                    )}
                  />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t('settings.offsets.unit')}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setOffset(key, value + 1)}
                  disabled={value >= MAX}
                  aria-label="+1"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[10px] italic text-muted-foreground">
        {t('settings.offsets.hint')}
      </p>
    </div>
  );
}
