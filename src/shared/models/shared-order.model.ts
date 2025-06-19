import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { PAYMENT_TYPE } from 'src/shared/constants/payment.constant'
import { z } from 'zod'

export const OrderSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  hotelId: z.number().int().positive(),
  roomId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  checkinDate: z.coerce.date(),
  checkoutDate: z.coerce.date(),
  basePrice: z.number().positive(),
  pointDiscount: z.number().nonnegative().default(0),
  couponId: z.number().int().positive().optional().nullable(),
  couponAmount: z.number().nonnegative().default(0),
  promotionId: z.number().int().positive().optional().nullable(),
  promotionAmount: z.number().nonnegative().default(0),
  vatAmount: z.number().positive(),
  serviceFeeAmount: z.number().positive(),
  totalPrice: z.number().positive(),
  commissionAmount: z.number().positive(),
  status: z
    .enum([
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.FAILED,
      ORDER_STATUS.CANCELED,
      ORDER_STATUS.PENDING_REFUND,
      ORDER_STATUS.REFUNDED,
      ORDER_STATUS.CHECKOUT,
      ORDER_STATUS.NO_SHOW,
    ])
    .default(ORDER_STATUS.PENDING)
    .optional(),
  paymentType: z.enum([PAYMENT_TYPE.BANKING, PAYMENT_TYPE.PAY_AT_HOTEL]),
  arrivalTime: z.coerce.date().optional().nullable(),
  reason: z.string().max(255).optional().nullable(),
  checkoutTime: z.coerce.date().optional().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})

export type OrderType = z.infer<typeof OrderSchema>
