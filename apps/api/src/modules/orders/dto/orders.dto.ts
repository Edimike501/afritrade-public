import { createZodDto } from "nestjs-zod";
import { CreateOrderSchema, CancelOrderSchema, PaginatedQuerySchema } from "@afritrade/shared";

export class CreateOrderDto extends createZodDto(CreateOrderSchema) {}
export class CancelOrderDto extends createZodDto(CancelOrderSchema) {}
export class OrderListQueryDto extends createZodDto(PaginatedQuerySchema) {}
