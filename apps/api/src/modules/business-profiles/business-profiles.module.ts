import { Module } from "@nestjs/common";
import { BusinessProfilesController } from "./business-profiles.controller";
import { BusinessProfilesService } from "./business-profiles.service";
import { R2StorageService } from "./r2-storage.service";

@Module({
  controllers: [BusinessProfilesController],
  providers: [BusinessProfilesService, R2StorageService],
  exports: [BusinessProfilesService, R2StorageService],
})
export class BusinessProfilesModule {}
