import { Module } from '@nestjs/common'
import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'
import { SharedModule } from 'src/shared/shared.module'
import { PartnerRepo } from 'src/routes/partner/partner.repo'

@Module({
  imports: [SharedModule],
  controllers: [ProfileController],
  providers: [ProfileService, PartnerRepo],
  exports: [ProfileService],
})
export class ProfileModule {}
