import { UserStatus } from 'src/shared/constants/auth.constant'
import { z } from 'zod'
export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email().max(100),
  password: z.string().min(6).max(50),
  fullName: z
    .string()
    .trim()
    .min(6)
    .max(100)
    .regex(/^[A-Za-zÀ-ỹ\s]+$/)
    .nullable(),
  phoneNumber: z.string().min(9).max(20).nullable(),
  avatar: z.string().nullable(),
  totpSecret: z.string().max(255).nullable(),
  uriSecret: z.string().max(255).nullable(),
  address: z.string().nullable(),
  gender: z.string().max(10).nullable(),
  birthday: z.date().nullable(),
  earnPoint: z.number().nullable().default(0),
  accountNumber: z.string().max(100).nullable(),
  bankAccount: z.string().max(100).nullable(),
  bankName: z.string().max(255).nullable(),
  roleId: z.number().int().positive(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE]).nullable().default(UserStatus.ACTIVE),
  createdById: z.number().int().positive().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})

export type UserType = z.infer<typeof UserSchema>
