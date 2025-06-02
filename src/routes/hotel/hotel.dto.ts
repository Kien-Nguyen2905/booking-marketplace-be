import { createZodDto } from 'nestjs-zod'
import {
  CreateHotelAmenitiesBodySchema,
  CreateHotelAmenitiesResSchema,
  CreateHotelBodySchema,
  CreateHotelResSchema,
  GetHotelAmenitiesResSchema,
  GetHotelResSchema,
  GetHotelsQuerySchema,
  GetHotelsResSchema,
  UpdateHotelAmenitiesBodySchema,
  UpdateHotelAmenitiesResSchema,
  UpdateHotelBodySchema,
  UpdateHotelResSchema,
} from 'src/routes/hotel/hotel.model'

export class CreateHotelResDTO extends createZodDto(CreateHotelResSchema) {}
export class CreateHotelBodyDTO extends createZodDto(CreateHotelBodySchema) {}

export class GetHotelResDTO extends createZodDto(GetHotelResSchema) {}

export class UpdateHotelResDTO extends createZodDto(UpdateHotelResSchema) {}
export class UpdateHotelBodyDTO extends createZodDto(UpdateHotelBodySchema) {}

export class GetHotelsResDTO extends createZodDto(GetHotelsResSchema) {}
export class GetHotelsQueryDTO extends createZodDto(GetHotelsQuerySchema) {}

export class CreateHotelAmenitiesBodyDTO extends createZodDto(CreateHotelAmenitiesBodySchema) {}
export class CreateHotelAmenitiesResDTO extends createZodDto(CreateHotelAmenitiesResSchema) {}

export class GetHotelAmenitiesResDTO extends createZodDto(GetHotelAmenitiesResSchema) {}

export class UpdateHotelAmenitiesBodyDTO extends createZodDto(UpdateHotelAmenitiesBodySchema) {}
export class UpdateHotelAmenitiesResDTO extends createZodDto(UpdateHotelAmenitiesResSchema) {}
