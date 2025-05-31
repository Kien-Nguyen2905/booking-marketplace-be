import { HotelSchema } from 'src/shared/models/shared-hotel.model'
import { z } from 'zod'

export const GetHotelsResSchema = z.object({
  data: z.array(HotelSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetHotelResSchema = HotelSchema

export const GetHotelsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    orderBy: z.string().optional().default('createdAt'),
    status: z.string().optional(),
  })
  .strict()

export const CreateHotelBodySchema = HotelSchema.omit({
  id: true,
  reputationScore: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
  status: true,
})
  .strict()
  .superRefine(({ vat }, ctx) => {
    if (vat < 0 || vat > 100) {
      ctx.addIssue({
        code: 'custom',
        message: 'VAT must be between 0 and 100',
        path: ['vat'],
      })
    }
  })

export const CreateHotelResSchema = HotelSchema

export const UpdateHotelBodySchema = HotelSchema.omit({
  createdAt: true,
  updatedAt: true,
})
  .strict()
  .superRefine(({ vat }, ctx) => {
    if (vat < 0 || vat > 100) {
      ctx.addIssue({
        code: 'custom',
        message: 'VAT must be between 0 and 100',
        path: ['vat'],
      })
    }
  })
export const UpdateHotelResSchema = HotelSchema

export const HotelAmenitySchema = z.object({
  id: z.number(),
  hotelId: z.number(),
  amenityId: z.number(),
})

export const GetHotelAmenitiesResSchema = z.array(HotelAmenitySchema)

export const CreateHotelAmenityBodySchema = HotelAmenitySchema.omit({
  id: true,
}).strict()

export const CreateHotelAmenityResSchema = HotelAmenitySchema

export const UpdateHotelAmenitiesBodySchema = HotelAmenitySchema.omit({
  id: true,
  amenityId: true,
})
  .extend({
    amenities: z.array(z.number()),
  })
  .strict()

export const UpdateHotelAmenitiesResSchema = GetHotelAmenitiesResSchema

export type GetHotelsQueryType = z.infer<typeof GetHotelsQuerySchema>
export type GetHotelsResType = z.infer<typeof GetHotelsResSchema>
export type CreateHotelBodyType = z.infer<typeof CreateHotelBodySchema>
export type CreateHotelResType = z.infer<typeof CreateHotelResSchema>
export type GetHotelResType = z.infer<typeof GetHotelResSchema>
export type UpdateHotelBodyType = z.infer<typeof UpdateHotelBodySchema>
export type UpdateHotelResType = z.infer<typeof UpdateHotelResSchema>
export type HotelAmenityType = z.infer<typeof HotelAmenitySchema>
export type CreateHotelAmenityBodyType = z.infer<typeof CreateHotelAmenityBodySchema>
export type CreateHotelAmenityResType = z.infer<typeof CreateHotelAmenityResSchema>
export type GetHotelAmenitiesResType = z.infer<typeof GetHotelAmenitiesResSchema>
export type UpdateHotelAmenitiesBodyType = z.infer<typeof UpdateHotelAmenitiesBodySchema>
export type UpdateHotelAmenitiesResType = z.infer<typeof UpdateHotelAmenitiesResSchema>
