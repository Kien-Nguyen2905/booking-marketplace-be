import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { CANCEL_ORDER_JOB_NAME, ORDER_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { SharedOrderRepository } from 'src/shared/repositories/shared-order.repo'

@Processor(ORDER_QUEUE_NAME)
export class OrderConsumer extends WorkerHost {
  constructor(private readonly sharedOrderRepo: SharedOrderRepository) {
    super()
  }
  async process(job: Job<{ orderId: number }, any, string>): Promise<any> {
    switch (job.name) {
      case CANCEL_ORDER_JOB_NAME: {
        const { orderId } = job.data
        await this.sharedOrderRepo.cancelOrder(orderId)
        return {}
      }
      default: {
        break
      }
    }
  }
}
