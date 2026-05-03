import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PrayerTimesService, type PrayerOffsets } from './prayer-times.service';

function optionalNumber(v: string | undefined): number | undefined {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Validate a coordinate string is a finite number in the legal range.
 * Without this, a request with `lat=NaN` or `lng=Infinity` would propagate
 * into adhan-js and produce garbage timings (Date objects with NaN ms),
 * which then poison the cache. Reject at the boundary instead.
 */
function parseCoord(raw: string, kind: 'lat' | 'lng'): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new BadRequestException(`${kind} must be a finite number`);
  }
  const limit = kind === 'lat' ? 90 : 180;
  if (Math.abs(n) > limit) {
    throw new BadRequestException(`${kind} out of range (±${limit})`);
  }
  return n;
}

/**
 * Parse the per-prayer + global offset query params. Names are kept short
 * so the URL doesn't bloat: `of`/`os`/`od`/`oa`/`om`/`oi` for the six
 * prayers (fajr/sunrise/dhuhr/asr/maghrib/isha), `og` for the global shift.
 * Values are minute offsets — ±60 per prayer, ±120 global.
 */
function parseOffsets(q: {
  of?: string; os?: string; od?: string; oa?: string; om?: string; oi?: string;
  og?: string;
}): PrayerOffsets | undefined {
  const out: PrayerOffsets = {
    fajr:    optionalNumber(q.of),
    sunrise: optionalNumber(q.os),
    dhuhr:   optionalNumber(q.od),
    asr:     optionalNumber(q.oa),
    maghrib: optionalNumber(q.om),
    isha:    optionalNumber(q.oi),
    global:  optionalNumber(q.og),
  };
  const anySet = Object.values(out).some((v) => v != null && v !== 0);
  return anySet ? out : undefined;
}

@Controller('prayer-times')
export class PrayerTimesController {
  constructor(private readonly prayerTimes: PrayerTimesService) {}

  @Get()
  async get(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('date') date: string,
    @Query('method') method: string,
    @Query('madhab') madhab: string,
    // Custom-angle overrides — only honoured when method === 0.
    @Query('fa') fa: string,
    @Query('ia') ia: string,
    @Query('ii') ii: string,
    // Per-prayer minute offsets, ±60 max.
    @Query('of') of_: string,
    @Query('os') os: string,
    @Query('od') od: string,
    @Query('oa') oa: string,
    @Query('om') om: string,
    @Query('oi') oi: string,
    @Query('og') og: string,
  ) {
    const todayISO = new Date().toISOString().slice(0, 10);
    return this.prayerTimes.get({
      lat: parseCoord(lat, 'lat'),
      lng: parseCoord(lng, 'lng'),
      date: date || todayISO,
      method: Number(method ?? 3),
      madhab: Number(madhab ?? 0),
      customFajrAngle: optionalNumber(fa),
      customIshaAngle: optionalNumber(ia),
      customIshaInterval: optionalNumber(ii),
      offsets: parseOffsets({ of: of_, os, od, oa, om, oi, og }),
    });
  }

  @Get('range')
  async range(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('method') method: string,
    @Query('madhab') madhab: string,
    @Query('fa') fa: string,
    @Query('ia') ia: string,
    @Query('ii') ii: string,
    @Query('of') of_: string,
    @Query('os') os: string,
    @Query('od') od: string,
    @Query('oa') oa: string,
    @Query('om') om: string,
    @Query('oi') oi: string,
    @Query('og') og: string,
  ) {
    return this.prayerTimes.getRange({
      lat: parseCoord(lat, 'lat'),
      lng: parseCoord(lng, 'lng'),
      from,
      to,
      method: Number(method ?? 3),
      madhab: Number(madhab ?? 0),
      customFajrAngle: optionalNumber(fa),
      customIshaAngle: optionalNumber(ia),
      customIshaInterval: optionalNumber(ii),
      offsets: parseOffsets({ of: of_, os, od, oa, om, oi, og }),
    });
  }
}
