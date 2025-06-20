import { parse } from 'date-fns'
import { toStartOfUTCDate } from 'src/shared/helpers'
import { z } from 'zod'

export const DashboardMetricsQuerySchema = z.object({
  dateFrom: z
    .string()
    .optional()
    .transform((date) => {
      if (!date) return undefined
      const parsed = parse(date, 'dd-MM-yyyy', new Date())
      return toStartOfUTCDate(parsed)
    }),
  dateTo: z
    .string()
    .optional()
    .transform((date) => {
      if (!date) return undefined
      const parsed = parse(date, 'dd-MM-yyyy', new Date())
      return toStartOfUTCDate(parsed)
    }),
})

export const DashboardHotelItemSchema = z.object({
  hotelName: z.string(),
  bookings: z.number(),
})

export const DashboardRevenueItemSchema = z.object({
  date: z.string(),
  revenue: z.number(),
})

export const DashboardCommissionItemSchema = z.object({
  date: z.string(),
  commission: z.number(),
})

export const DashboardMetricsResSchema = z.object({
  totalRevenue: z.number(),
  totalCommission: z.number(),
  totalBooked: z.number(),
  totalCanceled: z.number(),
  totalRefunded: z.number(),
  totalRevenueInRange: z.array(DashboardRevenueItemSchema),
  totalCommissionInRange: z.array(DashboardCommissionItemSchema),
  hotels: z.array(DashboardHotelItemSchema),
  totalPartner: z.number(),
  totalPartnerInRange: z.array(z.object({ date: z.string(), profit: z.number() })),
})

export type DashboardMetricsQueryType = z.infer<typeof DashboardMetricsQuerySchema>
export type DashboardMetricsResType = z.infer<typeof DashboardMetricsResSchema>

export const PartnerDashboardMetricsQuerySchema = z.object({
  dateFrom: z
    .string()
    .optional()
    .transform((date) => {
      if (!date) return undefined
      const parsed = parse(date, 'dd-MM-yyyy', new Date())
      return toStartOfUTCDate(parsed)
    }),
  dateTo: z
    .string()
    .optional()
    .transform((date) => {
      if (!date) return undefined
      const parsed = parse(date, 'dd-MM-yyyy', new Date())
      return toStartOfUTCDate(parsed)
    }),
})

export const DashboardRoomTypeItemSchema = z.object({
  roomTypeName: z.string(),
  bookings: z.number(),
})

export const PartnerDashboardMetricsResSchema = z.object({
  totalRevenue: z.number(),
  totalCommission: z.number(),
  totalBooked: z.number(),
  totalCanceled: z.number(),
  totalRefunded: z.number(),
  totalNoShowBanking: z.number(),
  totalNoShowPayAtHotel: z.number(),
  totalCheckout: z.number(),
  totalRevenueInRange: z.array(DashboardRevenueItemSchema),
  roomTypes: z.array(DashboardRoomTypeItemSchema),
})

export type PartnerDashboardMetricsQueryType = z.infer<typeof PartnerDashboardMetricsQuerySchema>
export type PartnerDashboardMetricsResType = z.infer<typeof PartnerDashboardMetricsResSchema>
