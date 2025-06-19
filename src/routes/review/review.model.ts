import { ReviewSchema } from 'src/shared/models/shared-review.model'
import { z } from 'zod'

export const GetReviewsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()

export const GetReviewsResSchema = z.object({
  data: z.array(ReviewSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetReviewResSchema = ReviewSchema

export const CreateReviewBodySchema = ReviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
}).strict()

export const CreateReviewResSchema = ReviewSchema

export type GetReviewsQueryType = z.infer<typeof GetReviewsQuerySchema>
export type GetReviewsResType = z.infer<typeof GetReviewsResSchema>
export type GetReviewResType = z.infer<typeof GetReviewResSchema>
export type CreateReviewBodyType = z.infer<typeof CreateReviewBodySchema>
export type CreateReviewResType = z.infer<typeof CreateReviewResSchema>
