import { Injectable } from '@nestjs/common'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { PAYMENT_TYPE } from 'src/shared/constants/payment.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { DashboardMetricsQueryType, PartnerDashboardMetricsQueryType } from './metric.model'
@Injectable()
export class MetricRepo {
  constructor(private prismaService: PrismaService) {}

  async getDashboardMetrics({ dateFrom, dateTo }: DashboardMetricsQueryType) {
    const dateRangeFilter: any = {}
    if (dateFrom && dateTo) {
      dateRangeFilter.checkoutDate = {
        gte: dateFrom,
        lte: dateTo,
      }
    } else if (dateFrom) {
      dateRangeFilter.checkoutDate = {
        gte: dateFrom,
      }
    } else if (dateTo) {
      dateRangeFilter.checkoutDate = {
        lte: dateTo,
      }
    }
    // 1. Metrics về tổng doanh thu và hoa hồng
    const totalRevenueAgg = await this.prismaService.order.aggregate({
      _sum: {
        commissionAmount: true,
        totalPrice: true,
      },
      where: {
        ...dateRangeFilter,
        OR: [
          { status: ORDER_STATUS.CHECKOUT },
          {
            status: ORDER_STATUS.NO_SHOW,
            paymentType: PAYMENT_TYPE.BANKING,
          },
        ],
      },
    })

    const totalRevenue = totalRevenueAgg._sum.totalPrice || 0
    const totalCommission = totalRevenueAgg._sum.commissionAmount || 0
    const totalPartner = totalRevenue - totalCommission
    // 2. Tổng số đơn đã booking, hủy và hoàn tiền trong khoảng ngày
    const [totalBooked, totalCanceled, totalRefunded] = await Promise.all([
      this.prismaService.order.count({
        where: { ...dateRangeFilter, status: ORDER_STATUS.CONFIRMED },
      }),
      this.prismaService.order.count({
        where: { ...dateRangeFilter, status: ORDER_STATUS.CANCELED },
      }),
      this.prismaService.order.count({
        where: { ...dateRangeFilter, status: ORDER_STATUS.REFUNDED },
      }),
    ])

    // 3. Tổng doanh thu hoa hồng kiếm được theo ngày
    const revenueOrders = await this.prismaService.order.findMany({
      where: {
        ...dateRangeFilter,
        OR: [
          { status: ORDER_STATUS.CHECKOUT },
          {
            status: ORDER_STATUS.NO_SHOW,
            paymentType: PAYMENT_TYPE.BANKING,
          },
        ],
      },
      select: {
        checkoutDate: true,
        commissionAmount: true,
        totalPrice: true,
      },
    })

    const revenueByDateMap = new Map<string, number>()
    const commissionByDateMap = new Map<string, number>()
    const partnerByDateMap = new Map<string, number>()
    for (const order of revenueOrders) {
      const dateStr = order.checkoutDate.toISOString().split('T')[0]
      revenueByDateMap.set(dateStr, (revenueByDateMap.get(dateStr) || 0) + order.totalPrice)
      const commission = order.commissionAmount || 0
      commissionByDateMap.set(dateStr, (commissionByDateMap.get(dateStr) || 0) + commission)
      partnerByDateMap.set(dateStr, (partnerByDateMap.get(dateStr) || 0) + (order.totalPrice - commission))
    }

    const totalRevenueInRange = Array.from(revenueByDateMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalCommissionInRange = Array.from(commissionByDateMap.entries())
      .map(([date, commission]) => ({ date, commission }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalPartnerInRange = Array.from(partnerByDateMap.entries())
      .map(([date, profit]) => ({ date, profit }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // 4. Thống kê đối tác/khách sạn
    const ordersInRange = await this.prismaService.order.findMany({
      where: {
        status: ORDER_STATUS.CONFIRMED,
        checkinDate: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      include: {
        hotel: true,
      },
    })

    const hotelCounter = new Map<string, number>()
    for (const order of ordersInRange) {
      const hotelName = order.hotel.name
      hotelCounter.set(hotelName, (hotelCounter.get(hotelName) || 0) + 1)
    }

    const hotels = Array.from(hotelCounter.entries())
      .map(([hotelName, bookings]) => ({ hotelName, bookings }))
      .sort((a, b) => b.bookings - a.bookings)

    return {
      totalRevenue,
      totalCommission,
      totalPartner,
      totalPartnerInRange,
      totalBooked,
      totalCanceled,
      totalRefunded,
      totalRevenueInRange,
      totalCommissionInRange,
      hotels,
    }
  }

  async getPartnerDashboardMetrics({
    hotelId,
    dateFrom,
    dateTo,
  }: PartnerDashboardMetricsQueryType & { hotelId: number }) {
    const dateRangeFilter: any = { hotelId }

    if (dateFrom && dateTo) {
      dateRangeFilter.checkoutDate = {
        gte: dateFrom,
        lte: dateTo,
      }
    } else if (dateFrom) {
      dateRangeFilter.checkoutDate = {
        gte: dateFrom,
      }
    } else if (dateTo) {
      dateRangeFilter.checkoutDate = {
        lte: dateTo,
      }
    }
    // 1. Get total revenue for this hotel
    const totalRevenueAgg = await this.prismaService.order.aggregate({
      _sum: {
        totalPrice: true,
        commissionAmount: true,
      },
      where: {
        hotelId,
        ...dateRangeFilter,
        OR: [
          { status: ORDER_STATUS.CHECKOUT },
          {
            status: ORDER_STATUS.NO_SHOW,
            paymentType: PAYMENT_TYPE.BANKING,
          },
        ],
      },
    })

    const totalRevenue = totalRevenueAgg._sum.totalPrice || 0
    const totalCommission = totalRevenueAgg._sum.commissionAmount || 0
    // 2. Get booking counts
    const [totalBooked, totalCanceled, totalRefunded, totalNoShowBanking, totalNoShowPayAtHotel, totalCheckout] =
      await Promise.all([
        this.prismaService.order.count({
          where: {
            hotelId,
            createdAt: { gte: dateFrom, lte: dateTo },
            OR: [
              { status: ORDER_STATUS.CONFIRMED },
              { status: ORDER_STATUS.CHECKOUT },
              { status: ORDER_STATUS.NO_SHOW },
            ],
          },
        }),
        this.prismaService.order.count({
          where: { hotelId, createdAt: { gte: dateFrom, lte: dateTo }, status: ORDER_STATUS.CANCELED },
        }),
        this.prismaService.order.count({
          where: { hotelId, createdAt: { gte: dateFrom, lte: dateTo }, status: ORDER_STATUS.REFUNDED },
        }),
        this.prismaService.order.count({
          where: {
            hotelId,
            createdAt: { gte: dateFrom, lte: dateTo },
            OR: [{ status: ORDER_STATUS.NO_SHOW, paymentType: PAYMENT_TYPE.BANKING }],
          },
        }),
        this.prismaService.order.count({
          where: {
            hotelId,
            createdAt: { gte: dateFrom, lte: dateTo },
            OR: [{ status: ORDER_STATUS.NO_SHOW, paymentType: PAYMENT_TYPE.PAY_AT_HOTEL }],
          },
        }),
        this.prismaService.order.count({
          where: {
            hotelId,
            createdAt: { gte: dateFrom, lte: dateTo },
            OR: [{ status: ORDER_STATUS.CHECKOUT }],
          },
        }),
      ])

    // 3. Get daily revenue data
    const revenueOrders = await this.prismaService.order.findMany({
      where: {
        ...dateRangeFilter,
        OR: [
          { status: ORDER_STATUS.CHECKOUT },
          {
            status: ORDER_STATUS.NO_SHOW,
            paymentType: PAYMENT_TYPE.BANKING,
          },
        ],
      },
      select: {
        checkoutDate: true,
        totalPrice: true,
      },
    })

    const revenueByDateMap = new Map<string, number>()
    for (const order of revenueOrders) {
      const dateStr = order.checkoutDate.toISOString().split('T')[0]
      revenueByDateMap.set(dateStr, (revenueByDateMap.get(dateStr) || 0) + order.totalPrice)
    }

    const totalRevenueInRange = Array.from(revenueByDateMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // 4. Get room type statistics
    const ordersWithRooms = await this.prismaService.order.findMany({
      where: {
        hotelId,
        checkinDate: {
          gte: dateFrom,
          lte: dateTo,
        },
        status: ORDER_STATUS.CONFIRMED,
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
      },
    })

    const roomTypeCounter = new Map<string, number>()
    for (const order of ordersWithRooms) {
      const roomTypeName = order.room.roomType.type
      roomTypeCounter.set(roomTypeName, (roomTypeCounter.get(roomTypeName) || 0) + 1)
    }

    const roomTypes = Array.from(roomTypeCounter.entries())
      .map(([roomTypeName, bookings]) => ({ roomTypeName, bookings }))
      .sort((a, b) => b.bookings - a.bookings)

    return {
      totalRevenue,
      totalCommission,
      totalBooked,
      totalCanceled,
      totalRefunded,
      totalNoShowBanking,
      totalNoShowPayAtHotel,
      totalCheckout,
      totalRevenueInRange,
      roomTypes,
    }
  }
}
