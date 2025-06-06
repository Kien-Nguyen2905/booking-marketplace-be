import { HotelSchema } from 'src/shared/models/shared-hotel.model'
import { WishlistSchema } from 'src/shared/models/shared-wishlist.model'
import { z } from 'zod'

export const GetWishlistsByUserIdResSchema = z.array(WishlistSchema.extend({ hotel: HotelSchema }))

export const CreateWishlistBodySchema = z.object({
  hotelId: z.number().int().positive(),
})
export const CreateWishlistResSchema = WishlistSchema

export const DeleteWishlistResSchema = WishlistSchema

export type GetWishlistsByUserIdResType = z.infer<typeof GetWishlistsByUserIdResSchema>

export type CreateWishlistBodyType = z.infer<typeof CreateWishlistBodySchema>
export type CreateWishlistResType = z.infer<typeof CreateWishlistResSchema>

export type DeleteWishlistResType = z.infer<typeof DeleteWishlistResSchema>
