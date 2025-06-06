import { z } from 'zod'

export const WishlistSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  hotelId: z.number().int().positive(),
})

export type WishlistType = z.infer<typeof WishlistSchema>
