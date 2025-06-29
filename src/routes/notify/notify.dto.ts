import { createZodDto } from 'nestjs-zod'
import {
  CreateNotifyBodySchema,
  CreateNotifyResSchema,
  GetNotifiesByRecipientIdResSchema,
  UpdateNotifyReadAtResSchema,
} from './notify.model'

export class CreateNotifyResDTO extends createZodDto(CreateNotifyResSchema) {}
export class CreateNotifyBodyDTO extends createZodDto(CreateNotifyBodySchema) {}

export class GetNotifiesByRecipientIdResDTO extends createZodDto(GetNotifiesByRecipientIdResSchema) {}

export class UpdateNotifyReadAtResDTO extends createZodDto(UpdateNotifyReadAtResSchema) {}
