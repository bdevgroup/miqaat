import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { LogoMark } from '@/components/brand/LogoMark';
import { useSaveLocation } from '@/hooks/useLocations';
import { useUpdateSettings } from '@/hooks/useSettings';
import { systemTimezone } from '@/lib/time';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/useI18n';
import { requestApproximateLocation } from '@/lib/geo';

export function Onboarding({ open, onDone }: { open: boolean; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const save = useSaveLocation();
  const update = useUpdateSettings();
  const { t } = useI18n();

  const finish = () => {
    update.mutate({ onboarded: 'true' });
    onDone();
  };

  const useGps = async () => {
    try {
      const loc = await requestApproximateLocation();
      await save.mutateAsync({
        name: loc.city
          ? `${loc.city}${loc.country ? ', ' + loc.country : ''}`
          : 'Current location',
        city: loc.city || 'Current location',
        country: loc.country ?? '',
        lat: loc.lat,
        lng: loc.lng,
        timezone: loc.timezone || systemTimezone(),
        makeCurrent: true,
      });
      toast.success('Location saved');
    } catch (err) {
      toast.error((err as Error).message || 'Geolocation failed');
    } finally {
      setStep(2);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="max-w-lg">
        <DialogTitle className="sr-only">{t('onboard.welcome')}</DialogTitle>
        <DialogDescription className="sr-only">{t('onboard.tagline')}</DialogDescription>
        <div className="flex flex-col items-center gap-4 text-center">
          <LogoMark variant="hero" size={64} />

          {step === 0 && (
            <>
              <h2 className="font-display text-5xl leading-tight">{t('onboard.welcome')}</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {t('onboard.tagline')}
              </p>
              <Button onClick={() => setStep(1)} className="mt-4 gap-2">
                {t('onboard.start')} <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-display text-4xl">{t('onboard.where')}</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {t('onboard.where.desc')}
              </p>
              <div className="mt-4 flex w-full flex-col gap-2">
                <Button onClick={useGps} className="justify-start gap-2">
                  <Navigation className="h-4 w-4" /> {t('onboard.use_gps')}
                </Button>
                <Button variant="secondary" onClick={() => setStep(2)} className="justify-start gap-2">
                  <MapPin className="h-4 w-4" /> {t('onboard.later')}
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-4xl">{t('onboard.ready')}</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {t('onboard.ready.desc')} <SettingsIcon className="inline h-3.5 w-3.5" />
              </p>
              <Button onClick={finish} className="mt-4">{t('onboard.open')}</Button>
            </>
          )}

          <div className="mt-4 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i === step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
