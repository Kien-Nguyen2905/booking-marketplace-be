import { parse } from 'date-fns'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { toStartOfUTCDate } from 'src/shared/helpers'
import { CustomerSchema } from 'src/shared/models/shared-customer.model'
import { HotelSchema } from 'src/shared/models/shared-hotel.model'
import { OrderSchema } from 'src/shared/models/shared-order.model'
import { ReviewSchema } from 'src/shared/models/shared-review.model'
import { RoleSchema } from 'src/shared/models/shared-role.model'
import { RoomBedSchema, RoomTypeSchema } from 'src/shared/models/shared-room-type'
import { RoomSchema } from 'src/shared/models/shared-room.model'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const GetOrdersQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(8),
    search: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    dateFrom: z
      .string()
      .optional()
      .transform((date) => {
        if (!date) return undefined
        // parse to Date Object
        const parsed = parse(date, 'dd-MM-yyyy', new Date())
        // default convert local to UTC
        return toStartOfUTCDate(parsed) // đưa về 2025-06-07T00:00:00.000Z
      }),
    dateTo: z
      .string()
      .optional()
      .transform((date) => {
        if (!date) return undefined
        // parse to Date Object
        const parsed = parse(date, 'dd-MM-yyyy', new Date())
        // default convert local to UTC
        return toStartOfUTCDate(parsed) // đưa về 2025-06-07T00:00:00.000Z
      }),
    orderBy: z.string().optional(),
    status: z.string().optional(),
    paymentType: z.string().optional(),
  })
  .strict()

export const GetOrdersResSchema = z.object({
  data: z.array(OrderSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetOrderResSchema = OrderSchema

export const GetOrdersByUserIdQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(8),
    dateFrom: z
      .string()
      .optional()
      .transform((date) => {
        if (!date) return undefined
        // parse to Date Object
        const parsed = parse(date, 'dd-MM-yyyy', new Date())
        // default convert local to UTC
        return toStartOfUTCDate(parsed) // đưa về 2025-06-07T00:00:00.000Z
      }),
    dateTo: z
      .string()
      .optional()
      .transform((date) => {
        if (!date) return undefined
        // parse to Date Object
        const parsed = parse(date, 'dd-MM-yyyy', new Date())
        // default convert local to UTC
        return toStartOfUTCDate(parsed) // đưa về 2025-06-07T00:00:00.000Z
      }),
    status: z.string().optional(),
    paymentType: z.string().optional(),
  })
  .strict()

export const GetOrderByIdResSchema = OrderSchema.extend({
  customer: CustomerSchema,
  hotel: HotelSchema,
  room: RoomSchema.extend({
    roomType: RoomTypeSchema.extend({
      roomBed: z.array(RoomBedSchema),
    }),
  }),
  user: UserSchema.extend({
    role: RoleSchema,
  }),
})

export const GetOrdersByUserIdResSchema = z.object({
  data: z.array(
    OrderSchema.extend({
      review: ReviewSchema,
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const CreateOrderBodySchema = OrderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  customerId: true,
  checkoutTime: true,
  status: true,
})
  .extend({
    fullName: z.string().max(100),
    phoneNumber: z.string().max(20),
    email: z.string().email(),
  })
  .strict()
  .superRefine(({ checkinDate, checkoutDate }, ctx) => {
    if (checkinDate > checkoutDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Checkout date must be greater than check-in date',
        path: ['checkoutDate'],
      })
    }
  })

export const CreateOrderResSchema = OrderSchema

export const UpdateOrderBodySchema = OrderSchema.pick({
  status: true,
  reason: true,
})
  .strict()
  .superRefine(({ status, reason }, ctx) => {
    if (status === ORDER_STATUS.CANCELED && !reason) {
      ctx.addIssue({
        code: 'custom',
        message: 'Reason is required',
        path: ['reason'],
      })
    }
    if (status === ORDER_STATUS.PENDING_REFUND && !reason) {
      ctx.addIssue({
        code: 'custom',
        message: 'Reason is required',
        path: ['reason'],
      })
    }
  })

export const UpdateOrderResSchema = OrderSchema

export const ExportPartnerRevenueSchema = z.object({
  dateFrom: z
    .string()
    .optional()
    .transform((date) => {
      if (!date) return undefined
      // parse to Date Object
      const parsed = parse(date, 'dd-MM-yyyy', new Date())
      // default convert local to UTC
      return toStartOfUTCDate(parsed) // đưa về 2025-06-07T00:00:00.000Z
    }),
  dateTo: z
    .string()
    .optional()
    .transform((date) => {
      if (!date) return undefined
      // parse to Date Object
      const parsed = parse(date, 'dd-MM-yyyy', new Date())
      // default convert local to UTC
      return toStartOfUTCDate(parsed) // đưa về 2025-06-07T00:00:00.000Z
    }),
})

export const ExportPartnerRevenueResSchema = z.array(
  z.object({
    startDate: z.string(),
    endDate: z.string(),
    partnerName: z.string(),
    hotelName: z.string(),
    accountNumber: z.string(),
    bankName: z.string(),
    bankAccount: z.string(),
    countOrder: z.number(),
    totalOrderValue: z.number(),
    totalPrice: z.number(),
    hotelPayment: z.number(),
    commissionAmount: z.number(),
    transferAmount: z.number(),
  }),
)

export const FindOrdersExceedQuantitySchema = z.object({
  roomId: z.number(),
  quantity: z.number(),
})

export const FindOrdersExceedQuantityResSchema = z.array(OrderSchema)

export type GetOrdersQueryType = z.infer<typeof GetOrdersQuerySchema>
export type GetOrdersResType = z.infer<typeof GetOrdersResSchema>

export type GetOrderResType = z.infer<typeof GetOrderResSchema>
export type GetOrderByIdResType = z.infer<typeof GetOrderByIdResSchema>

export type GetOrdersByUserIdQueryType = z.infer<typeof GetOrdersByUserIdQuerySchema>
export type GetOrdersByUserIdResType = z.infer<typeof GetOrdersByUserIdResSchema>

export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>
export type CreateOrderResType = z.infer<typeof CreateOrderResSchema>

export type UpdateOrderBodyType = z.infer<typeof UpdateOrderBodySchema>
export type UpdateOrderResType = z.infer<typeof UpdateOrderResSchema>

export type ExportPartnerRevenueType = z.infer<typeof ExportPartnerRevenueSchema>
export type ExportPartnerRevenueResType = z.infer<typeof ExportPartnerRevenueResSchema>

export type FindOrdersExceedQuantityType = z.infer<typeof FindOrdersExceedQuantitySchema>
export type FindOrdersExceedQuantityResType = z.infer<typeof FindOrdersExceedQuantityResSchema>
