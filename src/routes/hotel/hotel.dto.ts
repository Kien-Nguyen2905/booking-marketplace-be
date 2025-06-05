import { createZodDto } from 'nestjs-zod'
import {
  CreateHotelAmenitiesBodySchema,
  CreateHotelAmenitiesResSchema,
  CreateHotelBodySchema,
  CreateHotelResSchema,
  GetFindHotelsQuerySchema,
  GetFindHotelsResSchema,
  GetHotelAmenitiesResSchema,
  GetHotelResSchema,
  GetHotelsByProvinceCodeResSchema,
  GetHotelsQuerySchema,
  GetHotelsResSchema,
  GetQuantityHotelsByProvinceCodeBodySchema,
  GetQuantityHotelsByProvinceCodeResSchema,
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

export class GetHotelsByProvinceCodeResDTO extends createZodDto(GetHotelsByProvinceCodeResSchema) {}

export class GetQuantityHotelsByProvinceCodeBodyDTO extends createZodDto(GetQuantityHotelsByProvinceCodeBodySchema) {}
export class GetQuantityHotelsByProvinceCodeResDTO extends createZodDto(GetQuantityHotelsByProvinceCodeResSchema) {}

export class GetFindHotelsQueryDTO extends createZodDto(GetFindHotelsQuerySchema) {}
export class GetFindHotelsResDTO extends createZodDto(GetFindHotelsResSchema) {}
