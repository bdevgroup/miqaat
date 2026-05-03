import { useMemo, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { useHijri } from '@/hooks/usePrayerTimes';
import { useI18n } from '@/i18n/useI18n';

export function DateConverter() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const { data: hijri, isLoading } = useHijri(date);
  const { t, lang } = useI18n();

  const localeFor = lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en';
  const stamp = useMemo(
    () => new Date(date + 'T12:00:00').toLocaleDateString(localeFor, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }),
    [date, localeFor],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" /> {t('ui.converter')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('converter.title')}</DialogTitle>
          <DialogDescription>{t('converter.desc')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label>{t('converter.gregorian')}</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="text-sm text-muted-foreground">{stamp}</div>
        </div>

        <div className="rounded-md border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t('converter.hijri')}
          </div>
          {isLoading && <div className="text-sm text-muted-foreground">{t('converter.computing')}</div>}
          {hijri && (
            <>
              <div className="font-display text-3xl">
                {hijri.day} {lang === 'ar' ? hijri.monthAr : hijri.monthEn}
              </div>
              <div className="text-sm text-muted-foreground">
                {hijri.year} AH · <span dir="rtl">{hijri.monthAr}</span>
              </div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">
                {hijri.hijriDate}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
