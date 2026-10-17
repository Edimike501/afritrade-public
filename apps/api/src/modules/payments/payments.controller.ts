import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { Role } from "@afritrade/shared";
import { CurrentUser, type JwtUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { PaymentsService } from "./payments.service";
import { PaymentInitDto } from "./dto/payments.dto";

@Roles(Role.BUYER)
@Controller()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @HttpCode(200)
  @Post("orders/:id/pay")
  pay(@CurrentUser() user: JwtUser, @Param("id", ParseUUIDPipe) id: string) {
    return this.payments.pay(id, user.sub);
  }

  @HttpCode(200)
  @Post("payments/initiate")
  initiate(@CurrentUser() user: JwtUser, @Body() dto: PaymentInitDto) {
    return this.payments.pay(dto.orderId, user.sub);
  }

  @Get("payments/verify/:reference")
  verify(@CurrentUser() user: JwtUser, @Param("reference") reference: string) {
    return this.payments.verify(reference, user.sub);
  }
}
