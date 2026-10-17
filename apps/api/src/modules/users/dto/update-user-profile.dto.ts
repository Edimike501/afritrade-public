import { createZodDto } from "nestjs-zod";
import { UpdateUserProfileSchema } from "@afritrade/shared";

export class UpdateUserProfileDto extends createZodDto(UpdateUserProfileSchema) {}
