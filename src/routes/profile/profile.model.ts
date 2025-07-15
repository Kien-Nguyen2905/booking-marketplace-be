import { z } from 'zod'
import { UserSchema } from 'src/shared/models/shared-user.model'

export const UpdateMeBodySchema = UserSchema.pick({
  fullName: true,
  phoneNumber: true,
  avatar: true,
  address: true,
  gender: true,
  birthday: true,
  accountNumber: true,
  bankAccount: true,
  bankName: true,
})
  .strict()
  .superRefine((value, ctx) => {
    if (value.phoneNumber && !/^[0-9]+$/.test(value.phoneNumber)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Phone number must contain only numbers',
        path: ['phoneNumber'],
      })
    }
    if (value.phoneNumber && value.phoneNumber.length < 9) {
      ctx.addIssue({
        code: 'custom',
        message: 'Phone number must be at least 9 characters long',
        path: ['phoneNumber'],
      })
    }
    if (value.phoneNumber && value.phoneNumber.length > 20) {
      ctx.addIssue({
        code: 'custom',
        message: 'Phone number must be at most 20 characters long',
        path: ['phoneNumber'],
      })
    }
  })

export const ChangePasswordBodySchema = UserSchema.pick({
  password: true,
})
  .extend({
    newPassword: z.string().min(6).max(100),
    confirmNewPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password must match',
        path: ['confirmNewPassword'],
      })
    }
  })

export type UpdateMeBodyType = z.infer<typeof UpdateMeBodySchema>
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>
