import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { DatabaseService } from '../common/database.service';

export interface SavedLocation {
  id: number;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string | null;
  isCurrent: boolean;
  createdAt: number;
}

interface DbLocationRow {
  id: number;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string | null;
  is_current: number;
  created_at: number;
}

function rowToLocation(r: DbLocationRow): SavedLocation {
  return {
    id: r.id,
    name: r.name,
    city: r.city,
    country: r.country,
    lat: r.lat,
    lng: r.lng,
    timezone: r.timezone,
    isCurrent: r.is_current === 1,
    createdAt: r.created_at,
  };
}

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(private readonly db: DatabaseService) {}

  list(): SavedLocation[] {
    return (
      this.db.db
        .prepare('SELECT * FROM saved_locations ORDER BY is_current DESC, created_at DESC')
        .all() as DbLocationRow[]
    ).map(rowToLocation);
  }

  getCurrent(): SavedLocation | null {
    const row = this.db.db
      .prepare('SELECT * FROM saved_locations WHERE is_current = 1 LIMIT 1')
      .get() as DbLocationRow | undefined;
    return row ? rowToLocation(row) : null;
  }

  create(input: Omit<SavedLocation, 'id' | 'createdAt' | 'isCurrent'> & { makeCurrent?: boolean }): SavedLocation {
    const now = Date.now();
    const makeCurrent = input.makeCurrent ?? true;

    const tx = this.db.db.transaction(() => {
      if (makeCurrent) {
        this.db.db.prepare('UPDATE saved_locations SET is_current = 0').run();
      }
      const result = this.db.db
        .prepare(
          `INSERT INTO saved_locations
            (name, city, country, lat, lng, timezone, is_current, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          input.name,
          input.city,
          input.country,
          input.lat,
          input.lng,
          input.timezone ?? null,
          makeCurrent ? 1 : 0,
          now,
        );
      return result.lastInsertRowid as number;
    });

    const id = tx();
    return this.get(id);
  }

  get(id: number): SavedLocation {
    const row = this.db.db
      .prepare('SELECT * FROM saved_locations WHERE id = ?')
      .get(id) as DbLocationRow | undefined;
    if (!row) throw new NotFoundException(`Location ${id} not found`);
    return rowToLocation(row);
  }

  delete(id: number): void {
    this.db.db.prepare('DELETE FROM saved_locations WHERE id = ?').run(id);
  }

  setCurrent(id: number): SavedLocation {
    const tx = this.db.db.transaction(() => {
      this.db.db.prepare('UPDATE saved_locations SET is_current = 0').run();
      this.db.db
        .prepare('UPDATE saved_locations SET is_current = 1 WHERE id = ?')
        .run(id);
    });
    tx();
    return this.get(id);
  }

  /**
   * IP-based geolocation fallback for environments where browser geolocation
   * isn't available — Electron's Chromium needs a Google API key for the
   * native "network location" provider, which we don't ship. Calling from
   * the server side means the upstream API sees the user's real public IP
   * (the request originates from their machine).
   *
   * Tries ipapi.co first (1000 req/day free, no key), falls back to ipwho.is
   * (10k/month free, no key) if that fails. City-level accuracy.
   */
  async ipLookup(): Promise<{
    lat: number; lng: number; city: string; country: string; timezone: string | null;
  }> {
    try {
      const res = await axios.get('https://ipapi.co/json/', { timeout: 5000 });
      const d = res.data as Record<string, unknown>;
      const lat = Number(d.latitude); const lng = Number(d.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return {
          lat, lng,
          city: String(d.city ?? ''),
          country: String(d.country_name ?? d.country ?? ''),
          timezone: typeof d.timezone === 'string' ? d.timezone : null,
        };
      }
    } catch (err) {
      this.logger.warn(`ipapi.co failed: ${(err as Error).message}`);
    }
    try {
      const res = await axios.get('https://ipwho.is/', { timeout: 5000 });
      const d = res.data as Record<string, any>;
      if (d.success && Number.isFinite(Number(d.latitude))) {
        return {
          lat: Number(d.latitude), lng: Number(d.longitude),
          city: String(d.city ?? ''),
          country: String(d.country ?? ''),
          timezone: d.timezone?.id ?? null,
        };
      }
    } catch (err) {
      this.logger.warn(`ipwho.is failed: ${(err as Error).message}`);
    }
    throw new NotFoundException('IP geolocation unavailable');
  }

  async search(q: string): Promise<Array<{ city: string; country: string; lat: number; lng: number }>> {
    if (!q || q.length < 2) return [];
    try {
      const url = `https://nominatim.openstreetmap.org/search`;
      const res = await axios.get(url, {
        params: { q, format: 'json', limit: 10, 'accept-language': 'en' },
        headers: {
          'User-Agent': 'Miqaat/1.0 (https://miqaaat.com; contact@miqaaat.com)',
        },
        timeout: 5000,
      });
      return (res.data as any[]).map((r) => ({
        city:
          r.address?.city ||
          r.address?.town ||
          r.address?.village ||
          r.display_name?.split(',')[0] ||
          q,
        country: r.address?.country || '',
        lat: Number(r.lat),
        lng: Number(r.lon),
      }));
    } catch (err) {
      this.logger.warn(`City search failed: ${(err as Error).message}`);
      return [];
    }
  }
}
