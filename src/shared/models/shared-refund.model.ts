import { REFUND_STATUS } from 'src/shared/constants/refund.constant'
import { z } from 'zod'

export const RefundSchema = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive(),
  amount: z.number().int().positive(),
  reason: z.string().max(255),
  status: z.enum([REFUND_STATUS.PENDING, REFUND_STATUS.COMPLETED]).default(REFUND_STATUS.PENDING),
  createdById: z.number().int().positive(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})

export type RefundType = z.infer<typeof RefundSchema>
