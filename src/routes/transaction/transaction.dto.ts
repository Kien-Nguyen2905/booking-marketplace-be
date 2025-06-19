import { createZodDto } from 'nestjs-zod'
import {
  GetTransactionResSchema,
  GetTransactionsQuerySchema,
  GetTransactionsResSchema,
} from 'src/routes/transaction/transaction.model'

export class GetTransactionsQueryDTO extends createZodDto(GetTransactionsQuerySchema) {}

export class GetTransactionsResDTO extends createZodDto(GetTransactionsResSchema) {}

export class GetTransactionResDTO extends createZodDto(GetTransactionResSchema) {}
