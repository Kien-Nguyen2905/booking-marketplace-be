import { Module } from '@nestjs/common'
import { RefundService } from './refund.service'
import { RefundController } from './refund.controller'
import { RefundRepo } from 'src/routes/refund/refund.repo'

@Module({
  controllers: [RefundController],
  providers: [RefundService, RefundRepo],
})
export class RefundModule {}
