import { createZodDto } from 'nestjs-zod'
import { PresignedUploadFileBodySchema, PresignedUploadFileResSchema } from 'src/routes/media/media.model'

export class PresignedUploadFileBodyDTO extends createZodDto(PresignedUploadFileBodySchema) {}

export class PresignedUploadFileResDTO extends createZodDto(PresignedUploadFileResSchema) {}
