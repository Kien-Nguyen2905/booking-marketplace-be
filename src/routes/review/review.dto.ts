import { createZodDto } from 'nestjs-zod'
import {
  CreateReviewBodySchema,
  CreateReviewResSchema,
  GetReviewsQuerySchema,
  GetReviewsResSchema,
} from 'src/routes/review/review.model'

export class CreateReviewBodyDTO extends createZodDto(CreateReviewBodySchema) {}

export class CreateReviewResDTO extends createZodDto(CreateReviewResSchema) {}

export class GetReviewsQueryDTO extends createZodDto(GetReviewsQuerySchema) {}

export class GetReviewsResDTO extends createZodDto(GetReviewsResSchema) {}
