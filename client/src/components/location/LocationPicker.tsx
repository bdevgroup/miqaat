import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Search, Navigation, Trash2 } from 'lucide-react';
import {
  useCitySearch, useLocations, useCurrentLocation,
  useSaveLocation, useSetCurrentLocation, useDeleteLocation,
} from '@/hooks/useLocations';
import { toast } from 'sonner';
import { systemTimezone } from '@/lib/time';
import { useI18n } from '@/i18n/useI18n';
import { displayCity } from '@/lib/locationDisplay';
import { requestApproximateLocation } from '@/lib/geo';

export function LocationPicker() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const { t } = useI18n();

  const current = useCurrentLocation();
  const locations = useLocations();
  const search = useCitySearch(q);
  const save = useSaveLocation();
  const setCurrent = useSetCurrentLocation();
  const del = useDeleteLocation();

  const useMyLocation = async () => {
    try {
      const loc = await requestApproximateLocation();
      const cityLabel = loc.city || 'Current location';
      await save.mutateAsync({
        name: loc.city
          ? `${loc.city}${loc.country ? ', ' + loc.country : ''}`
          : 'Current location',
        city: cityLabel,
        country: loc.country ?? '',
        lat: loc.lat,
        lng: loc.lng,
        timezone: loc.timezone || systemTimezone(),
        makeCurrent: true,
      });
      toast.success(loc.source === 'gps' ? 'Location set from GPS' : `Location set: ${cityLabel}`);
      setOpen(false);
    } catch (err) {
      toast.error((err as Error).message || 'Geolocation failed');
    }
  };

  const pickResult = async (r: { city: string; country: string; lat: number; lng: number }) => {
    await save.mutateAsync({
      name: `${r.city}${r.country ? ', ' + r.country : ''}`,
      city: r.city,
      country: r.country,
      lat: r.lat,
      lng: r.lng,
      timezone: systemTimezone(),
      makeCurrent: true,
    });
    toast.success(`Location set: ${r.city}`);
    setOpen(false);
    setQ('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <MapPin className="h-4 w-4" />
              {current.data ? (
                <span className="max-w-45 truncate">
                  {displayCity(current.data, t('loc.gps.current'))}
                  {current.data.country ? `, ${current.data.country}` : ''}
                </span>
              ) : (
                <span>{t('ui.set_location')}</span>
              )}
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {current.data ? (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">
                {displayCity(current.data, t('loc.gps.current'))}
                {current.data.country ? `, ${current.data.country}` : ''}
              </span>
              <span className="font-mono text-[10px] opacity-80">
                {current.data.lat.toFixed(4)}, {current.data.lng.toFixed(4)}
              </span>
              {current.data.timezone && (
                <span className="text-[10px] opacity-70">{current.data.timezone}</span>
              )}
              <span className="mt-1 text-[10px] opacity-60">{t('ui.location.click_change')}</span>
            </div>
          ) : (
            <span>{t('ui.set_location')}</span>
          )}
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('ui.location')}</DialogTitle>
          <DialogDescription>{t('loc.desc')}</DialogDescription>
        </DialogHeader>

        <Button variant="secondary" className="justify-start gap-2" onClick={useMyLocation}>
          <Navigation className="h-4 w-4" />
          {t('ui.use_gps')}
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('ui.search_city')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {search.data && search.data.length > 0 && (
          <Card className="max-h-64 overflow-auto">
            <ul className="divide-y">
              {search.data.map((r, i) => (
                <li
                  key={`${r.lat}-${r.lng}-${i}`}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-accent"
                  onClick={() => pickResult(r)}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.city}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.country} · {r.lat.toFixed(2)}, {r.lng.toFixed(2)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {locations.data && locations.data.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('ui.saved_locations')}
            </div>
            <ul className="flex flex-col gap-1">
              {locations.data.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <button
                    onClick={() => setCurrent.mutate(l.id)}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm font-medium">
                      {displayCity(l, t('loc.gps.current'))}{l.country ? `, ${l.country}` : ''}
                      {l.isCurrent && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase text-primary">
                          {t('ui.current')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {l.lat.toFixed(3)}, {l.lng.toFixed(3)}
                    </div>
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => del.mutate(l.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
