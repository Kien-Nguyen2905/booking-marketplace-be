import { BadRequestException, Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import {
  addDays,
  addHours,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
  subDays,
  subHours,
} from 'date-fns'
import { Server } from 'socket.io'
import { OrderNotFoundException } from 'src/routes/order/order.error'
import {
  GetOrdersQueryType,
  CreateOrderBodyType,
  GetOrdersByUserIdQueryType,
  ExportPartnerRevenueType,
} from 'src/routes/order/order.model'
import { OrderRepo } from 'src/routes/order/order.repo'
import { EVENT } from 'src/shared/constants/event.constant'
import { ORDER_STATUS, OrderStatusType } from 'src/shared/constants/order.constant'
import { PAYMENT_TYPE } from 'src/shared/constants/payment.constant'
import { POLICY_TYPE } from 'src/shared/constants/room.constant'
import {
  generateRoomAdmin,
  generateRoomPartnerId,
  getNowUTC7,
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
} from 'src/shared/helpers'
import { MailProducer } from 'src/shared/producers/mail.producer'

@Injectable()
@WebSocketGateway({ namespace: '' })
export class OrderService {
  @WebSocketServer()
  server: Server
  constructor(
    private orderRepo: OrderRepo,
    private readonly mailProducer: MailProducer,
  ) {}

  async canCheckout(orderId: number) {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw OrderNotFoundException
    }

    if (order.status !== ORDER_STATUS.CONFIRMED) {
      throw new BadRequestException('Only confirmed orders can be checked out')
    }

    const checkinDate = subHours(order.checkinDate, 7)
    const checkoutDate = subHours(order.checkoutDate, 7)

    const nowUTC7 = getNowUTC7()
    const today = startOfDay(nowUTC7)

    if (isBefore(checkoutDate, today)) {
      throw new BadRequestException('Cannot checkout past orders')
    }

    if (today.getTime() <= checkinDate.getTime()) {
      throw new BadRequestException(`Cannot check out before ${format(addDays(checkinDate, 1), 'dd/MM/yyyy')}`)
    }

    return true
  }

  async canCancel(orderId: number) {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw OrderNotFoundException
    }
    if (order.status !== ORDER_STATUS.CONFIRMED) {
      throw new BadRequestException('Only confirmed orders can be canceled')
    }

    const checkinDate = addHours(order.checkinDate, 7)
    const checkoutDate = addHours(order.checkoutDate, 7)
    const createdAt = addHours(order.createdAt || new Date(), 7)

    const nowUTC7 = getNowUTC7()

    const today = startOfDay(nowUTC7)

    if (isBefore(checkoutDate, today)) {
      throw new BadRequestException('Cannot cancel past orders')
    }

    // Kiểm tra xem đơn có phải tạo trước ngày check-in (đơn tương lai) hay không
    const isFutureOrder = !isEqual(startOfDay(createdAt), startOfDay(checkinDate))

    if (isFutureOrder) {
      // Đơn tương lai: Không được hủy khi thời điểm hiện tại đạt hoặc vượt qua check-in
      const cancelEnd = startOfDay(checkinDate)
      if (isAfter(nowUTC7, cancelEnd) && !isEqual(nowUTC7, cancelEnd)) {
        throw new BadRequestException(`Cannot cancel after ${format(cancelEnd, 'dd/MM/yyyy')}`)
      }
    } else {
      // Đơn tạo trong ngày check-in
      const dateRange = eachDayOfInterval({
        start: checkinDate,
        end: subDays(checkoutDate, 1),
      })

      if (dateRange.length === 1) {
        // Đơn 1 ngày: Không được hủy sau checkoutDate
        const cancelEnd = startOfDay(checkoutDate)
        if (isAfter(nowUTC7, cancelEnd) && !isEqual(nowUTC7, cancelEnd)) {
          throw new BadRequestException(`Cannot cancel after ${format(cancelEnd, 'dd/MM/yyyy')} for 1-day stay`)
        }
      } else {
        // Đơn nhiều ngày: Không được hủy sau check-in
        const cancelEnd = startOfDay(addDays(checkinDate, 1))
        if (isAfter(nowUTC7, cancelEnd) && !isEqual(nowUTC7, cancelEnd)) {
          throw new BadRequestException(`Cannot cancel after ${format(cancelEnd, 'dd/MM/yyyy')}`)
        }
      }
    }

    return true
  }

  async canRefund(orderId: number) {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw OrderNotFoundException
    }
    if (order.status !== ORDER_STATUS.CONFIRMED) {
      throw new BadRequestException('Only confirmed orders can be refunded')
    }

    const checkinDate = addHours(order.checkinDate, 7)
    const checkoutDate = addHours(order.checkoutDate, 7)
    const createdAt = addHours(order.createdAt || new Date(), 7)

    const nowUTC7 = getNowUTC7()

    const today = startOfDay(nowUTC7)

    if (isBefore(checkoutDate, today)) {
      throw new BadRequestException('Cannot refund past orders')
    }

    // Kiểm tra xem đơn có phải tạo trước ngày check-in (đơn tương lai) hay không
    const isFutureOrder = !isEqual(startOfDay(createdAt), startOfDay(checkinDate))

    if (isFutureOrder) {
      // Đơn tương lai: Không được refund khi thời điểm hiện tại đạt hoặc vượt qua check-in
      const cancelEnd = startOfDay(checkinDate)
      if (isAfter(nowUTC7, cancelEnd) && !isEqual(nowUTC7, cancelEnd)) {
        throw new BadRequestException(`Cannot refund after ${format(cancelEnd, 'dd/MM/yyyy')}`)
      }
    } else {
      // Đơn tạo trong ngày check-in
      const dateRange = eachDayOfInterval({
        start: checkinDate,
        end: subDays(checkoutDate, 1),
      })

      if (dateRange.length === 1) {
        // Đơn 1 ngày: Không được refund sau checkoutDate
        const cancelEnd = startOfDay(checkoutDate)
        if (isAfter(nowUTC7, cancelEnd) && !isEqual(nowUTC7, cancelEnd)) {
          throw new BadRequestException(`Cannot refund after ${format(cancelEnd, 'dd/MM/yyyy')} for 1-day stay`)
        }
      } else {
        // Đơn nhiều ngày: Không được refund sau check-in
        const cancelEnd = startOfDay(addDays(checkinDate, 1))
        if (isAfter(nowUTC7, cancelEnd) && !isEqual(nowUTC7, cancelEnd)) {
          throw new BadRequestException(`Cannot refund after ${format(cancelEnd, 'dd/MM/yyyy')}`)
        }
      }
    }

    return true
  }

  async canNoShow(orderId: number) {
    const order = await this.orderRepo.findById(orderId)

    if (!order) {
      throw OrderNotFoundException
    }

    if (order.status !== ORDER_STATUS.CONFIRMED) {
      throw new BadRequestException('Only confirmed orders can be no-show')
    }

    const checkinDate = addHours(order.checkinDate, 7)
    const checkoutDate = addHours(order.checkoutDate, 7)

    const nowUTC7 = getNowUTC7()

    const today = startOfDay(nowUTC7)

    if (isBefore(checkoutDate, today)) {
      throw new BadRequestException('Cannot no-show past orders')
    }

    const dateRange = eachDayOfInterval({
      start: checkinDate,
      end: subDays(checkoutDate, 1),
    })

    if (dateRange.length === 1) {
      // Đơn 1 ngày: không được no-show trước ngày checkoutDate
      const noShowStart = startOfDay(checkoutDate)
      if (isBefore(nowUTC7, noShowStart)) {
        throw new BadRequestException(`Cannot mark as no-show before ${format(noShowStart, 'dd/MM/yyyy')}`)
      }
    } else {
      // Đơn nhiều ngày: không được no-show trước 12:00 ngày mai của ngày check-in
      const noShowStart = startOfDay(addDays(checkinDate, 1))
      noShowStart.setHours(12, 0, 0, 0) // 12:00 ngày mai
      if (isBefore(nowUTC7, noShowStart)) {
        throw new BadRequestException(`Cannot mark as no-show before 12:00 ${format(noShowStart, 'dd/MM/yyyy')}`)
      }
    }

    return true
  }

  async canCancelByUser(orderId: number) {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw OrderNotFoundException
    }
    if (order.status !== ORDER_STATUS.CONFIRMED) {
      throw new BadRequestException('Only confirmed orders can be canceled')
    }
    const checkoutDate = addHours(order.checkoutDate, 7)

    const nowUTC7 = getNowUTC7()

    const today = startOfDay(nowUTC7)

    if (isBefore(checkoutDate, today)) {
      throw new BadRequestException('Cannot cancel past orders')
    }
    return true
  }

  async canRequestRefundByUser(orderId: number) {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw OrderNotFoundException
    }
    if (order.status !== ORDER_STATUS.CONFIRMED) {
      throw new BadRequestException('Only confirmed orders can be request refund')
    }
    if (order.room.policy !== POLICY_TYPE.FREE_CANCELLATION) {
      throw new BadRequestException('Only FREE_CANCELLATION orders can request refund')
    }
    const currentDate = new Date()
    const currentDateUTC7 = new Date(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))

    const checkinDate = addHours(order.checkinDate, 7)

    const today = startOfDay(currentDateUTC7)

    if (!isBefore(today, checkinDate)) {
      throw new BadRequestException('Cannot request refund after checkin date')
    }

    return true
  }

  async list(query: GetOrdersQueryType) {
    return await this.orderRepo.list(query)
  }

  async listPartnerOrder(query: GetOrdersQueryType & { hotelId: number }) {
    return await this.orderRepo.list(query)
  }

  async listMyOrder(query: GetOrdersByUserIdQueryType, userId: number) {
    return await this.orderRepo.findOrdersByUserId(query, userId)
  }

  async findById(id: number) {
    return await this.orderRepo.findById(id)
  }

  async create(data: CreateOrderBodyType & { userId: number }) {
    try {
      const order = await this.orderRepo.create({ data })
      if (order.paymentType === PAYMENT_TYPE.PAY_AT_HOTEL) {
        this.server.to(generateRoomPartnerId(order.partnerId)).emit(EVENT.ORDER_CREATED, order)
        this.mailProducer.sendOrderSuccessMail({
          email: order.user.email,
          customerName: order.user.fullName || 'Guest',
          orderId: order.id,
          hotelName: order.hotel.name,
          roomType: order.room.roomType.type,
          quantity: order.quantity,
          policy: order.room.policy || '',
          checkinDate: format(order.checkinDate, 'dd/MM/yyyy'),
          checkoutDate: format(order.checkoutDate, 'dd/MM/yyyy'),
          arrivalTime: (order.arrivalTime && format(order.arrivalTime, 'HH:mm dd/MM/yyyy')) || '',
          totalPrice: order.totalPrice,
          paymentType: order.paymentType,
        })
      }
      return order
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new BadRequestException()
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw new BadRequestException()
      }
      throw error
    }
  }

  async updateStatusOrder({ orderId, status, reason }: { orderId: number; status: OrderStatusType; reason?: string }) {
    try {
      if (status === ORDER_STATUS.CHECKOUT) {
        await this.canCheckout(orderId)
        // const order = await this.orderRepo.updateStatusCheckout(orderId)
        // await this.mailProducer.sendCheckoutSuccessMail({
        //   email: order.customer.email,
        //   customerName: order.customer.fullName,
        //   orderId: order.id,
        //   hotelName: order.hotel.name,
        // })

        // return order
      }
      if (status === ORDER_STATUS.CANCELED) {
        await this.canCancel(orderId)
        const order = await this.orderRepo.updateStatusCancel(orderId, reason)
        await this.mailProducer.sendOrderCanceledMail({
          email: order.customer.email,
          customerName: order.customer.fullName,
          orderId: order.id,
          reason: reason || 'unavailability of requested services',
        })
        return order
      }
      if (status === ORDER_STATUS.PENDING_REFUND) {
        await this.canRefund(orderId)
        const order = await this.orderRepo.updateStatusPendingRefund(orderId, reason)
        await this.mailProducer.sendPartnerCancelRefundMail({
          email: order.customer.email,
          customerName: order.customer.fullName,
          orderId: order.id,
          reason: reason || 'unavailability of requested services or partner decision',
        })
        this.server.to(generateRoomAdmin()).emit(EVENT.NOTIFY, order)
        return order
      }
      if (status === ORDER_STATUS.NO_SHOW) {
        await this.canNoShow(orderId)
        const order = await this.orderRepo.updateStatusNoShow(orderId)
        await this.mailProducer.sendNoShowCanceledMail({
          email: order.customer.email,
          customerName: order.customer.fullName,
          orderId: order.id,
        })
        return order
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw OrderNotFoundException
      }
      throw error
    }
  }

  async updateStatusOrderByUser({
    userId,
    orderId,
    status,
    reason,
  }: {
    userId: number
    orderId: number
    status: OrderStatusType
    reason?: string
  }) {
    try {
      if (status === ORDER_STATUS.CANCELED) {
        await this.canCancelByUser(orderId)
        const order = await this.orderRepo.updateStatusCancelByUser(userId, orderId, reason)
        await this.mailProducer.sendCustomerOrderCancelMail({
          email: order.user.email,
          customerName: order.user.fullName || 'Guest',
          orderId: order.id,
          reason: reason || 'Request cancel by user',
        })
        this.server.to(generateRoomPartnerId(order.partnerId)).emit(EVENT.NOTIFY, order)
        return order
      }
      if (status === ORDER_STATUS.PENDING_REFUND) {
        await this.canRequestRefundByUser(orderId)
        const order = await this.orderRepo.updateStatusRequestRefundByUser(userId, orderId, reason)
        await this.mailProducer.sendCustomerOrderRefundMail({
          email: order.user.email,
          customerName: order.user.fullName || 'Guest',
          orderId: order.id,
          reason: reason || 'Request refund by user',
        })
        this.server.to(generateRoomPartnerId(order.partnerId)).emit(EVENT.NOTIFY, order)
        this.server.to(generateRoomAdmin()).emit(EVENT.NOTIFY, order)
        return order
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw OrderNotFoundException
      }
      throw error
    }
  }

  async exportPartnerRevenue({ dateFrom, dateTo }: ExportPartnerRevenueType) {
    return await this.orderRepo.exportPartnerRevenue({ dateFrom, dateTo })
  }

  async findOrdersExceedQuantityByRoomId(roomId: number, quantity: number) {
    return await this.orderRepo.findOrdersExceedQuantityByRoomId(roomId, quantity)
  }
}
