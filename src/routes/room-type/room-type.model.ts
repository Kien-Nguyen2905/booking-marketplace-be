import { AmenitySchema } from 'src/shared/models/shared-amenity.model'
import { RoomBedSchema, RoomTypeSchema } from 'src/shared/models/shared-room-type'
import { z } from 'zod'

export const GetRoomTypeByIdResSchema = RoomTypeSchema.extend({
  roomBed: z.array(RoomBedSchema),
  roomTypeAmenity: z.array(AmenitySchema),
}).strict()

export const GetRoomTypeByHotelIdResSchema = z.array(RoomTypeSchema)

export const CreateRoomTypeBodySchema = RoomTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).strict()

export const CreateRoomTypeResSchema = RoomTypeSchema

export const UpdateRoomTypeBodySchema = RoomTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).strict()

export const UpdateRoomTypeResSchema = RoomTypeSchema

export const DeleteRoomTypeResSchema = RoomTypeSchema

export const CreateRoomBedBodySchema = z
  .object({
    roomBeds: z.array(
      RoomBedSchema.omit({
        roomTypeId: true,
        id: true,
      }).strict(),
    ),
  })
  .strict()

export const CreateRoomBedResSchema = z.array(RoomBedSchema)

export const UpdateRoomBedBodySchema = z
  .object({
    roomBeds: z.array(
      RoomBedSchema.omit({
        roomTypeId: true,
        id: true,
      }).strict(),
    ),
  })
  .strict()

export const UpdateRoomBedResSchema = z.array(RoomBedSchema)

export const CreateRoomTypeAmenitiesBodySchema = z
  .object({
    amenities: z.array(z.number()),
  })
  .strict()

export const CreateRoomTypeAmenitiesResSchema = z.array(AmenitySchema)

export const UpdateRoomTypeAmenitiesBodySchema = z
  .object({
    amenities: z.array(z.number()),
  })
  .strict()

export const UpdateRoomTypeAmenitiesResSchema = z.array(AmenitySchema)

export type GetRoomTypeByIdResType = z.infer<typeof GetRoomTypeByIdResSchema>

export type GetRoomTypeByHotelIdResType = z.infer<typeof GetRoomTypeByHotelIdResSchema>

export type CreateRoomTypeBodyType = z.infer<typeof CreateRoomTypeBodySchema>
export type CreateRoomTypeResType = z.infer<typeof CreateRoomTypeResSchema>

export type UpdateRoomTypeBodyType = z.infer<typeof UpdateRoomTypeBodySchema>
export type UpdateRoomTypeResType = z.infer<typeof UpdateRoomTypeResSchema>

export type DeleteRoomTypeResType = z.infer<typeof DeleteRoomTypeResSchema>

export type CreateRoomBedBodyType = z.infer<typeof CreateRoomBedBodySchema>
export type CreateRoomBedResType = z.infer<typeof CreateRoomBedResSchema>

export type UpdateRoomBedBodyType = z.infer<typeof UpdateRoomBedBodySchema>
export type UpdateRoomBedResType = z.infer<typeof UpdateRoomBedResSchema>

export type CreateRoomTypeAmenitiesBodyType = z.infer<typeof CreateRoomTypeAmenitiesBodySchema>
export type CreateRoomTypeAmenitiesResType = z.infer<typeof CreateRoomTypeAmenitiesResSchema>

export type UpdateRoomTypeAmenitiesBodyType = z.infer<typeof UpdateRoomTypeAmenitiesBodySchema>
export type UpdateRoomTypeAmenitiesResType = z.infer<typeof UpdateRoomTypeAmenitiesResSchema>
