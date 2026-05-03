import { Module } from '@nestjs/common';
import { HijriController } from './hijri.controller';
import { HijriService } from './hijri.service';

@Module({
  controllers: [HijriController],
  providers: [HijriService],
  exports: [HijriService],
})
export class HijriModule {}
