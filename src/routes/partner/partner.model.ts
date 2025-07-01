import { HotelSchema } from 'src/shared/models/shared-hotel.model'
import { PartnerSchema } from 'src/shared/models/shared-partner.model'
import { z } from 'zod'

export const GetPartnerByUserIdResSchema = PartnerSchema.extend({
  hotel: HotelSchema,
})

export const GetPartnerByIdResSchema = GetPartnerByUserIdResSchema

export const GetPartnersResSchema = z.object({
  data: z.array(PartnerSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetPartnersQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    status: z.string().optional(),
  })
  .strict()

export const CreatePartnerBodySchema = PartnerSchema.pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  idCard: true,
  birthday: true,
  gender: true,
  address: true,
  provinceCode: true,
  districtCode: true,
  wardCode: true,
  companyName: true,
  accountNumber: true,
  bankAccount: true,
  bankName: true,
})
  .extend({
    code: z.string().length(6),
  })
  .strict()
export const CreatePartnerResSchema = PartnerSchema

export const UpdatePartnerBodySchema = CreatePartnerBodySchema

export const UpdatePartnerResSchema = PartnerSchema

export const UpdatePartnerStatusBodySchema = PartnerSchema.pick({
  status: true,
  userId: true,
})

export const UpdatePartnerStatusResSchema = PartnerSchema

export const UpdatePartnerByAdminBodySchema = UpdatePartnerBodySchema.omit({
  code: true,
})

export const UpdatePartnerByAdminResSchema = PartnerSchema

export type GetPartnerByUserIdResType = z.infer<typeof GetPartnerByUserIdResSchema>
export type GetPartnersResType = z.infer<typeof GetPartnersResSchema>
export type GetPartnersQueryType = z.infer<typeof GetPartnersQuerySchema>
export type CreatePartnerBodyType = z.infer<typeof CreatePartnerBodySchema>
export type UpdatePartnerBodyType = z.infer<typeof UpdatePartnerBodySchema>
export type CreatePartnerResType = z.infer<typeof CreatePartnerResSchema>
export type UpdatePartnerResType = z.infer<typeof UpdatePartnerResSchema>
export type UpdatePartnerStatusBodyType = z.infer<typeof UpdatePartnerStatusBodySchema>
export type UpdatePartnerStatusResType = z.infer<typeof UpdatePartnerStatusResSchema>
export type GetPartnerByIdResType = z.infer<typeof GetPartnerByIdResSchema>
export type UpdatePartnerByAdminBodyType = z.infer<typeof UpdatePartnerByAdminBodySchema>
export type UpdatePartnerByAdminResType = z.infer<typeof UpdatePartnerByAdminResSchema>
