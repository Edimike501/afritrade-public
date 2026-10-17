import { SetMetadata } from "@nestjs/common";
import type { Role } from "@afritrade/shared";
export const ROLES_KEY = "roles";
/** Restrict a route to specific roles. No decorator = any authenticated user. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
