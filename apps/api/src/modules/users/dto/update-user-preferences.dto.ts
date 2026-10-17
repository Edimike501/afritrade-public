import { createZodDto } from "nestjs-zod";
import { UpdateUserPreferencesSchema } from "@afritrade/shared";

export class UpdateUserPreferencesDto extends createZodDto(UpdateUserPreferencesSchema) {}
