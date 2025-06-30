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
        platformProfit: true,
        partnerProfit: true,
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
    const totalPlatformProfit = totalRevenueAgg._sum.platformProfit || 0
    const totalPartnerProfit = totalRevenueAgg._sum.partnerProfit || 0

    // 2. Tổng số đơn đã được đặt
    const totalBooked = await this.prismaService.order.count({
      where: {
        ...dateRangeFilter,
        OR: [{ status: ORDER_STATUS.CONFIRMED }, { status: ORDER_STATUS.CHECKOUT }, { status: ORDER_STATUS.NO_SHOW }],
      },
    })

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
        platformProfit: true,
        partnerProfit: true,
        totalPrice: true,
      },
    })

    const revenueByDateMap = new Map<string, number>()
    const platformProfitByDateMap = new Map<string, number>()
    const partnerProfitByDateMap = new Map<string, number>()

    for (const order of revenueOrders) {
      const dateStr = order.checkoutDate.toISOString().split('T')[0]
      revenueByDateMap.set(dateStr, (revenueByDateMap.get(dateStr) || 0) + order.totalPrice)
      platformProfitByDateMap.set(dateStr, platformProfitByDateMap.get(dateStr) || 0 + order.platformProfit)
      partnerProfitByDateMap.set(dateStr, partnerProfitByDateMap.get(dateStr) || 0 + order.partnerProfit)
    }

    const totalRevenueInRange = Array.from(revenueByDateMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalPlatformProfitInRange = Array.from(platformProfitByDateMap.entries())
      .map(([date, profit]) => ({ date, profit }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalPartnerProfitInRange = Array.from(partnerProfitByDateMap.entries())
      .map(([date, partnerProfit]) => ({ date, partnerProfit }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // 4. Thống kê đối tác/khách sạn
    const ordersInRange = await this.prismaService.order.findMany({
      where: {
        status: {
          in: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CHECKOUT],
        },
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
      totalRevenueInRange,
      totalPartnerProfit,
      totalPartnerProfitInRange,
      totalPlatformProfit,
      totalPlatformProfitInRange,
      totalBooked,
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
    // 1. Get total partner profit for this hotel
    const totalPartnerProfitAgg = await this.prismaService.order.aggregate({
      _sum: {
        partnerProfit: true,
        totalPrice: true,
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

    const totalProfit = totalPartnerProfitAgg._sum.partnerProfit || 0
    const totalRevenue = totalPartnerProfitAgg._sum.totalPrice || 0
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
    const partnerProfitOrders = await this.prismaService.order.findMany({
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
        partnerProfit: true,
      },
    })

    const partnerProfitByDateMap = new Map<string, number>()
    for (const order of partnerProfitOrders) {
      const dateStr = order.checkoutDate.toISOString().split('T')[0]
      partnerProfitByDateMap.set(dateStr, (partnerProfitByDateMap.get(dateStr) || 0) + order.partnerProfit)
    }

    const totalProfitInRange = Array.from(partnerProfitByDateMap.entries())
      .map(([date, profit]) => ({ date, profit }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // 4. Get room type statistics
    const ordersWithRooms = await this.prismaService.order.findMany({
      where: {
        hotelId,
        checkinDate: {
          gte: dateFrom,
          lte: dateTo,
        },
        status: {
          in: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CHECKOUT],
        },
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
      totalProfit,
      totalRevenue,
      totalBooked,
      totalCanceled,
      totalRefunded,
      totalNoShowBanking,
      totalNoShowPayAtHotel,
      totalCheckout,
      totalProfitInRange,
      roomTypes,
    }
  }
}
