import { BadRequestException, Injectable } from '@nestjs/common'
import { eachDayOfInterval, format, subDays } from 'date-fns'
import { CouponNotFoundException, CouponUpdatedException } from 'src/routes/coupon/coupon.error'
import { HotelNotFoundException, HotelUpdatedException } from 'src/routes/hotel/hotel.error'
import { ConflictRoomAvailabilityException } from 'src/routes/order/order.error'
import {
  CreateOrderBodyType,
  ExportPartnerRevenueType,
  GetOrdersByUserIdQueryType,
  GetOrdersQueryType,
} from 'src/routes/order/order.model'
import { PromotionNotFoundException, PromotionUpdatedException } from 'src/routes/promotion/promotion.error'
import { RoomTypeUpdatedException } from 'src/routes/room-type/room-type.error'
import { RoomNotFoundException, RoomUpdatedException } from 'src/routes/room/room.error'
import { HotelStatus } from 'src/shared/constants/hotel.constant'
import { ORDER_STATUS, OrderStatusType, REPUTATION_SCORE } from 'src/shared/constants/order.constant'
import { POINT_VALUE } from 'src/shared/constants/other.constant'
import { PAYMENT_TYPE, PaymentType } from 'src/shared/constants/payment.constant'
import { toStartOfUTCDate } from 'src/shared/helpers'
import { OrderProducer } from 'src/shared/producers/order.producer'
import { PrismaService } from 'src/shared/services/prisma.service'
@Injectable()
export class OrderRepo {
  constructor(
    private prismaService: PrismaService,
    private orderProducer: OrderProducer,
  ) {}

  async list({
    limit,
    page,
    order = 'desc',
    orderBy = 'createdAt',
    dateFrom,
    dateTo,
    search,
    status,
    paymentType,
    hotelId,
  }: GetOrdersQueryType & { hotelId?: number }) {
    const skip = (page - 1) * limit
    const take = limit

    const where: any = {}
    if (dateFrom && dateTo) {
      // Nếu có cả hai: nằm trong khoảng
      where.AND = [{ checkinDate: { equals: dateFrom } }, { checkoutDate: { lte: dateTo } }]
    } else if (dateFrom) {
      // Nếu chỉ có dateFrom
      where.checkinDate = { equals: dateFrom }
    }
    if (search) {
      where.OR = [{ id: { equals: Number(search) } }]
    }
    if (status) {
      where.status = status.toUpperCase() as OrderStatusType
    }
    if (paymentType) {
      where.paymentType = paymentType.toUpperCase() as PaymentType
    }
    if (hotelId) {
      where.hotelId = hotelId
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.order.count({ where }),
      this.prismaService.order.findMany({
        skip,
        take,
        where,
        orderBy: {
          [orderBy]: order,
        },
      }),
    ])

    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async findOrdersByUserId(
    { limit, page, dateFrom, dateTo, status, paymentType }: GetOrdersByUserIdQueryType,
    userId: number,
  ) {
    const skip = (page - 1) * limit
    const take = limit

    const where: any = {
      userId,
    }
    if (dateFrom && dateTo) {
      // Nếu có cả hai: nằm trong khoảng
      where.AND = [{ checkinDate: { equals: dateFrom } }, { checkoutDate: { lte: dateTo } }]
    } else if (dateFrom) {
      // Nếu chỉ có dateFrom
      where.checkinDate = { equals: dateFrom }
    }
    if (status) {
      where.status = status.toUpperCase() as OrderStatusType
    }
    if (paymentType) {
      where.paymentType = paymentType.toUpperCase() as PaymentType
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.order.count({ where }),
      this.prismaService.order.findMany({
        skip,
        take,
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          review: true,
        },
      }),
    ])

    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async findById(id: number) {
    return await this.prismaService.order.findUnique({
      where: {
        id,
      },
      include: {
        customer: true,
        hotel: true,
        room: {
          include: {
            roomType: {
              include: {
                roomBed: true,
              },
            },
          },
        },
        user: {
          include: {
            role: true,
          },
        },
      },
    })
  }

  async create({ data }: { data: CreateOrderBodyType & { userId: number } }) {
    const {
      roomId,
      quantity,
      basePrice,
      couponId,
      paymentType,
      userId,
      hotelId,
      pointDiscount,
      couponAmount,
      promotionId,
      fullName,
      phoneNumber,
      email,
      vatAmount,
      serviceFeeAmount,
      totalPrice,
      platformProfit,
      partnerProfit,
      promotionAmount,
      arrivalTime,
      version,
    } = data
    const checkinDate = toStartOfUTCDate(data.checkinDate)
    const checkoutDate = toStartOfUTCDate(data.checkoutDate)

    // Lấy danh sách tất cả các ngày trong khoảng thời gian
    const dateRange = eachDayOfInterval({ start: checkinDate, end: subDays(checkoutDate, 1) })

    //1 . Kiểm tra hotel tồn tại và version
    const hotel = await this.prismaService.hotel.findUnique({
      where: { id: hotelId, status: HotelStatus.ACTIVE },
      select: {
        partner: true,
        updatedAt: true,
      },
    })

    if (!hotel) {
      throw HotelNotFoundException
    }

    if (new Date(hotel.updatedAt || '').getTime() !== new Date(version.hotel).getTime()) {
      throw HotelUpdatedException
    }

    //2 . Kiểm tra phòng tồn tại và version
    const room = await this.prismaService.room.findUnique({
      where: { id: roomId, hotelId: hotelId, deletedAt: null },
      include: {
        roomType: true,
      },
    })

    if (!room) {
      throw RoomNotFoundException
    }
    if (new Date(room.updatedAt || '').getTime() !== new Date(version.room).getTime()) {
      throw RoomUpdatedException
    }
    if (new Date(room.roomType.updatedAt || '').getTime() !== new Date(version.roomType).getTime()) {
      throw RoomTypeUpdatedException
    }
    if (room.rangeLimitDate && room.rangeLimitDate < dateRange.length) {
      throw new BadRequestException('Cannot book more than ' + room.rangeLimitDate + ' nights')
    }

    //3. Kiểm tra còn phòng đủ không
    const roomAvailabilities = await this.prismaService.roomAvailability.findMany({
      where: {
        roomId,
        createdAt: {
          gte: checkinDate,
          lt: checkoutDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        availableRooms: true,
        version: true,
      },
    })
    // Tạo map từ ngày sang số phòng trống
    const availabilityMap = new Map<string, (typeof roomAvailabilities)[0]>()
    roomAvailabilities.forEach((ra) => {
      const dateStr = format(toStartOfUTCDate(ra.createdAt!), 'yyyy-MM-dd')
      availabilityMap.set(dateStr, ra)
    })

    // Kiểm tra số phòng trống cho từng ngày
    for (const date of dateRange) {
      const dateStr = format(date, 'yyyy-MM-dd')
      const availableRooms = availabilityMap.has(dateStr) ? availabilityMap.get(dateStr)!.availableRooms : room.quantity
      if (availableRooms < quantity) {
        throw new BadRequestException(`Not enough rooms available on ${dateStr}`)
      }
    }

    //4. Kiểm tra coupon và version
    if (couponId) {
      const coupon = await this.prismaService.coupon.findUnique({
        where: { id: couponId, deletedAt: null, available: { gt: 0 } },
      })
      if (!coupon) {
        throw CouponNotFoundException
      }
      if (new Date(coupon.updatedAt || '').getTime() !== new Date(version.coupon || '').getTime()) {
        throw CouponUpdatedException
      }
    }

    //5. Kiểm tra promotion và version
    if (promotionId) {
      const promotion = await this.prismaService.promotion.findUnique({
        where: {
          id: promotionId,
          deletedAt: null,
          AND: [
            { validFrom: { lt: toStartOfUTCDate(checkoutDate) } },
            { validUntil: { gt: toStartOfUTCDate(checkinDate) } },
          ],
        },
      })
      if (!promotion) {
        throw PromotionNotFoundException
      }
      if (new Date(promotion.updatedAt || '').getTime() !== new Date(version.promotion || '').getTime()) {
        throw PromotionUpdatedException
      }
    }

    // 6. Tạo order ,cập nhật điểm, cập nhật RoomAvailability
    const order = await this.prismaService.$transaction(async (tx) => {
      if (pointDiscount > 0) {
        await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            earnPoint: {
              decrement: pointDiscount / POINT_VALUE,
            },
          },
        })
      }
      const customer = await tx.customer.create({
        data: {
          fullName,
          phoneNumber,
          email,
        },
      })
      const order = await tx.order.create({
        data: {
          userId,
          customerId: customer.id,
          hotelId,
          roomId,
          quantity,
          checkinDate,
          checkoutDate,
          basePrice,
          pointDiscount,
          couponId,
          couponAmount,
          promotionId,
          promotionAmount,
          vatAmount,
          serviceFeeAmount,
          totalPrice,
          platformProfit,
          partnerProfit,
          status:
            paymentType === PAYMENT_TYPE.PAY_AT_HOTEL || totalPrice === 0
              ? ORDER_STATUS.CONFIRMED
              : ORDER_STATUS.PENDING,
          paymentType,
          arrivalTime,
        },
        include: {
          customer: true,
          hotel: true,
          room: {
            include: {
              roomType: true,
            },
          },
          user: true,
        },
      })
      if (couponId) {
        await tx.coupon.update({
          where: {
            id: couponId,
            deletedAt: null,
          },
          data: {
            available: {
              decrement: 1,
            },
          },
        })
      }
      // Cập nhật hoặc tạo RoomAvailability với OCC
      for (const date of dateRange) {
        const dateStr = format(toStartOfUTCDate(date), 'yyyy-MM-dd')
        const availability = availabilityMap.get(dateStr)

        if (availability) {
          // Cập nhật bản ghi hiện có
          const updateResult = await tx.roomAvailability.updateMany({
            where: {
              id: availability.id,
              version: availability.version,
              availableRooms: { gte: quantity },
            },
            data: {
              availableRooms: { decrement: quantity },
              version: { increment: 1 },
            },
          })
          if (updateResult.count === 0) {
            throw ConflictRoomAvailabilityException
          }
        } else {
          // Tạo bản ghi mới
          const roomAvailability = await tx.roomAvailability.create({
            data: {
              roomId,
              createdAt: toStartOfUTCDate(date),
              availableRooms: room.quantity - quantity,
              version: 0,
              totalRooms: room.quantity,
            },
          })
          if (!roomAvailability) {
            throw ConflictRoomAvailabilityException
          }
        }
      }
      if (paymentType === PAYMENT_TYPE.PAY_AT_HOTEL) {
        await tx.notify.create({
          data: {
            recipientId: hotel.partner.userId,
            title: `New Booking: #${order.id}`,
            message: `Guest: "${fullName}" booked ${quantity} room(s) from ${format(checkinDate, 'dd-MM-yyyy')} to ${format(checkoutDate, 'dd-MM-yyyy')}`,
          },
        })
      }
      if (paymentType === PAYMENT_TYPE.BANKING) {
        await this.orderProducer.addCancelOrderJob(order.id)
      }
      return order
    })

    return { ...order, partnerId: hotel.partner.userId }
  }

  async updateStatusCheckout(orderId: number) {
    const order = await this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: {
          id: orderId,
        },
        include: {
          customer: true,
          hotel: true,
        },
        data: {
          status: ORDER_STATUS.CHECKOUT,
          checkoutTime: new Date(),
          updatedAt: new Date(),
        },
      })
      await this.prismaService.hotel.update({
        where: {
          id: order.hotelId,
        },
        data: {
          reputationScore: {
            increment: REPUTATION_SCORE.CHECKOUT_SUCCESS,
          },
          updatedAt: new Date(),
        },
      })
      const checkinDate = toStartOfUTCDate(order.checkinDate)
      const checkoutDate = toStartOfUTCDate(order.checkoutDate)

      const roomAvailabilities = await tx.roomAvailability.findMany({
        where: {
          roomId: order.roomId,
          createdAt: {
            gte: checkinDate,
            lt: checkoutDate,
          },
        },
      })
      for (const roomAvailability of roomAvailabilities) {
        const updateResult = await tx.roomAvailability.update({
          where: {
            id: roomAvailability.id,
            version: roomAvailability.version,
            availableRooms: {
              lte: roomAvailability.totalRooms - order.quantity, // not exceed totalRooms
            },
          },
          data: {
            availableRooms: {
              increment: order.quantity,
            },
            version: { increment: 1 },
          },
        })
        if (updateResult === null) {
          throw ConflictRoomAvailabilityException
        }
      }

      return order
    })

    return order
  }

  async updateStatusCancel(orderId: number, reason?: string) {
    const order = await this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: {
          id: orderId,
        },
        include: {
          customer: true,
        },
        data: {
          status: ORDER_STATUS.CANCELED,
          reason,
          updatedAt: new Date(),
        },
      })
      if (order.pointDiscount > 0) {
        await this.prismaService.user.update({
          where: {
            id: order.userId,
          },
          data: {
            earnPoint: {
              increment: order.pointDiscount / POINT_VALUE,
            },
          },
        })
      }
      if (order.couponId) {
        await this.prismaService.coupon.update({
          where: {
            id: order.couponId,
            deletedAt: null,
          },
          data: {
            available: {
              increment: 1,
            },
          },
        })
      }
      await this.prismaService.hotel.update({
        where: {
          id: order.hotelId,
        },
        data: {
          reputationScore: {
            decrement: REPUTATION_SCORE.CANCEL_ORDER,
          },
        },
      })

      const checkinDate = toStartOfUTCDate(order.checkinDate)
      const checkoutDate = toStartOfUTCDate(order.checkoutDate)

      const roomAvailabilities = await tx.roomAvailability.findMany({
        where: {
          roomId: order.roomId,
          createdAt: {
            gte: checkinDate,
            lt: checkoutDate,
          },
        },
      })

      for (const roomAvailability of roomAvailabilities) {
        const updateResult = await tx.roomAvailability.update({
          where: {
            id: roomAvailability.id,
            version: roomAvailability.version,
            availableRooms: {
              lte: roomAvailability.totalRooms - order.quantity, // not exceed totalRooms
            },
          },
          data: {
            availableRooms: {
              increment: order.quantity,
            },
            version: { increment: 1 },
          },
        })
        if (updateResult === null) {
          throw ConflictRoomAvailabilityException
        }
      }

      return order
    })
    return order
  }

  async updateStatusNoShow(orderId: number) {
    const order = await this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: {
          id: orderId,
        },
        include: {
          customer: true,
          hotel: {
            include: {
              partner: true,
            },
          },
        },
        data: {
          status: ORDER_STATUS.NO_SHOW,
          updatedAt: new Date(),
        },
      })

      const checkinDate = toStartOfUTCDate(order.checkinDate)
      const checkoutDate = toStartOfUTCDate(order.checkoutDate)

      const roomAvailabilities = await tx.roomAvailability.findMany({
        where: {
          roomId: order.roomId,
          createdAt: {
            gte: checkinDate,
            lt: checkoutDate,
          },
        },
      })

      for (const roomAvailability of roomAvailabilities) {
        const updateResult = await tx.roomAvailability.update({
          where: {
            id: roomAvailability.id,
            version: roomAvailability.version,
            availableRooms: {
              lte: roomAvailability.totalRooms - order.quantity, // not exceed totalRooms
            },
          },
          data: {
            availableRooms: {
              increment: order.quantity,
            },
            version: { increment: 1 },
          },
        })
        if (updateResult === null) {
          throw ConflictRoomAvailabilityException
        }
      }

      return order
    })
    return order
  }

  async updateStatusPendingRefund(orderId: number, reason?: string) {
    const order = await this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: {
          id: orderId,
        },
        include: {
          customer: true,
          hotel: {
            include: {
              partner: true,
            },
          },
        },
        data: {
          status: ORDER_STATUS.PENDING_REFUND,
          reason,
          updatedAt: new Date(),
        },
      })
      if (order.pointDiscount > 0) {
        await this.prismaService.user.update({
          where: {
            id: order.userId,
          },
          data: {
            earnPoint: {
              increment: order.pointDiscount / POINT_VALUE,
            },
          },
        })
      }
      if (order.couponId) {
        await this.prismaService.coupon.update({
          where: {
            id: order.couponId,
            deletedAt: null,
          },
          data: {
            available: {
              increment: 1,
            },
          },
        })
      }
      await this.prismaService.hotel.update({
        where: {
          id: order.hotelId,
        },
        data: {
          reputationScore: {
            decrement: REPUTATION_SCORE.CANCEL_ORDER,
          },
        },
      })

      const checkinDate = toStartOfUTCDate(order.checkinDate)
      const checkoutDate = toStartOfUTCDate(order.checkoutDate)

      const roomAvailabilities = await tx.roomAvailability.findMany({
        where: {
          roomId: order.roomId,
          createdAt: {
            gte: checkinDate,
            lt: checkoutDate,
          },
        },
      })

      for (const roomAvailability of roomAvailabilities) {
        const updateResult = await tx.roomAvailability.update({
          where: {
            id: roomAvailability.id,
            version: roomAvailability.version,
            availableRooms: {
              lte: roomAvailability.totalRooms - order.quantity, // not exceed totalRooms
            },
          },
          data: {
            availableRooms: {
              increment: order.quantity,
            },
            version: { increment: 1 },
          },
        })
        if (updateResult === null) {
          throw ConflictRoomAvailabilityException
        }
      }

      await this.prismaService.notify.create({
        data: {
          title: `Order ID: #${order.id} request refund from partner`,
          message: `Order ID: #${order.id} has already been request refund for guest: ${order.customer.fullName} with phone number: ${order.customer.phoneNumber} from partner ${order.hotel.partner.fullName}`,
          createdById: order.hotel.partner.userId,
        },
      })

      return order
    })
    return order
  }

  async updateStatusCancelByUser(userId: number, orderId: number, reason?: string) {
    const [order, partnerId] = await this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: {
          id: orderId,
        },
        include: {
          user: true,
          hotel: {
            include: {
              partner: true,
            },
          },
        },
        data: {
          status: ORDER_STATUS.CANCELED,
          reason,
          updatedAt: new Date(),
        },
      })
      if (order.couponId) {
        await this.prismaService.coupon.update({
          where: {
            id: order.couponId,
            deletedAt: null,
          },
          data: {
            available: {
              increment: 1,
            },
          },
        })
      }
      const checkinDate = toStartOfUTCDate(order.checkinDate)
      const checkoutDate = toStartOfUTCDate(order.checkoutDate)

      const roomAvailabilities = await tx.roomAvailability.findMany({
        where: {
          roomId: order.roomId,
          createdAt: {
            gte: checkinDate,
            lt: checkoutDate,
          },
        },
      })

      for (const roomAvailability of roomAvailabilities) {
        const updateResult = await tx.roomAvailability.update({
          where: {
            id: roomAvailability.id,
            version: roomAvailability.version,
            availableRooms: {
              lte: roomAvailability.totalRooms - order.quantity, // not exceed totalRooms
            },
          },
          data: {
            availableRooms: {
              increment: order.quantity,
            },
            version: { increment: 1 },
          },
        })
        if (updateResult === null) {
          throw ConflictRoomAvailabilityException
        }
      }
      await this.prismaService.notify.create({
        data: {
          recipientId: order.hotel.partner.userId,
          title: `Order ID: #${order.id} have been canceled`,
          message: `Order ID: #${order.id} has already been canceled by user`,
          createdById: userId,
        },
      })
      const partnerId = order.hotel.partner.userId
      return [order, partnerId]
    })
    return { ...order, partnerId }
  }

  async updateStatusRequestRefundByUser(userId: number, orderId: number, reason?: string) {
    const [order, partnerId] = await this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: {
          id: orderId,
        },
        include: {
          user: true,
          hotel: {
            include: {
              partner: true,
            },
          },
        },
        data: {
          status: ORDER_STATUS.PENDING_REFUND,
          reason,
          updatedAt: new Date(),
        },
      })
      if (order.couponId) {
        await this.prismaService.coupon.update({
          where: {
            id: order.couponId,
            deletedAt: null,
          },
          data: {
            available: {
              increment: 1,
            },
          },
        })
      }
      const checkinDate = toStartOfUTCDate(order.checkinDate)
      const checkoutDate = toStartOfUTCDate(order.checkoutDate)

      const roomAvailabilities = await tx.roomAvailability.findMany({
        where: {
          roomId: order.roomId,
          createdAt: {
            gte: checkinDate,
            lt: checkoutDate,
          },
        },
      })

      for (const roomAvailability of roomAvailabilities) {
        const updateResult = await tx.roomAvailability.update({
          where: {
            id: roomAvailability.id,
            version: roomAvailability.version,
            availableRooms: {
              lte: roomAvailability.totalRooms - order.quantity, // not exceed totalRooms
            },
          },
          data: {
            availableRooms: {
              increment: order.quantity,
            },
            version: { increment: 1 },
          },
        })
        if (updateResult === null) {
          throw ConflictRoomAvailabilityException
        }
      }
      await this.prismaService.notify.create({
        data: {
          recipientId: order.hotel.partner.userId,
          title: `Order ID: #${order.id} have been canceled`,
          message: `Order ID: #${order.id} has already been canceled by user`,
          createdById: userId,
        },
      })
      await this.prismaService.notify.create({
        data: {
          title: `Order ID: #${order.id} request refund from user`,
          message: `Order ID: #${order.id} has already been request refund by user ID: #${userId}`,
          createdById: userId,
        },
      })
      const partnerId = order.hotel.partner.userId
      return [order, partnerId]
    })
    return { ...order, partnerId }
  }

  async exportPartnerRevenue({ dateFrom, dateTo }: ExportPartnerRevenueType) {
    // Tìm ra đơn đã checkout hoặc đơn đã thanh toán nhưng không tới
    const orders = await this.prismaService.order.findMany({
      where: {
        OR: [
          {
            status: ORDER_STATUS.CHECKOUT,
            checkoutDate: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          {
            status: ORDER_STATUS.NO_SHOW,
            paymentType: PAYMENT_TYPE.BANKING,
            checkoutDate: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        ],
      },
      include: {
        hotel: {
          include: {
            partner: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })
    if (!orders.length) {
      return []
    }
    const partnerRevenueMap = new Map<
      number,
      {
        partnerName: string
        hotelName: string
        accountNumber: string
        bankName: string
        bankAccount: string
        countOrder: number
        totalOrderValue: number
        totalBankingPayment: number
        totalHotelPayment: number
        platformProfit: number
        partnerProfit: number
        transferAmount: number
      }
    >()

    for (const order of orders) {
      const partnerId = order.hotel.partnerId
      const partner = order.hotel.partner

      if (!partnerRevenueMap.has(partnerId)) {
        partnerRevenueMap.set(partnerId, {
          partnerName: partner.fullName,
          hotelName: order.hotel.name,
          accountNumber: partner.accountNumber || 'N/A',
          bankName: partner.bankName || 'N/A',
          bankAccount: partner.bankAccount || 'N/A',
          countOrder: 0,
          totalOrderValue: 0,
          totalBankingPayment: 0,
          totalHotelPayment: 0,
          platformProfit: 0,
          partnerProfit: 0,
          transferAmount: 0,
        })
      }

      const current = partnerRevenueMap.get(partnerId)!
      const orderPrice = order.totalPrice ?? 0
      const partnerAmount = order.partnerProfit ?? 0
      const platformAmount = order.platformProfit ?? 0

      current.countOrder += 1
      current.totalOrderValue += orderPrice
      current.partnerProfit += partnerAmount
      current.platformProfit += platformAmount

      if (order.paymentType === PAYMENT_TYPE.PAY_AT_HOTEL) {
        current.totalHotelPayment += orderPrice
      } else {
        current.totalBankingPayment += orderPrice
      }
    }
    const result = Array.from(partnerRevenueMap.values())
      .map((data) => ({
        ...data,
        transferAmount: data.partnerProfit - data.totalHotelPayment,
        startDate: format(dateFrom || new Date(), 'dd/MM/yyyy'),
        endDate: format(dateTo || new Date(), 'dd/MM/yyyy'),
      }))
      .sort((a, b) => b.totalOrderValue - a.totalOrderValue)

    return result
  }

  async findOrdersExceedQuantityByRoomId(roomId: number, quantity: number) {
    return await this.prismaService.order.findMany({
      where: {
        roomId,
        status: ORDER_STATUS.CONFIRMED,
        quantity: {
          gt: quantity,
        },
      },
    })
  }
}

// if (order.paymentType === PAYMENT_TYPE.PAY_AT_HOTEL) {
//   current.totalHotelPayment += orderPrice
//   // Đối tác giữ tiền → đối tác cần chuyển lại cho sàn
//   if (platformAmount >= 0) {
//     // Sàn có lời → đối tác phải trả phần hoa hồng này => trừ tiền cuối tháng
//     current.transferAmount -= platformAmount
//   } else {
//     // Sàn bị lỗ → sàn cần chuyển thêm tiền cho đối tác => cộng tiền cuối tháng
//     current.transferAmount += Math.abs(platformAmount)
//   }
// } else {
//   current.totalBankingPayment += orderPrice
//   // Sàn giữ tiền → cần chuyển cho đối tác
//   if (platformAmount >= 0) {
//     // Sàn có lời → chỉ chuyển phần lợi nhuận đối tác => cộng tiền cuối tháng
//     current.transferAmount += partnerAmount
//   } else {
//     // Sàn lỗ → phải chuyển cả phần lỗ bù thêm => cộng tiền cuối tháng
//     current.transferAmount += orderPrice + Math.abs(platformAmount)
//   }
// }
