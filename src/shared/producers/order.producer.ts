import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { ORDER_QUEUE_NAME, CANCEL_ORDER_JOB_NAME } from 'src/shared/constants/queue.constant'

@Injectable()
export class OrderProducer {
  constructor(@InjectQueue(ORDER_QUEUE_NAME) private orderQueue: Queue) {}

  async addCancelOrderJob(orderId: number) {
    return this.orderQueue.add(
      CANCEL_ORDER_JOB_NAME,
      {
        orderId,
      },
      {
        delay: 1000 * 60 * 2, // delay 2 minutes
        jobId: `orderId-${orderId}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    )
  }

  async removeCancelOrderJob(orderId: number) {
    return this.orderQueue.remove(`orderId-${orderId}`)
  }
}
