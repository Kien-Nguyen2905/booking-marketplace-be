import { createZodDto } from 'nestjs-zod'
import {
  CreateAmenityBodySchema,
  CreateAmenityResSchema,
  GetAmenitiesResSchema,
  GetAmenityResSchema,
} from 'src/routes/amenity/amenity.model'

export class GetAmenitiesResDTO extends createZodDto(GetAmenitiesResSchema) {}
export class GetAmenityResDTO extends createZodDto(GetAmenityResSchema) {}
export class CreateAmenityBodyDTO extends createZodDto(CreateAmenityBodySchema) {}
export class CreateAmenityResDTO extends createZodDto(CreateAmenityResSchema) {}
