import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { Role } from "@afritrade/shared";
import { CurrentUser, type JwtUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UpdatePartnerDto, UpdateShipmentDto, UpsertLogisticsPartnerDto } from "./dto/logistics.dto";
import { LogisticsService } from "./logistics.service";

@Roles(Role.ADMIN)
@Controller("admin")
export class LogisticsController {
  constructor(private readonly logistics: LogisticsService) {}

  @Get("logistics-partners")
  list() {
    return this.logistics.listPartners();
  }

  @Post("logistics-partners")
  create(@Body() dto: UpsertLogisticsPartnerDto) {
    return this.logistics.createPartner(dto);
  }

  @Patch("logistics-partners/:id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdatePartnerDto) {
    return this.logistics.updatePartner(id, dto);
  }

  @Patch("orders/:orderId/shipment")
  updateShipment(
    @CurrentUser() admin: JwtUser,
    @Param("orderId", ParseUUIDPipe) orderId: string,
    @Body() dto: UpdateShipmentDto,
  ) {
    return this.logistics.updateShipment(orderId, admin.sub, dto);
  }
}
