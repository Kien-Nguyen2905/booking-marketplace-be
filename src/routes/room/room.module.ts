import { Module } from '@nestjs/common'
import { RoomService } from './room.service'
import { RoomController } from './room.controller'
import { RoomRepo } from './room.repo'

@Module({
  controllers: [RoomController],
  providers: [RoomService, RoomRepo],
})
export class RoomModule {}
