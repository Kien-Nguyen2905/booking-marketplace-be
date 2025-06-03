import { Module } from '@nestjs/common'
import { RoomTypeService } from './room-type.service'
import { RoomTypeController } from './room-type.controller'
import { RoomTypeRepo } from 'src/routes/room-type/room-type.repo'
import { RoomRepo } from 'src/routes/room/room.repo'

@Module({
  controllers: [RoomTypeController],
  providers: [RoomTypeService, RoomTypeRepo, RoomRepo],
})
export class RoomTypeModule {}
