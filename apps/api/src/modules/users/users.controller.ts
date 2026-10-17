import { Body, Controller, Get, Patch, Query } from "@nestjs/common";
import { AdminUsersQuerySchema, Role } from "@afritrade/shared";
import { CurrentUser, type JwtUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UsersService } from "./users.service";
import { UpdateUserPreferencesDto } from "./dto/update-user-preferences.dto";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";

@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("users/me")
  me(@CurrentUser() user: JwtUser) {
    return this.users.getAuthUser(user.sub);
  }

  @Get("users/profile")
  profile(@CurrentUser() user: JwtUser) {
    return this.users.getAuthUser(user.sub);
  }

  @Patch("users/me/preferences")
  updatePreferences(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateUserPreferencesDto,
  ) {
    return this.users.updatePreferences(user.sub, dto);
  }

  @Patch("users/profile")
  updateProfile(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.users.updateProfile(user.sub, dto);
  }

  @Roles(Role.ADMIN)
  @Get("admin/users")
  listAdminUsers(
    @Query("role") role?: string,
    @Query("countryCode") countryCode?: string,
    @Query("kybStatus") kybStatus?: string,
    @Query("search") search?: string,
  ) {
    const parsed = AdminUsersQuerySchema.safeParse({
      ...(role ? { role } : {}),
      ...(countryCode ? { countryCode } : {}),
      ...(kybStatus ? { kybStatus } : {}),
      ...(search ? { search } : {}),
    });
    return this.users.listAdminUsers(parsed.success ? parsed.data : {});
  }
}
