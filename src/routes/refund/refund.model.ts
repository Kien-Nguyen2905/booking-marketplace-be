import { parse } from 'date-fns'
import { toStartOfUTCDate } from 'src/shared/helpers'
import { OrderSchema } from 'src/shared/models/shared-order.model'
import { RefundSchema } from 'src/shared/models/shared-refund.model'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const GetRefundsResSchema = z.object({
  data: z.array(RefundSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetRefundResSchema = RefundSchema.extend({
  order: OrderSchema.extend({
    user: UserSchema,
  }),
})

export const GetRefundsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(8),
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
        // default convert local to UTC
        return toStartOfUTCDate(parsed) // đưa về 2025-06-07T00:00:00.000Z
      }),
    search: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    orderBy: z.string().optional().default('createdAt'),
    status: z.string().optional(),
  })
  .strict()

export const CreateRefundBodySchema = RefundSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  createdById: true,
}).strict()

export const CreateRefundResSchema = RefundSchema

export type GetRefundsQueryType = z.infer<typeof GetRefundsQuerySchema>
export type GetRefundsResType = z.infer<typeof GetRefundsResSchema>
export type GetRefundResType = z.infer<typeof GetRefundResSchema>
export type CreateRefundBodyType = z.infer<typeof CreateRefundBodySchema>
export type CreateRefundResType = z.infer<typeof CreateRefundResSchema>
