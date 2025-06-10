import { z } from 'zod'

export const CustomerSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().max(100),
  phoneNumber: z.string().max(20),
  email: z.string().email(),
  createdAt: z.date().nullable(),
})

export type CustomerType = z.infer<typeof CustomerSchema>
