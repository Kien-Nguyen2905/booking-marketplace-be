import { createZodDto } from 'nestjs-zod'
import {
  DeleteFilesBodySchema,
  PresignedUploadFileBodySchema,
  PresignedUploadFileResSchema,
} from 'src/routes/media/media.model'

export class PresignedUploadFileBodyDTO extends createZodDto(PresignedUploadFileBodySchema) {}

export class PresignedUploadFileResDTO extends createZodDto(PresignedUploadFileResSchema) {}

export class DeleteFilesBodyDTO extends createZodDto(DeleteFilesBodySchema) {}
