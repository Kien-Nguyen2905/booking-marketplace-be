import { Module } from '@nestjs/common'
import { AmenityService } from './amenity.service'
import { AmenityController } from './amenity.controller'
import { AmenityRepo } from 'src/routes/amenity/amenity.repo'

@Module({
  controllers: [AmenityController],
  providers: [AmenityService, AmenityRepo],
})
export class AmenityModule {}
