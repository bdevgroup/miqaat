import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DiagnosticController } from './diagnostic.controller';
import { PrayerTimesModule } from '../prayer-times/prayer-times.module';

@Module({
  imports: [PrayerTimesModule],
  controllers: [HealthController, DiagnosticController],
})
export class HealthModule {}
