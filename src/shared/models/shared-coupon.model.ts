import { z } from 'zod'

export const CouponSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().max(100),
  description: z.string().max(255),
  code: z.string().max(50),
  amount: z.number().int().positive(),
  percentage: z.number().min(0).max(100).int(),
  available: z.number().int().default(0),
  createdById: z.number().int().positive(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})

export type CouponType = z.infer<typeof CouponSchema>
