import { PartnerStatus } from './../constants/partner.constant'
import { z } from 'zod'

export const PartnerSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  fullName: z.string().max(255).nonempty(),
  email: z.string().max(255).nonempty(),
  phoneNumber: z.string().max(20).nonempty(),
  idCard: z.string().max(50).nonempty(),
  birthday: z.coerce.date(),
  gender: z.string().max(10).nonempty(),
  address: z.string().nonempty(),
  provinceCode: z.number().int(),
  districtCode: z.number().int(),
  wardCode: z.number().int(),
  companyName: z.string().max(255),
  accountNumber: z.string().max(100).nonempty(),
  bankAccount: z.string().max(100).nonempty(),
  bankName: z.string().max(255).nonempty(),
  commissionRate: z.number(),
  status: z
    .enum([PartnerStatus.PENDING, PartnerStatus.ACCEPTED, PartnerStatus.REJECTED])
    .default(PartnerStatus.PENDING),
  createdById: z.number().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})
export type PartnerType = z.infer<typeof PartnerSchema>
