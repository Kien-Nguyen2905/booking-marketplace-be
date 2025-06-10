import { Module } from '@nestjs/common'
import { CouponService } from './coupon.service'
import { CouponController } from './coupon.controller'
import { CouponRepo } from 'src/routes/coupon/coupon.repo'

@Module({
  controllers: [CouponController],
  providers: [CouponService, CouponRepo],
})
export class CouponModule {}
