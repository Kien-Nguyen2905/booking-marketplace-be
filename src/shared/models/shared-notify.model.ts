import { NOTIFY_TYPE } from 'src/shared/constants/notify.constant'
import { z } from 'zod'

export const NotifySchema = z.object({
  id: z.number().int().positive(),
  recipientId: z.number().int().positive().nullable(),
  title: z.string().max(100).nonempty(),
  type: z.enum([NOTIFY_TYPE.INFORM, NOTIFY_TYPE.REFUND]),
  message: z.string().nonempty(),
  createdById: z.number().int().positive().nullable(),
  readAt: z.date().nullable(),
  createdAt: z.date().nullable(),
})

export type NotifyType = z.infer<typeof NotifySchema>
