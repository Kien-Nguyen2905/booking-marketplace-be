import { UserStatus } from 'src/shared/constants/auth.constant'
import { PartnerStatus } from 'src/shared/constants/partner.constant'
import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { RoleSchema } from 'src/shared/models/shared-role.model'
import { z } from 'zod'
export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email().max(100),
  password: z.string().min(6).max(50),
  fullName: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[A-Za-zÀ-ỹ\s]+$/)
    .nullable(),
  phoneNumber: z.string().min(9).max(20).nullable(),
  avatar: z.string().nullable(),
  totpSecret: z.string().max(255).nullable(),
  uriSecret: z.string().max(255).nullable(),
  address: z.string().nullable(),
  gender: z.string().max(10).nullable(),
  birthday: z.coerce.date().nullable(),
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

/**
 * Áp dụng cho Response của api GET('profile') và GET('users/:userId')
 */
export const GetUserProfileResSchema = UserSchema.omit({
  password: true,
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
  }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        name: true,
        path: true,
        method: true,
      }),
    ),
  }),
  partnerStatus: z
    .enum([PartnerStatus.PENDING, PartnerStatus.ACCEPTED, PartnerStatus.REJECTED])
    .nullable()
    .default(PartnerStatus.PENDING),
})

/**
 * Áp dụng cho Response của api PUT('profile') và PUT('users/:userId')
 */
export const UpdateProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export type UserType = z.infer<typeof UserSchema>
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>
export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>
