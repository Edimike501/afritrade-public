import { Controller, Get } from "@nestjs/common";
import { type DashboardSummaryDto } from "@afritrade/shared";
import { CurrentUser, type JwtUser } from "../../common/decorators/current-user.decorator";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  /** One endpoint, role-aware: each role's simple dashboard numbers (PRD §5). */
  @Get("summary")
  summary(@CurrentUser() user: JwtUser): Promise<DashboardSummaryDto> {
    return this.dashboard.summary(user.sub, user.role);
  }
}
