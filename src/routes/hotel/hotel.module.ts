import { Module } from '@nestjs/common'
import { HotelService } from './hotel.service'
import { HotelController } from './hotel.controller'
import { HotelRepo } from 'src/routes/hotel/hotel.repo'

@Module({
  controllers: [HotelController],
  providers: [HotelService, HotelRepo],
})
export class HotelModule {}
