import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  getAll() {
    return this.settings.getAll();
  }

  @Patch()
  patch(@Body() body: Record<string, unknown>) {
    const patch: Record<string, string> = {};
    for (const [k, v] of Object.entries(body ?? {})) {
      if (v === null || v === undefined) continue;
      patch[k] = String(v);
    }
    return this.settings.upsertMany(patch);
  }
}
