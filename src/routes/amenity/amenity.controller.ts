import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { AmenityService } from './amenity.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { CreateAmenityBodyDTO, CreateAmenityResDTO, GetAmenitiesResDTO } from 'src/routes/amenity/amenity.dto'

@Controller('amenities')
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  @Get()
  @ZodSerializerDto(GetAmenitiesResDTO)
  async list() {
    return await this.amenityService.list()
  }

  @Post()
  @ZodSerializerDto(CreateAmenityResDTO)
  async create(@Body() data: CreateAmenityBodyDTO) {
    return await this.amenityService.create(data)
  }
}
