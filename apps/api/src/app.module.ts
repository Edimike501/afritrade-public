import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ZodValidationPipe } from "nestjs-zod";

import { validateEnv } from "./config/env.validation";
import { PrismaModule } from "./prisma/prisma.module";
import { ApiResponseFilter } from "./common/filters/api-response.filter";
import { ResponseEnvelopeInterceptor } from "./common/response-envelope.interceptor";
import { DeprecationInterceptor } from "./common/interceptors/deprecation.interceptor";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

import { HealthModule } from "./modules/health/health.module";
import { GeoModule } from "./modules/geo/geo.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { BusinessProfilesModule } from "./modules/business-profiles/business-profiles.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { LogisticsModule } from "./modules/logistics/logistics.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        signOptions: {
          expiresIn: config.get<string>("JWT_EXPIRES_IN") ?? "7d",
        } as any,
      }),
    }),
    PrismaModule,
    HealthModule,
    GeoModule,
    AuthModule,
    UsersModule,
    BusinessProfilesModule,
    CatalogModule,
    PaymentsModule,
    OrdersModule,
    LogisticsModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: ApiResponseFilter },
    { provide: APP_INTERCEPTOR, useClass: DeprecationInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
    // Order matters: rate-limit → authenticate → authorize by role.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
