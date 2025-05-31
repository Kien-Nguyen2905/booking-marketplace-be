import { z } from 'zod'
import { AmenitySchema } from 'src/shared/models/shared-amenity.model'

export const GetAmenitiesResSchema = z.array(AmenitySchema)

export const GetAmenityResSchema = AmenitySchema

export const CreateAmenityBodySchema = AmenitySchema.omit({
  id: true,
  createdAt: true,
}).strict()

export const CreateAmenityResSchema = GetAmenityResSchema

export type CreateAmenityBodyType = z.infer<typeof CreateAmenityBodySchema>
export type CreateAmenityResType = z.infer<typeof CreateAmenityResSchema>

export type GetAmenityResType = z.infer<typeof GetAmenityResSchema>
