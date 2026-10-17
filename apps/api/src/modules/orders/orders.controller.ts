import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import { Role } from "@afritrade/shared";
import { CurrentUser, type JwtUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CancelOrderDto, CreateOrderDto, OrderListQueryDto } from "./dto/orders.dto";
import { OrdersService } from "./orders.service";

@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Roles(Role.BUYER)
  @Post("orders")
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.sub, dto);
  }

  @Roles(Role.BUYER)
  @Get("orders")
  mine(@CurrentUser() user: JwtUser, @Query() q: OrderListQueryDto) {
    return this.orders.listForBuyer(user.sub, q.page, q.limit);
  }

  @Roles(Role.SUPPLIER)
  @Get("supplier/orders")
  incoming(@CurrentUser() user: JwtUser, @Query() q: OrderListQueryDto) {
    return this.orders.listForSupplier(user.sub, q.page, q.limit);
  }

  @Roles(Role.ADMIN)
  @Get("admin/orders")
  all(@Query() q: OrderListQueryDto, @Query("status") status?: string) {
    return this.orders.listAll(q.page, q.limit, status);
  }

  // Any authenticated role; the service scopes visibility per role.
  @Get("orders/:id")
  one(@CurrentUser() user: JwtUser, @Param("id", ParseUUIDPipe) id: string) {
    return this.orders.getForUser(id, user.sub, user.role);
  }

  @Post("orders/:id/cancel")
  cancel(
    @CurrentUser() user: JwtUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.orders.cancel(id, user.sub, user.role, dto.reason);
  }
}
