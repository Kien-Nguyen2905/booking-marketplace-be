import { Injectable } from '@nestjs/common'
import { PaymentRepo } from 'src/routes/payment/payment.repo'
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { generateRoomAdmin, generateRoomPartnerId, generateRoomUserId } from 'src/shared/helpers'
import { EVENT } from 'src/shared/constants/event.constant'
import { TRANSACTION_TYPE } from 'src/shared/constants/transaction.constant'
import { MailProducer } from 'src/shared/producers/mail.producer'
import { format } from 'date-fns'

@Injectable()
@WebSocketGateway({ namespace: '' })
export class PaymentService {
  @WebSocketServer()
  server: Server
  constructor(
    private readonly paymentRepo: PaymentRepo,
    private readonly mailProducer: MailProducer,
  ) {}

  async receiver(body: WebhookPaymentBodyType) {
    const { transactionType, order } = await this.paymentRepo.receiver(body)
    if (transactionType === TRANSACTION_TYPE.IN) {
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
        arrivalTime: (order.arrivalTime && format(order.arrivalTime, 'hh:mm dd/MM/yyyy')) || '',
        totalPrice: order.totalPrice,
        paymentType: order.paymentType,
      })
      this.server.to(generateRoomUserId(order.userId)).emit(EVENT.PAYMENT_SUCCESS)
      this.server.to(generateRoomPartnerId(order.hotel.partner.userId)).emit(EVENT.ORDER_CREATED)
    } else {
      this.server.to(generateRoomAdmin()).emit(EVENT.ORDER_REFUNDED)
      this.mailProducer.sendOrderRefundSuccessMail({
        email: order.user.email,
        customerName: order.customer.fullName || 'Guest',
        orderId: order.id,
      })
    }

    return {
      message: 'Payment received successfully',
    }
  }
}
