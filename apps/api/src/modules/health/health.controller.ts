import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { HealthResponse } from "@afritrade/shared";
import { Public } from "../../common/decorators/public.decorator";

@Controller({ path: "health", version: [VERSION_NEUTRAL, "1"] })
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  @Public()
  @Get()
  check(): HealthResponse {
    return { status: "ok", commit: this.config.get<string>("RENDER_GIT_COMMIT") ?? "unknown" };
  }
}
