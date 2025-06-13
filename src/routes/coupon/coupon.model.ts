import { CouponSchema } from 'src/shared/models/shared-coupon.model'
import { z } from 'zod'

export const GetCouponsResSchema = z.object({
  data: z.array(CouponSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetCouponsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(8),
    orderBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  })
  .strict()

export const GetCouponResSchema = CouponSchema

export const CreateCouponBodySchema = CouponSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  code: true,
  createdById: true,
  usedCount: true,
}).strict()

export const UpdateCouponBodySchema = CouponSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  code: true,
  createdById: true,
  usedCount: true,
}).strict()

export const CreateCouponResSchema = CouponSchema

export const UpdateCouponResSchema = CouponSchema

export const DeleteCouponResSchema = CouponSchema

export const ValidateCouponBodySchema = z.object({
  code: z.string().nonempty(),
})

export type GetCouponsQueryType = z.infer<typeof GetCouponsQuerySchema>

export type GetCouponsResType = z.infer<typeof GetCouponsResSchema>
export type GetCouponResType = z.infer<typeof GetCouponResSchema>
export type CreateCouponBodyType = z.infer<typeof CreateCouponBodySchema>
export type UpdateCouponBodyType = z.infer<typeof UpdateCouponBodySchema>
export type CreateCouponResType = z.infer<typeof CreateCouponResSchema>
export type UpdateCouponResType = z.infer<typeof UpdateCouponResSchema>
export type DeleteCouponResType = z.infer<typeof DeleteCouponResSchema>

export type ValidateCouponBodyType = z.infer<typeof ValidateCouponBodySchema>
