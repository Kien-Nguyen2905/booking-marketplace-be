import { parse } from 'date-fns'
import { toStartOfUTCDate } from 'src/shared/helpers'
import { NotifySchema } from 'src/shared/models/shared-notify.model'
import { PromotionSchema } from 'src/shared/models/shared-promotion.model'
import { z } from 'zod'

export const GetPromotionResSchema = PromotionSchema

export const GetPromotionsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(8),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    dateFrom: z
      .string()
      .optional()
      .transform((date) => {
        if (!date) return undefined
        // parse to Date Object
        const parsed = parse(date, 'dd-MM-yyyy', new Date())
        // default convert local to UTC
        return toStartOfUTCDate(parsed) // đưa về 2025-06-07T00:00:00.000Z
      }),
    dateTo: z
      .string()
      .optional()
      .transform((date) => {
        if (!date) return undefined
        // parse to Date Object
        const parsed = parse(date, 'dd-MM-yyyy', new Date())
        return toStartOfUTCDate(parsed) // đưa về 2025-06-07T00:00:00.000Z
      }),
    orderBy: z.string().optional(),
  })
  .strict()

export const GetPromotionsResSchema = z.object({
  data: z.array(PromotionSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetPromotionByValidFromResSchema = z.object({
  promotions: z.array(PromotionSchema),
  todayPromotions: PromotionSchema,
})

export const CreatePromotionBodySchema = PromotionSchema.omit({
  id: true,
  createdById: true,
  deletedAt: true,
  notifiedAt: true,
  createdAt: true,
  updatedAt: true,
})
  .strict()
  .superRefine(({ validFrom, validUntil }, ctx) => {
    if (validFrom >= validUntil) {
      ctx.addIssue({
        code: 'custom',
        message: 'Until date must be greater than from date',
      })
    }
    if (toStartOfUTCDate(validFrom) <= toStartOfUTCDate(new Date())) {
      ctx.addIssue({
        code: 'custom',
        message: 'Valid from date invalid',
      })
    }
  })

export const CreatePromotionResSchema = PromotionSchema

export const UpdatePromotionBodySchema = CreatePromotionBodySchema

export const UpdatePromotionResSchema = PromotionSchema

export const DeletePromotionResSchema = PromotionSchema

export const CreateNotifyPromotionBodySchema = NotifySchema.omit({
  id: true,
  createdAt: true,
  createdById: true,
  readAt: true,
})
  .extend({
    promotionId: z.number(),
  })
  .strict()

export const CreateNotifyPromotionResSchema = NotifySchema

export type GetPromotionResType = z.infer<typeof GetPromotionResSchema>

export type GetPromotionsResType = z.infer<typeof GetPromotionsResSchema>

export type GetPromotionsQueryType = z.infer<typeof GetPromotionsQuerySchema>

export type CreatePromotionBodyType = z.infer<typeof CreatePromotionBodySchema>
export type CreatePromotionResType = z.infer<typeof CreatePromotionResSchema>

export type UpdatePromotionBodyType = z.infer<typeof UpdatePromotionBodySchema>
export type UpdatePromotionResType = z.infer<typeof UpdatePromotionResSchema>

export type DeletePromotionResType = z.infer<typeof DeletePromotionResSchema>

export type GetPromotionByValidFromResType = z.infer<typeof GetPromotionByValidFromResSchema>

export type CreateNotifyPromotionBodyType = z.infer<typeof CreateNotifyPromotionBodySchema>
export type CreateNotifyPromotionResType = z.infer<typeof CreateNotifyPromotionResSchema>
