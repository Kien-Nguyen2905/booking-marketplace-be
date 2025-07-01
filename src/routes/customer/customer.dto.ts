import { createZodDto } from 'nestjs-zod'
import {
  GetCustomersQuerySchema,
  GetCustomersResSchema,
  GetCustomerResSchema,
} from 'src/routes/customer/customer.model'

export class GetCustomersQueryDTO extends createZodDto(GetCustomersQuerySchema) {}
export class GetCustomersResDTO extends createZodDto(GetCustomersResSchema) {}

export class GetCustomerResDTO extends createZodDto(GetCustomerResSchema) {}
