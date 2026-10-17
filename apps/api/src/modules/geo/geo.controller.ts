import { Controller, Get } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { GeoService } from "./geo.service";

@Controller()
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  @Public()
  @Get("countries")
  countries() {
    return this.geo.countries();
  }

  @Public()
  @Get("currencies")
  currencies() {
    return this.geo.currencies();
  }

  @Public()
  @Get("currencies/rates")
  rates() {
    return this.geo.rates();
  }
}
