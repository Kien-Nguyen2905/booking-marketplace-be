import { Module } from '@nestjs/common'
import { NotifyService } from './notify.service'
import { NotifyController } from './notify.controller'
import { NotifyRepo } from 'src/routes/notify/notify.repo'

@Module({
  controllers: [NotifyController],
  providers: [NotifyService, NotifyRepo],
})
export class NotifyModule {}
