import { useMemo, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Download } from 'lucide-react';
import { DateTime } from 'luxon';
import { useCurrentLocation } from '@/hooks/useLocations';
import { useSettings } from '@/hooks/useSettings';
import { usePrayerTimesRange } from '@/hooks/usePrayerTimes';
import { PRAYER_ORDER, type PrayerTimesResponse } from '@/types';
import { formatTime } from '@/lib/time';
import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n/useI18n';
import { generateMonthlyPdf, suggestedFilename, formatHijriAscii } from '@/lib/monthlyPdf';
import { toast } from 'sonner';

export function MonthlyCalendarDialog() {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(() => DateTime.now().startOf('month'));
  const { t } = useI18n();

  const { data: location } = useCurrentLocation();
  const { data: settings } = useSettings();

  const from = anchor.toISODate() ?? '';
  const to = anchor.endOf('month').toISODate() ?? '';

  const range = usePrayerTimesRange({
    lat: location?.lat,
    lng: location?.lng,
    from,
    to,
    method: Number(settings?.calc_method ?? 3),
    madhab: Number(settings?.madhab ?? 0),
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

  const tz = location?.timezone ?? settings?.timezone ?? undefined;
  const timeFormat = settings?.time_format ?? '24h';
  const todayISO = DateTime.now().setZone(tz ?? 'local').toISODate();

  const rows = useMemo(() => {
    const daysInMonth = anchor.daysInMonth ?? 30;
    return Array.from({ length: daysInMonth }, (_, i) =>
      anchor.plus({ days: i }).toISODate()!
    );
  }, [anchor]);

  const byDate = useMemo(() => {
    const map = new Map<string, PrayerTimesResponse>();
    for (const r of range.data ?? []) map.set(r.date, r);
    return map;
  }, [range.data]);

  // Hijri labels for each row — built with a hand-coded ASCII formatter
  // so the strings safely survive jsPDF's WinAnsi encoding. Cheap enough
  // to compute on every render of the month.
  const hijriByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of rows) {
      try {
        map.set(d, formatHijriAscii(d));
      } catch {
        map.set(d, '-');
      }
    }
    return map;
  }, [rows]);

  /**
   * Build a real PDF document with jsPDF (vector text, selectable, printable),
   * then trigger a save via Blob URL. No system print dialog, no broken
   * @media print gymnastics — just a downloadable Miqāt-branded sheet.
   */
  const exportPdf = () => {
    if (!location || !range.data || !settings) return;
    try {
      const doc = generateMonthlyPdf({
        anchor,
        rows,
        byDate,
        settings,
        location,
        hijriByDate,
        timeFormat,
        tz,
      });
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = suggestedFilename(anchor, location);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Free the Blob URL on the next tick — the browser keeps the click open.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(t('calendar.pdf.success'));
    } catch (err) {
      console.error('[calendar] PDF export failed:', err);
      toast.error(t('calendar.pdf.failed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <CalendarDays className="h-4 w-4" /> {t('ui.monthly')}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-4 overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center justify-between gap-4">
            <span className="font-display text-2xl">
              {anchor.toFormat('LLLL yyyy')}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => setAnchor(anchor.minus({ months: 1 }).startOf('month'))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAnchor(DateTime.now().startOf('month'))}>
                {t('ui.today')}
              </Button>
              <Button variant="outline" size="icon" onClick={() => setAnchor(anchor.plus({ months: 1 }).startOf('month'))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 gap-1.5"
                onClick={exportPdf}
                disabled={!location || !range.data}
                title={t('calendar.pdf.tooltip')}
              >
                <Download className="h-3.5 w-3.5" />
                {t('calendar.pdf')}
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">{t('calendar.desc')}</DialogDescription>
        </DialogHeader>

        {!location && (
          <div className="shrink-0 rounded-md border bg-card p-4 text-sm text-muted-foreground">
            {t('calendar.pick_location')}
          </div>
        )}

        {location && range.isLoading && (
          <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t('calendar.loading')}
          </div>
        )}

        {location && range.data && (
          <div className="min-h-0 flex-1 overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">{t('calendar.date')}</th>
                  {PRAYER_ORDER.map((p) => (
                    <th key={p} className="px-3 py-2 text-right">
                      {t(`prayer.${p}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => {
                  const row = byDate.get(d);
                  const isToday = d === todayISO;
                  const dt = DateTime.fromISO(d);
                  return (
                    <tr
                      key={d}
                      className={cn(
                        'border-t',
                        isToday && 'bg-primary/5',
                      )}
                    >
                      <td className="px-3 py-1.5">
                        <div className="flex items-baseline gap-2">
                          <span className={cn('font-mono', isToday && 'font-semibold text-primary')}>
                            {dt.toFormat('dd')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {dt.toFormat('ccc')}
                          </span>
                        </div>
                      </td>
                      {PRAYER_ORDER.map((p) => (
                        <td key={p} className="px-3 py-1.5 text-right font-mono tabular-nums">
                          {row ? formatTime(row[p], timeFormat, tz) : '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

