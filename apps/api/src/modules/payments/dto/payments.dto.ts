import { createZodDto } from "nestjs-zod";
import { PaymentInitInputSchema } from "@afritrade/shared";

export class PaymentInitDto extends createZodDto(PaymentInitInputSchema) {}
