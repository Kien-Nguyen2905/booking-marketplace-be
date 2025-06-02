import { createZodDto } from 'nestjs-zod'
import {
  CreateRoomBedBodySchema,
  CreateRoomBedResSchema,
  CreateRoomTypeAmenitiesBodySchema,
  CreateRoomTypeAmenitiesResSchema,
  CreateRoomTypeBodySchema,
  CreateRoomTypeResSchema,
  DeleteRoomTypeResSchema,
  GetRoomTypeByHotelIdResSchema,
  GetRoomTypeByIdResSchema,
  UpdateRoomBedBodySchema,
  UpdateRoomBedResSchema,
  UpdateRoomTypeAmenitiesBodySchema,
  UpdateRoomTypeAmenitiesResSchema,
  UpdateRoomTypeBodySchema,
  UpdateRoomTypeResSchema,
} from 'src/routes/room-type/room-type.model'

export class GetRoomTypeByHotelIdResDTO extends createZodDto(GetRoomTypeByHotelIdResSchema) {}

export class CreateRoomTypeBodyDTO extends createZodDto(CreateRoomTypeBodySchema) {}
export class CreateRoomTypeResDTO extends createZodDto(CreateRoomTypeResSchema) {}

export class UpdateRoomTypeBodyDTO extends createZodDto(UpdateRoomTypeBodySchema) {}
export class UpdateRoomTypeResDTO extends createZodDto(UpdateRoomTypeResSchema) {}

export class DeleteRoomTypeResDTO extends createZodDto(DeleteRoomTypeResSchema) {}

export class GetRoomTypeByIdResDTO extends createZodDto(GetRoomTypeByIdResSchema) {}

export class CreateRoomBedBodyDTO extends createZodDto(CreateRoomBedBodySchema) {}
export class CreateRoomBedResDTO extends createZodDto(CreateRoomBedResSchema) {}

export class UpdateRoomBedBodyDTO extends createZodDto(UpdateRoomBedBodySchema) {}
export class UpdateRoomBedResDTO extends createZodDto(UpdateRoomBedResSchema) {}

export class CreateRoomTypeAmenitiesBodyDTO extends createZodDto(CreateRoomTypeAmenitiesBodySchema) {}
export class CreateRoomTypeAmenitiesResDTO extends createZodDto(CreateRoomTypeAmenitiesResSchema) {}

export class UpdateRoomTypeAmenitiesBodyDTO extends createZodDto(UpdateRoomTypeAmenitiesBodySchema) {}
export class UpdateRoomTypeAmenitiesResDTO extends createZodDto(UpdateRoomTypeAmenitiesResSchema) {}
