import { createZodDto } from 'nestjs-zod'
import {
  CreateCustomerBodySchema,
  CreateCustomerResSchema,
  GetCustomersQuerySchema,
  GetCustomersResSchema,
  GetCustomerResSchema,
} from 'src/routes/customer/customer.model'

export class GetCustomersQueryDTO extends createZodDto(GetCustomersQuerySchema) {}
export class GetCustomersResDTO extends createZodDto(GetCustomersResSchema) {}

export class GetCustomerResDTO extends createZodDto(GetCustomerResSchema) {}

export class CreateCustomerBodyDTO extends createZodDto(CreateCustomerBodySchema) {}
export class CreateCustomerResDTO extends createZodDto(CreateCustomerResSchema) {}
