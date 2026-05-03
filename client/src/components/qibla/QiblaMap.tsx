import { useEffect, useRef } from 'react';
import maplibregl, { type StyleSpecification } from 'maplibre-gl';

const MAKKAH: [number, number] = [39.8262, 21.4225];

const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

export function QiblaMap({
  lat,
  lng,
  bearing,
  height = 260,
  fill = false,
}: {
  lat: number;
  lng: number;
  bearing: number;
  /** Fixed pixel height — used when `fill` is false. */
  height?: number;
  /** Fill the parent's height instead of using a fixed pixel value. */
  fill?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [lng, lat],
      zoom: 2,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on('load', () => {
      // User marker
      new maplibregl.Marker({ color: '#0ea5e9' })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup().setText('You'))
        .addTo(map);

      // Makkah marker
      new maplibregl.Marker({ color: '#c2410c' })
        .setLngLat(MAKKAH)
        .setPopup(new maplibregl.Popup().setText('Makkah'))
        .addTo(map);

      // Qibla line
      map.addSource('qibla-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [[lng, lat], MAKKAH],
          },
        },
      });
      map.addLayer({
        id: 'qibla-line',
        type: 'line',
        source: 'qibla-line',
        paint: {
          'line-color': '#0ea5e9',
          'line-width': 2.5,
          'line-dasharray': [2, 1.5],
        },
      });

      // Fit to both points
      const bounds = new maplibregl.LngLatBounds()
        .extend([lng, lat])
        .extend(MAKKAH);
      map.fitBounds(bounds, { padding: 40, duration: 0 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      style={fill ? undefined : { height: `${height}px` }}
      className={`w-full overflow-hidden rounded-md border ${fill ? 'h-full min-h-0 flex-1' : ''}`}
      aria-label={`Qibla map: ${bearing.toFixed(1)} degrees to Makkah`}
    />
  );
}
