import { ROOM_BED_TYPE } from 'src/shared/constants/room.constant'
import { z } from 'zod'

export const RoomTypeSchema = z.object({
  id: z.number().int().positive(),
  hotelId: z.number().int().positive(),
  type: z.string().max(100).nonempty(),
  adults: z.number().int().positive(),
  child: z.number().int().optional().default(0),
  area: z.number().int().positive(),
  serviceFeeRate: z.number().min(0).max(100).int(),
  description: z.string().max(255).nonempty(),
  images: z.array(z.string()).min(3),
  createdAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})

export const RoomTypeAmenitySchema = z.object({
  id: z.number().int().positive(),
  roomTypeId: z.number().int().positive(),
  amenityId: z.number().int().positive(),
})

export const RoomBedSchema = z.object({
  id: z.number().int().positive(),
  roomTypeId: z.number().int().positive(),
  roomBedType: z.enum([
    ROOM_BED_TYPE.KING,
    ROOM_BED_TYPE.QUEEN,
    ROOM_BED_TYPE.DOUBLE,
    ROOM_BED_TYPE.TWIN,
    ROOM_BED_TYPE.SINGLE,
    ROOM_BED_TYPE.BUNK,
  ]),
  quantity: z.number().int().positive(),
})

export type RoomTypeType = z.infer<typeof RoomTypeSchema>
export type RoomTypeAmenityType = z.infer<typeof RoomTypeAmenitySchema>
export type RoomBedType = z.infer<typeof RoomBedSchema>
