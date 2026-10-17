import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { KybStatusSchema, Role, KybStatus } from "@afritrade/shared";
import { CurrentUser, type JwtUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { BusinessProfilesService } from "./business-profiles.service";
import {
  KybDecisionDto,
  SubmitKybDto,
  UpdateBusinessDetailsDto,
  UploadKybDocumentDto,
} from "./dto/kyb.dto";

@Controller()
export class BusinessProfilesController {
  constructor(private readonly service: BusinessProfilesService) {}

  @Roles(Role.SUPPLIER)
  @Get("business-profile/me")
  mine(@CurrentUser() user: JwtUser) {
    return this.service.getMine(user.sub);
  }

  @Roles(Role.SUPPLIER)
  @Patch("business-profile/me/details")
  updateDetails(@CurrentUser() user: JwtUser, @Body() dto: UpdateBusinessDetailsDto) {
    return this.service.updateDetails(user.sub, dto);
  }

  @Roles(Role.SUPPLIER)
  @Post("business-profile")
  submit(@CurrentUser() user: JwtUser, @Body() dto: SubmitKybDto) {
    return this.service.submit(user.sub, dto);
  }

  @Roles(Role.SUPPLIER)
  @Put("business-profile/me/kyb")
  updateKyb(@CurrentUser() user: JwtUser, @Body() dto: SubmitKybDto) {
    return this.service.submit(user.sub, dto);
  }

  @Roles(Role.SUPPLIER)
  @Post("business-profile/me/documents")
  uploadDocument(@CurrentUser() user: JwtUser, @Body() dto: UploadKybDocumentDto) {
    return this.service.uploadDocument(user.sub, dto);
  }

  @Roles(Role.SUPPLIER)
  @Get("business-profile/me/documents/:docId/url")
  getSupplierDocUrl(
    @CurrentUser() user: JwtUser,
    @Param("docId", ParseUUIDPipe) docId: string,
  ) {
    return this.service.getSupplierDocumentSignedUrl(user.sub, docId);
  }

  @Roles(Role.SUPPLIER)
  @Delete("business-profile/me/documents/:docId")
  deleteDocument(
    @CurrentUser() user: JwtUser,
    @Param("docId", ParseUUIDPipe) docId: string,
  ) {
    return this.service.deleteDocument(user.sub, docId);
  }

  @Roles(Role.ADMIN)
  @Get("admin/kyb")
  queue(@Query("status") status?: string) {
    const parsed = KybStatusSchema.safeParse(status);
    return this.service.queue(parsed.success ? parsed.data : KybStatus.PENDING);
  }

  @Roles(Role.ADMIN)
  @Get("admin/kyb/documents/:docId/url")
  getAdminDocUrl(
    @CurrentUser() admin: JwtUser,
    @Param("docId", ParseUUIDPipe) docId: string,
  ) {
    return this.service.getAdminDocumentSignedUrl(admin.sub, docId);
  }

  @Roles(Role.ADMIN)
  @Get("admin/kyb/:id")
  getAdminProfile(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.getByIdForAdmin(id);
  }

  @Roles(Role.ADMIN)
  @Post("admin/kyb/:id/decision")
  decide(
    @CurrentUser() admin: JwtUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: KybDecisionDto,
  ) {
    return this.service.decide(id, admin.sub, dto);
  }
}
