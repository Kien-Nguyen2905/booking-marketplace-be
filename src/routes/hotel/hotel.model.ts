import { AmenitySchema } from 'src/shared/models/shared-amenity.model'
import { HotelSchema } from 'src/shared/models/shared-hotel.model'
import { RoomBedSchema, RoomTypeSchema } from 'src/shared/models/shared-room-type'
import { RoomSchema } from 'src/shared/models/shared-room.model'
import { z } from 'zod'

export const GetHotelsResSchema = z.object({
  data: z.array(HotelSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetHotelResSchema = HotelSchema.extend({
  hotelAmenity: z.array(z.object({ amenity: AmenitySchema })),
  roomType: z.array(
    RoomTypeSchema.extend({
      room: z.array(RoomSchema),
      roomBed: z.array(RoomBedSchema),
      roomTypeAmenity: z.array(z.object({ amenity: AmenitySchema })),
    }),
  ),
})

export const GetHotelsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(8),
    search: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    orderBy: z.string().optional().default('createdAt'),
    status: z.string().optional(),
  })
  .strict()

export const GetFindHotelsQuerySchema = z
  .object({
    province: z.coerce.number().int().positive(),
    start: z.string(),
    end: z.string(),
    adult: z.coerce.number().int().positive(),
    child: z.coerce.number().int().min(0).optional(),
    available: z.coerce.number().int().positive(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(8),
    orderBy: z.string().optional().default('reputationScore'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    type: z.string().optional(),
    rating: z.coerce.number().int().optional(),
    amenity: z.string().optional(),
    lat: z.coerce.number().optional(),
    lon: z.coerce.number().optional(),
  })
  .strict()
export const GetFindHotelsResSchema = z.object({
  data: z.array(
    HotelSchema.extend({
      hotelAmenity: z.array(z.object({ amenity: AmenitySchema })),
      roomType: z.array(
        RoomTypeSchema.extend({
          room: z.array(RoomSchema),
        }),
      ),
      price: z.number(),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

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

export const GetHotelAmenitiesResSchema = z.array(AmenitySchema)

export const CreateHotelAmenitiesBodySchema = z
  .object({
    amenities: z.array(z.number()),
    hotelId: z.number(),
  })
  .strict()

export const CreateHotelAmenitiesResSchema = z.array(AmenitySchema)

export const UpdateHotelAmenitiesBodySchema = z
  .object({
    amenities: z.array(z.number()),
  })
  .strict()

export const UpdateHotelAmenitiesResSchema = GetHotelAmenitiesResSchema

export const GetHotelsByProvinceCodeResSchema = z.array(
  HotelSchema.extend({
    room: z.array(
      RoomSchema.extend({
        roomType: RoomTypeSchema,
      }),
    ),
  }),
)

export const GetQuantityHotelsByProvinceCodeBodySchema = z.object({
  provinceCodes: z.array(z.number()),
})
export const GetQuantityHotelsByProvinceCodeResSchema = z.array(
  z.object({
    provinceCode: z.number(),
    quantity: z.number(),
  }),
)

export type GetHotelsQueryType = z.infer<typeof GetHotelsQuerySchema>
export type GetHotelsResType = z.infer<typeof GetHotelsResSchema>
export type CreateHotelBodyType = z.infer<typeof CreateHotelBodySchema>
export type CreateHotelResType = z.infer<typeof CreateHotelResSchema>
export type GetHotelResType = z.infer<typeof GetHotelResSchema>
export type UpdateHotelBodyType = z.infer<typeof UpdateHotelBodySchema>
export type UpdateHotelResType = z.infer<typeof UpdateHotelResSchema>
export type HotelAmenityType = z.infer<typeof HotelAmenitySchema>
export type CreateHotelAmenitiesBodyType = z.infer<typeof CreateHotelAmenitiesBodySchema>
export type CreateHotelAmenitiesResType = z.infer<typeof CreateHotelAmenitiesResSchema>
export type GetHotelAmenitiesResType = z.infer<typeof GetHotelAmenitiesResSchema>
export type UpdateHotelAmenitiesBodyType = z.infer<typeof UpdateHotelAmenitiesBodySchema>
export type UpdateHotelAmenitiesResType = z.infer<typeof UpdateHotelAmenitiesResSchema>
export type GetHotelsByProvinceCodeResType = z.infer<typeof GetHotelsByProvinceCodeResSchema>
export type GetQuantityHotelsByProvinceCodeBodyType = z.infer<typeof GetQuantityHotelsByProvinceCodeBodySchema>
export type GetQuantityHotelsByProvinceCodeResType = z.infer<typeof GetQuantityHotelsByProvinceCodeResSchema>
export type GetFindHotelsQueryType = z.infer<typeof GetFindHotelsQuerySchema>
export type GetFindHotelsResType = z.infer<typeof GetFindHotelsResSchema>
