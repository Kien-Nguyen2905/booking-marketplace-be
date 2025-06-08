import { Module } from '@nestjs/common'
import { PromotionService } from './promotion.service'
import { PromotionController } from './promotion.controller'
import { PromotionRepo } from 'src/routes/promotion/promotion.repo'

@Module({
  controllers: [PromotionController],
  providers: [PromotionService, PromotionRepo],
})
export class PromotionModule {}
