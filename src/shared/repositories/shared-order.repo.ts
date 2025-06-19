import { Injectable } from '@nestjs/common'
import { addDays, eachDayOfInterval } from 'date-fns'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { PAYMENT_TYPE } from 'src/shared/constants/payment.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class SharedOrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Cancel a pending BANKING order after payment timeout.
   *
   * 1. Validate that the order exists, is still PENDING and uses BANKING payment.
   * 2. Roll back RoomAvailability by adding back the temporarily blocked quantity for every day in the stay.
   * 3. Restore coupon availability (if any).
   * 4. Update order status to CANCELED.
   */
  async cancelOrder(orderId: number) {
    return this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          status: true,
          paymentType: true,
          quantity: true,
          roomId: true,
          couponId: true,
          checkinDate: true,
          checkoutDate: true,
        },
      })

      // Order not found ⇒ nothing to cancel
      if (!order) return null

      // Only cancel unpaid BANKING orders that are still pending
      if (order.status !== ORDER_STATUS.PENDING || order.paymentType !== PAYMENT_TYPE.BANKING) {
        return order
      }

      const { roomId, quantity, checkinDate, checkoutDate } = order

      // Build the date range the room was blocked for and revert availability
      const dateRange = eachDayOfInterval({ start: addDays(checkinDate, 1), end: checkoutDate })

      for (const date of dateRange) {
        await tx.roomAvailability.updateMany({
          where: {
            roomId,
            createdAt: date,
          },
          data: {
            availableRooms: { increment: quantity },
            version: { increment: 1 },
          },
        })
      }

      // Restore coupon usage if applied
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: {
            available: { increment: 1 },
          },
        })
      }

      // Finally mark the order as canceled
      await tx.order.update({
        where: { id: orderId },
        data: { status: ORDER_STATUS.FAILED },
      })

      return true
    })
  }

  // Backwards-compatibility for consumer that still calls this method name
  async cancelPaymentAndOrder(orderId: number) {
    return this.cancelOrder(orderId)
  }
}
