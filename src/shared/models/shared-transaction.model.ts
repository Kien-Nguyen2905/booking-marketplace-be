import { TRANSACTION_TYPE } from 'src/shared/constants/transaction.constant'
import { z } from 'zod'

export const TransactionSchema = z.object({
  id: z.number().int().positive(),
  gateway: z.string().max(100),
  transactionDate: z.date(),
  accountNumber: z.string().max(100),
  subAccount: z.string().max(255),
  amount: z.number().int().positive(),
  type: z.enum([TRANSACTION_TYPE.IN, TRANSACTION_TYPE.OUT]),
  accumulated: z.number().int(),
  code: z.string().max(255),
  transactionContent: z.string(),
  referenceNumber: z.string().max(255),
  body: z.string(),
  createdAt: z.date(),
})

export type TransactionType = z.infer<typeof TransactionSchema>
