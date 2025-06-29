import { NotifySchema } from 'src/shared/models/shared-notify.model'
import { z } from 'zod'

export const GetNotifiesByRecipientIdResSchema = z.object({
  data: z.array(NotifySchema),
  totalItems: z.number(),
  page: z.number().optional(),
  limit: z.number().optional(),
  totalPages: z.number().optional(),
})

export const GetNotifiesByRecipientIdQuerySchema = z
  .object({
    limit: z.coerce.number().int().positive().default(8),
    page: z.coerce.number().int().positive().default(1),
  })
  .strict()

export const CreateNotifyBodySchema = NotifySchema.omit({
  id: true,
  createdAt: true,
  createdById: true,
  readAt: true,
}).strict()

export const CreateNotifyResSchema = NotifySchema

export const UpdateNotifyReadAtResSchema = NotifySchema

export const DeleteNotifyResSchema = NotifySchema

export type GetNotifiesByRecipientIdResType = z.infer<typeof GetNotifiesByRecipientIdResSchema>
export type GetNotifiesByRecipientIdQueryType = z.infer<typeof GetNotifiesByRecipientIdQuerySchema>

export type CreateNotifyBodyType = z.infer<typeof CreateNotifyBodySchema>
export type CreateNotifyResType = z.infer<typeof CreateNotifyResSchema>

export type UpdateNotifyReadAtResType = z.infer<typeof UpdateNotifyReadAtResSchema>
export type DeleteNotifyResType = z.infer<typeof DeleteNotifyResSchema>
