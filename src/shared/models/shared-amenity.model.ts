import { AMENITY_CATEGORY } from 'src/shared/constants/amenity.constant'
import { z } from 'zod'

export const AmenitySchema = z.object({
  id: z.number(),
  name: z.string().max(100),
  category: z.enum([AMENITY_CATEGORY.ROOM, AMENITY_CATEGORY.PUBLIC, AMENITY_CATEGORY.SERVICE]),
  createdAt: z.date().nullable(),
})

export type AmenityType = z.infer<typeof AmenitySchema>
