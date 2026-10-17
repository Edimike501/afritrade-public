import { createZodDto } from "nestjs-zod";
import { LoginSchema, RegisterSchema } from "@afritrade/shared";

export class RegisterDto extends createZodDto(RegisterSchema) {}
export class LoginDto extends createZodDto(LoginSchema) {}
