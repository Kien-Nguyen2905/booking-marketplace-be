import { PartnerStatus } from './../constants/partner.constant'
import { z } from 'zod'

export const PartnerSchema = z.object({
  id: z.number(),
  userId: z.number(),
  fullName: z.string().max(255),
  email: z.string().max(255),
  phoneNumber: z.string().max(20),
  idCard: z.string().max(50),
  birth: z.coerce.date(),
  gender: z.string().max(10),
  address: z.string(),
  provinceCode: z.number(),
  districtCode: z.number(),
  wardCode: z.number(),
  companyName: z.string().max(255),
  accountNumber: z.string().max(100),
  bankAccount: z.string().max(100),
  bankName: z.string().max(255),
  commissionRate: z.number(),
  status: z
    .enum([PartnerStatus.PENDING, PartnerStatus.ACCEPTED, PartnerStatus.REJECTED])
    .default(PartnerStatus.PENDING),
  createdById: z.number().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})
export type PartnerType = z.infer<typeof PartnerSchema>
