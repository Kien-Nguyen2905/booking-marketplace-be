import { RoomSchema } from 'src/shared/models/shared-room.model'
import { z } from 'zod'

export const GetRoomByIdResSchema = RoomSchema

export const GetRoomsByHotelIdResSchema = z.array(RoomSchema)

export const CreateRoomBodySchema = RoomSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).strict()

export const CreateRoomResSchema = RoomSchema

export const UpdateRoomBodySchema = RoomSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).strict()

export const UpdateRoomResSchema = RoomSchema

export const DeleteRoomResSchema = RoomSchema

export type GetRoomByIdResType = z.infer<typeof GetRoomByIdResSchema>

export type GetRoomsByHotelIdResType = z.infer<typeof GetRoomsByHotelIdResSchema>

export type CreateRoomBodyType = z.infer<typeof CreateRoomBodySchema>
export type CreateRoomResType = z.infer<typeof CreateRoomResSchema>

export type UpdateRoomBodyType = z.infer<typeof UpdateRoomBodySchema>
export type UpdateRoomResType = z.infer<typeof UpdateRoomResSchema>

export type DeleteRoomResType = z.infer<typeof DeleteRoomResSchema>
