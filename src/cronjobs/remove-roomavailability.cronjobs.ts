import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { getNowUTC7, toStartOfUTCDate } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RemoveRoomAvailabilityCronjob {
  private readonly logger = new Logger(RemoveRoomAvailabilityCronjob.name)
  constructor(private prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM, { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleCronRemoveRoomAvailability() {
    try {
      const nowUTC7 = getNowUTC7()
      const today = toStartOfUTCDate(nowUTC7)
      // Delete những room availability cũ hơn ngày hôm nay
      const roomAvailabilities = await this.prismaService.roomAvailability.deleteMany({
        where: {
          createdAt: {
            lt: today,
          },
        },
      })
      this.logger.debug(`Remove ${roomAvailabilities.count} room availability.`)
    } catch (error) {
      this.logger.error(`Error during remove room availability cronjob: ${error.message}`)
    }
  }
}
