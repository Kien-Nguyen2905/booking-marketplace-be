import { parse } from 'date-fns'
import { toStartOfUTCDate } from 'src/shared/helpers'
import { TransactionSchema } from 'src/shared/models/shared-transaction.model'
import { z } from 'zod'

export const GetTransactionsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(8),
    search: z.string().optional(),
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
        // default convert local to UTC
        return toStartOfUTCDate(parsed) // đưa về 2025-06-07T00:00:00.000Z
      }),
    orderBy: z.string().optional(),
    type: z.string().optional(),
  })
  .strict()

export const GetTransactionsResSchema = z.object({
  data: z.array(TransactionSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetTransactionResSchema = TransactionSchema

export type GetTransactionsQueryType = z.infer<typeof GetTransactionsQuerySchema>
export type GetTransactionsResType = z.infer<typeof GetTransactionsResSchema>

export type GetTransactionResType = z.infer<typeof GetTransactionResSchema>
