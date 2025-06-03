import { createZodDto } from 'nestjs-zod'
import {
  CreateRoomBodySchema,
  CreateRoomResSchema,
  DeleteRoomResSchema,
  GetRoomByIdResSchema,
  GetRoomsByHotelIdResSchema,
  UpdateRoomBodySchema,
  UpdateRoomResSchema,
} from 'src/routes/room/room.model'

export class GetRoomsByHotelIdResDTO extends createZodDto(GetRoomsByHotelIdResSchema) {}
export class GetRoomByIdResDTO extends createZodDto(GetRoomByIdResSchema) {}

export class CreateRoomBodyDTO extends createZodDto(CreateRoomBodySchema) {}
export class CreateRoomResDTO extends createZodDto(CreateRoomResSchema) {}

export class UpdateRoomBodyDTO extends createZodDto(UpdateRoomBodySchema) {}
export class UpdateRoomResDTO extends createZodDto(UpdateRoomResSchema) {}

export class DeleteRoomResDTO extends createZodDto(DeleteRoomResSchema) {}
