import { createZodDto } from 'nestjs-zod'
import {
  CreateRefundBodySchema,
  CreateRefundResSchema,
  GetRefundResSchema,
  GetRefundsQuerySchema,
  GetRefundsResSchema,
} from 'src/routes/refund/refund.model'

export class CreateRefundBodyDTO extends createZodDto(CreateRefundBodySchema) {}

export class CreateRefundResDTO extends createZodDto(CreateRefundResSchema) {}

export class GetRefundResDTO extends createZodDto(GetRefundResSchema) {}

export class GetRefundsQueryDTO extends createZodDto(GetRefundsQuerySchema) {}

export class GetRefundsResDTO extends createZodDto(GetRefundsResSchema) {}
