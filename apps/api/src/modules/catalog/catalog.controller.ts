import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { Role } from "@afritrade/shared";
import { CurrentUser, type JwtUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CatalogService } from "./catalog.service";
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from "./dto/catalog.dto";

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Public()
  @Get("products")
  list(@Query() query: ProductQueryDto) {
    return this.catalog.list(query);
  }

  @Roles(Role.SUPPLIER)
  @Get("supplier/products") // declared before :id so "supplier" never matches a product id
  mine(@CurrentUser() user: JwtUser) {
    return this.catalog.listMine(user.sub);
  }

  @Public()
  @Get("products/:id")
  get(@Param("id", ParseUUIDPipe) id: string) {
    return this.catalog.get(id);
  }

  @Roles(Role.SUPPLIER)
  @Post("supplier/products")
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateProductDto) {
    return this.catalog.create(user.sub, dto);
  }

  @Roles(Role.SUPPLIER)
  @Patch("supplier/products/:id")
  update(
    @CurrentUser() user: JwtUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.catalog.update(user.sub, id, dto);
  }
}
