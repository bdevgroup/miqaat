import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Compass, Map } from 'lucide-react';
import { useQibla } from '@/hooks/usePrayerTimes';
import { QiblaMap } from './QiblaMap';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/cn';

export function QiblaCard({
  lat,
  lng,
  className,
}: {
  lat?: number;
  lng?: number;
  /** Allow caller to pass `flex-1` so the card grows in a flex column. */
  className?: string;
}) {
  const { data: qibla } = useQibla(lat, lng);
  const { t } = useI18n();

  if (!qibla || lat == null || lng == null) {
    return (
      <Card className={cn('flex flex-col items-center gap-3 p-5', className)}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <Compass className="h-3.5 w-3.5" /> {t('qibla.title')}
        </div>
        <div className="text-sm text-muted-foreground">
          {t('loc.choose')}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('flex flex-col gap-3 p-5', className)}>
      <Tabs defaultValue="arrow" className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Compass className="h-3.5 w-3.5" /> {t('qibla.title')}
          </div>
          <TabsList>
            <TabsTrigger value="arrow">
              <Compass className="mr-1 h-3.5 w-3.5" /> {t('qibla.arrow')}
            </TabsTrigger>
            <TabsTrigger value="map">
              <Map className="mr-1 h-3.5 w-3.5" /> {t('qibla.map')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="arrow"
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4"
        >
          <CompassRose bearing={qibla.bearing} t={t} />
          <div className="text-center">
            <div className="font-mono text-3xl font-medium tabular-nums">
              {qibla.bearing.toFixed(1)}°
            </div>
            <div className="text-xs text-muted-foreground">
              {qibla.distanceKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km {t('qibla.to_makkah')}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="map"
          className="flex min-h-0 flex-1 flex-col gap-2"
        >
          <QiblaMap lat={lat} lng={lng} bearing={qibla.bearing} fill />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('qibla.bearing')}</span>
            <span className="font-mono">{qibla.bearing.toFixed(1)}°</span>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

/**
 * Pure-SVG compass rose. The whole composition (ring, ticks, cardinal
 * letters, arrow) lives in a single 200×200 viewBox so it scales fluidly
 * with the container — no JS sizing, no absolute-positioned labels that
 * fall apart when the card grows. Capped at 280 px max so on tall windows
 * the dial doesn't dominate the screen.
 */
function CompassRose({ bearing, t }: { bearing: number; t: (k: string) => string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="aspect-square h-auto w-full max-w-70"
      role="img"
      aria-label={`Qibla compass: ${bearing.toFixed(1)}°`}
    >
      <defs>
        <marker id="qiblaArrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* Outer ring */}
      <circle
        cx="100" cy="100" r="95"
        fill="none" stroke="currentColor" strokeWidth="1"
        className="text-border"
      />
      {/* Inner ring */}
      <circle
        cx="100" cy="100" r="85"
        fill="none" stroke="currentColor" strokeWidth="0.6"
        opacity="0.6"
        className="text-border"
      />

      {/* 12 ticks every 30° */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 100 + Math.sin(angle) * 88;
        const y1 = 100 - Math.cos(angle) * 88;
        const x2 = 100 + Math.sin(angle) * 92;
        const y2 = 100 - Math.cos(angle) * 92;
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="currentColor" strokeWidth="1"
            opacity={i % 3 === 0 ? 0.7 : 0.35}
            className="text-muted-foreground"
          />
        );
      })}

      {/* N / E / S / W labels — translated per locale (ش / ق / ج / غ in AR) */}
      <text x="100" y="20" textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fontWeight="600" fill="currentColor" className="text-muted-foreground">
        {t('qibla.cardinal.n')}
      </text>
      <text x="180" y="100" textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fontWeight="600" fill="currentColor" className="text-muted-foreground">
        {t('qibla.cardinal.e')}
      </text>
      <text x="100" y="180" textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fontWeight="600" fill="currentColor" className="text-muted-foreground">
        {t('qibla.cardinal.s')}
      </text>
      <text x="20" y="100" textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fontWeight="600" fill="currentColor" className="text-muted-foreground">
        {t('qibla.cardinal.w')}
      </text>

      {/* Bearing arrow — rotates around the centre */}
      <g
        style={{ transform: `rotate(${bearing}deg)`, transformOrigin: '100px 100px', transition: 'transform 600ms ease' }}
      >
        <line
          x1="100" y1="100" x2="100" y2="22"
          stroke="currentColor" strokeWidth="3"
          strokeLinecap="round"
          markerEnd="url(#qiblaArrow)"
          className="text-primary"
        />
        <circle cx="100" cy="100" r="4.5" fill="currentColor" className="text-primary" />
      </g>
    </svg>
  );
}
