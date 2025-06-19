import { BadRequestException, Injectable } from '@nestjs/common'
import { format, parse } from 'date-fns'
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model'
import { NOTIFY_TYPE } from 'src/shared/constants/notify.constant'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { PAYMENT_TYPE } from 'src/shared/constants/payment.constant'
import { REFUND_STATUS } from 'src/shared/constants/refund.constant'
import { PREFIX_CONTENT_ORDER, TRANSACTION_TYPE } from 'src/shared/constants/transaction.constant'
import { OrderProducer } from 'src/shared/producers/order.producer'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class PaymentRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderProducer: OrderProducer,
  ) {}

  async receiver(body: WebhookPaymentBodyType) {
    const paymentTransaction = await this.prismaService.transaction.findUnique({
      where: {
        id: body.id,
      },
    })

    if (paymentTransaction) {
      throw new BadRequestException('Transaction already exists')
    }

    const [transactionType, order] = await this.prismaService.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          id: body.id,
          gateway: body.gateway,
          transactionDate: parse(body.transactionDate, 'yyyy-MM-dd HH:mm:ss', new Date()),
          accountNumber: body.accountNumber,
          subAccount: body.subAccount,
          amount: body.transferAmount,
          accumulated: body.accumulated,
          code: body.code,
          transactionContent: body.content,
          referenceNumber: body.referenceCode,
          body: body.description,
          type: body.transferType === 'in' ? TRANSACTION_TYPE.IN : TRANSACTION_TYPE.OUT,
        },
      })

      let orderId = 0
      if (body.transferType === 'in' && body.code) {
        orderId = Number(body.code.split(PREFIX_CONTENT_ORDER.PAY)[1])
      } else if (body.transferType === 'out' && body.code) {
        orderId = Number(body.code.split(PREFIX_CONTENT_ORDER.REFUND)[1])
      }

      if (!orderId) {
        throw new BadRequestException('Cannot get order id from content')
      }

      const order = await tx.order.findUnique({
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
          room: {
            include: {
              roomType: true,
            },
          },
          user: true,
        },
      })

      if (!order) {
        throw new BadRequestException(`Cannot find order with id ${orderId}`)
      }

      if (order.paymentType === PAYMENT_TYPE.PAY_AT_HOTEL) {
        throw new BadRequestException(`Order ${orderId} is not pay by bank transfer`)
      }

      if (order.status === ORDER_STATUS.CANCELED) {
        throw new BadRequestException(`Order ${orderId} has already canceled`)
      }

      if (order.status === ORDER_STATUS.REFUNDED) {
        throw new BadRequestException(`Order ${orderId} has already refunded`)
      }

      const totalPrice = order.totalPrice

      if (totalPrice !== body.transferAmount) {
        throw new BadRequestException(`Price not match, expected ${totalPrice} but got ${body.transferAmount}`)
      }

      if (body.transferType === 'in') {
        await tx.order.update({
          where: {
            id: orderId,
          },
          data: {
            status: ORDER_STATUS.CONFIRMED,
            updatedAt: new Date(),
          },
        })

        await tx.notify.create({
          data: {
            recipientId: order.hotel.partner.userId,
            title: `New Booking: #${order.id}`,
            type: NOTIFY_TYPE.INFORM,
            message: `Guest: "${order.customer.fullName}" booked ${order.quantity} room(s) from ${format(order.checkinDate, 'dd-MM-yyyy')} to ${format(order.checkoutDate, 'dd-MM-yyyy')}`,
          },
        })

        await this.orderProducer.removeCancelOrderJob(orderId)
      }

      if (body.transferType === 'out') {
        await tx.order.update({
          where: {
            id: orderId,
          },
          data: {
            status: ORDER_STATUS.REFUNDED,
            updatedAt: new Date(),
          },
        })
        await tx.refund.update({
          where: {
            orderId: orderId,
          },
          data: {
            status: REFUND_STATUS.COMPLETED,
            updatedAt: new Date(),
          },
        })
      }

      const transactionType = body.transferType === 'in' ? TRANSACTION_TYPE.IN : TRANSACTION_TYPE.OUT
      return [transactionType, order]
    })

    return { transactionType, order }
  }
}
