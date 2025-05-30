import { createZodDto } from 'nestjs-zod'
import {
  CreateHotelBodySchema,
  CreateHotelResSchema,
  GetHotelResSchema,
  GetHotelsQuerySchema,
  GetHotelsResSchema,
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
