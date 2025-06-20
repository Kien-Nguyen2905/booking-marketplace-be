import { z } from 'zod'

export const CustomerSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().max(255),
  phoneNumber: z.string().max(20),
  email: z.string().email().max(255),
  createdAt: z.date().nullable(),
})

export type CustomerType = z.infer<typeof CustomerSchema>
