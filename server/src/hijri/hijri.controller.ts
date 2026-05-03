import { Controller, Get, Query } from '@nestjs/common';
import { HijriService } from './hijri.service';

@Controller('hijri')
export class HijriController {
  constructor(private readonly hijri: HijriService) {}

  @Get()
  get(@Query('date') date?: string) {
    const g = date ?? new Date().toISOString().slice(0, 10);
    return this.hijri.get(g);
  }
}
