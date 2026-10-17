import { createZodDto } from "nestjs-zod";
import {
  BuyerDashboardDtoSchema,
  SupplierDashboardDtoSchema,
  AdminDashboardDtoSchema,
  type DashboardSummaryDto as SharedDashboardSummaryDto,
} from "@afritrade/shared";

export class BuyerDashboardDto extends createZodDto(BuyerDashboardDtoSchema) {}
export class SupplierDashboardDto extends createZodDto(SupplierDashboardDtoSchema) {}
export class AdminDashboardDto extends createZodDto(AdminDashboardDtoSchema) {}

export type DashboardSummaryDto = SharedDashboardSummaryDto;
