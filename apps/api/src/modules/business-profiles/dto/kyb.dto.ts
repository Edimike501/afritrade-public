import { createZodDto } from "nestjs-zod";
import {
  KybDecisionSchema,
  SubmitKybSchema,
  UpdateBusinessDetailsSchema,
  UploadKybDocumentSchema,
} from "@afritrade/shared";

export class SubmitKybDto extends createZodDto(SubmitKybSchema) {}
export class UpdateBusinessDetailsDto extends createZodDto(UpdateBusinessDetailsSchema) {}
export class UploadKybDocumentDto extends createZodDto(UploadKybDocumentSchema) {}
export class KybDecisionDto extends createZodDto(KybDecisionSchema) {}
