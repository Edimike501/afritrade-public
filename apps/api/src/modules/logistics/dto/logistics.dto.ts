import { createZodDto } from "nestjs-zod";
import { UpdateShipmentSchema, UpsertLogisticsPartnerSchema } from "@afritrade/shared";

export class UpsertLogisticsPartnerDto extends createZodDto(UpsertLogisticsPartnerSchema) {}
export class UpdatePartnerDto extends createZodDto(UpsertLogisticsPartnerSchema.partial()) {}
export class UpdateShipmentDto extends createZodDto(UpdateShipmentSchema) {}
