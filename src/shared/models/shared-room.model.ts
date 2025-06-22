import { POLICY_TYPE } from 'src/shared/constants/room.constant'
import { z } from 'zod'

export const RoomSchema = z.object({
  id: z.number().int().positive(),
  hotelId: z.number().int().positive(),
  roomTypeId: z.number().int().positive(),
  price: z.number().min(1).int(),
  quantity: z.number().min(0).int(),
  rangeLimitDate: z.number().min(0).max(7).int().optional().default(0),
  policy: z
    .enum([POLICY_TYPE.NON_REFUNDABLE, POLICY_TYPE.FREE_CANCELLATION, POLICY_TYPE.PAY_AT_HOTEL])
    .optional()
    .default(POLICY_TYPE.NON_REFUNDABLE),
  notePolicy: z.string().max(255).optional(),
  createdAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})

export type RoomType = z.infer<typeof RoomSchema>
