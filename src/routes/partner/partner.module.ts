import { Module } from '@nestjs/common'
import { PartnerController } from './partner.controller'
import { PartnerRepo } from './partner.repo'
import { AuthModule } from '../auth/auth.module'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import { PartnerService } from 'src/routes/partner/partner.service'
import { UserRepo } from 'src/routes/user/user.repo'
import { HotelRepo } from 'src/routes/hotel/hotel.repo'

@Module({
  imports: [AuthModule],
  controllers: [PartnerController],
  providers: [PartnerService, PartnerRepo, AuthRepository, UserRepo, HotelRepo],
})
export class PartnerModule {}
