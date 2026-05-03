import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  get() {
    const version =
      (this.db.db.pragma('user_version', { simple: true }) as number) ?? 0;
    return {
      ok: true,
      appVersion: '1.0.0',
      schemaVersion: version,
      now: new Date().toISOString(),
    };
  }
}
