import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
import { HealthModule } from './health/health.module';
import { SettingsModule } from './settings/settings.module';
import { LocationsModule } from './locations/locations.module';
import { PrayerTimesModule } from './prayer-times/prayer-times.module';
import { HijriModule } from './hijri/hijri.module';
import { QiblaModule } from './qibla/qibla.module';
import { CustomRecitersModule } from './custom-reciters/custom-reciters.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    SettingsModule,
    LocationsModule,
    PrayerTimesModule,
    HijriModule,
    QiblaModule,
    CustomRecitersModule,
  ],
})
export class AppModule {}
