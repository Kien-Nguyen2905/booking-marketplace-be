import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ORDER_STATUS, REPUTATION_SCORE } from 'src/shared/constants/order.constant'
import { getNowUTC7, toStartOfUTCDate } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class CheckoutOrderCronjob {
  private readonly logger = new Logger(CheckoutOrderCronjob.name)
  constructor(private prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_NOON, { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleCronCheckoutOrder() {
    try {
      const nowUTC7 = getNowUTC7()
      const today = toStartOfUTCDate(nowUTC7)
      // Checkout tự động cho những được CONFIRMED khi ngày checkout là ngày hôm nay
      const findOrders = await this.prismaService.order.findMany({
        where: {
          status: ORDER_STATUS.CONFIRMED,
          checkoutDate: {
            equals: today,
          },
        },
      })
      if (findOrders.length > 0) {
        for (const order of findOrders) {
          await this.prismaService.hotel.update({
            where: {
              id: order.hotelId,
            },
            data: {
              reputationScore: {
                increment: REPUTATION_SCORE.CHECKOUT_SUCCESS,
              },
            },
          })
        }
      }
      const orders = await this.prismaService.order.updateMany({
        where: {
          status: ORDER_STATUS.CONFIRMED,
          checkoutDate: {
            equals: today,
          },
        },
        data: {
          status: ORDER_STATUS.CHECKOUT,
          checkoutTime: new Date(),
        },
      })

      this.logger.debug(`Checkout ${orders.count} orders.`)
    } catch (error) {
      this.logger.error(`Error during checkout cronjob: ${error.message}`)
    }
  }
}
