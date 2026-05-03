import { BadRequestException, Controller, Get, Query } from '@nestjs/common';

const MAKKAH_LAT = 21.4225;
const MAKKAH_LNG = 39.8262;

function parseCoord(raw: string, kind: 'lat' | 'lng'): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new BadRequestException(`${kind} must be a finite number`);
  const limit = kind === 'lat' ? 90 : 180;
  if (Math.abs(n) > limit) throw new BadRequestException(`${kind} out of range (±${limit})`);
  return n;
}

function toRad(d: number) { return (d * Math.PI) / 180; }
function toDeg(r: number) { return (r * 180) / Math.PI; }

function bearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  const br = toDeg(Math.atan2(y, x));
  return (br + 360) % 360;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

@Controller('qibla')
export class QiblaController {
  @Get()
  get(@Query('lat') lat: string, @Query('lng') lng: string) {
    const la = parseCoord(lat, 'lat');
    const ln = parseCoord(lng, 'lng');
    return {
      bearing: bearing(la, ln, MAKKAH_LAT, MAKKAH_LNG),
      distanceKm: haversine(la, ln, MAKKAH_LAT, MAKKAH_LNG),
      makkah: { lat: MAKKAH_LAT, lng: MAKKAH_LNG },
    };
  }
}
