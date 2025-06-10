import { CustomerSchema } from 'src/shared/models/shared-customer.model'
import { z } from 'zod'

export const GetCustomersQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(8),
    search: z.string().optional(),
  })
  .strict()

export const GetCustomersResSchema = z.object({
  data: z.array(CustomerSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetCustomerResSchema = CustomerSchema

export const CreateCustomerBodySchema = CustomerSchema.omit({
  id: true,
  createdAt: true,
}).strict()

export const CreateCustomerResSchema = CustomerSchema

export type GetCustomersQueryType = z.infer<typeof GetCustomersQuerySchema>
export type GetCustomersResType = z.infer<typeof GetCustomersResSchema>

export type GetCustomerResType = z.infer<typeof GetCustomerResSchema>

export type CreateCustomerBodyType = z.infer<typeof CreateCustomerBodySchema>
export type CreateCustomerResType = z.infer<typeof CreateCustomerResSchema>
