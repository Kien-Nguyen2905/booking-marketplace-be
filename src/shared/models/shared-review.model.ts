import { z } from 'zod'

export const ReviewSchema = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive(),
  hotelId: z.number().int().positive(),
  userId: z.number().int().positive(),
  title: z.string().max(255).nonempty(),
  content: z.string().nonempty(),
  image: z.string().nullable(),
  rating: z.number().int().min(1).max(5),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})

export type Review = z.infer<typeof ReviewSchema>
