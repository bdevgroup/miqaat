import { Module } from '@nestjs/common';
import { QiblaController } from './qibla.controller';

@Module({ controllers: [QiblaController] })
export class QiblaModule {}
