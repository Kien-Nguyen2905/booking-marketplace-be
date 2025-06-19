import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { OrderRepo } from 'src/routes/order/order.repo'
import { OrderProducer } from 'src/shared/producers/order.producer'
import { BullModule } from '@nestjs/bullmq'
import { ORDER_QUEUE_NAME } from 'src/shared/constants/queue.constant'

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderRepo, OrderProducer],
  imports: [
    BullModule.registerQueue({
      name: ORDER_QUEUE_NAME,
    }),
  ],
  exports: [OrderProducer],
})
export class OrderModule {}
