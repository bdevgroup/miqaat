import { Module, OnModuleInit } from '@nestjs/common';
import { CustomRecitersController, setDeferredStorageDir } from './custom-reciters.controller';
import { CustomRecitersService } from './custom-reciters.service';

@Module({
  controllers: [CustomRecitersController],
  providers: [CustomRecitersService],
  exports: [CustomRecitersService],
})
export class CustomRecitersModule implements OnModuleInit {
  constructor(private readonly svc: CustomRecitersService) {}

  /**
   * Multer's @UseInterceptors options are evaluated at metadata-collection
   * time (before any service instance exists). To make the upload destination
   * depend on `process.env.DB_PATH` (set by the Electron host), we resolve
   * the directory once during module init and stash it where the controller's
   * Multer config can pick it up.
   */
  onModuleInit() {
    setDeferredStorageDir(this.svc.getDir());
  }
}
