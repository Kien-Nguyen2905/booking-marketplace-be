import { z } from 'zod'

export const PromotionSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().max(100).nonempty(),
  percentage: z.number().min(0).max(100),
  sharePercentage: z.number().min(0).max(100),
  validFrom: z.coerce
    .date()
    .min(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())), {
      message: 'Valid from date must be today or later',
    }),
  validUntil: z.coerce.date(),
  createdById: z.number().int().positive(),
  deletedAt: z.date().nullable(),
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.date().nullable(),
})

export type PromotionType = z.infer<typeof PromotionSchema>
