import { Module } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import { PaymentRepo } from 'src/routes/payment/payment.repo'
import { OrderModule } from 'src/routes/order/order.module'

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepo],
  imports: [OrderModule],
})
export class PaymentModule {}
