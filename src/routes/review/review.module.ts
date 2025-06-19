import { Module } from '@nestjs/common'
import { ReviewService } from './review.service'
import { ReviewController } from './review.controller'
import { ReviewRepo } from 'src/routes/review/review.repo'
import { OrderModule } from 'src/routes/order/order.module'
import { OrderRepo } from 'src/routes/order/order.repo'

@Module({
  imports: [OrderModule],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepo, OrderRepo],
})
export class ReviewModule {}
