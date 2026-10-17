import { createZodDto } from "nestjs-zod";
import { CreateProductSchema, ProductQuerySchema, UpdateProductSchema } from "@afritrade/shared";

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
export class ProductQueryDto extends createZodDto(ProductQuerySchema) {}
