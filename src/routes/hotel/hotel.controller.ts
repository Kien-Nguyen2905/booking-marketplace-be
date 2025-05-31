import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { HotelService } from './hotel.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateHotelAmenityBodyDTO,
  CreateHotelAmenityResDTO,
  CreateHotelBodyDTO,
  CreateHotelResDTO,
  GetHotelResDTO,
  GetHotelsQueryDTO,
  GetHotelsResDTO,
  UpdateHotelAmenitiesBodyDTO,
  UpdateHotelAmenitiesResDTO,
  UpdateHotelBodyDTO,
  UpdateHotelResDTO,
} from 'src/routes/hotel/hotel.dto'
import { GetAmenitiesResDTO } from 'src/routes/amenity/amenity.dto'

@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get()
  @ZodSerializerDto(GetHotelsResDTO)
  async list(@Query() query: GetHotelsQueryDTO) {
    return await this.hotelService.list(query)
  }

  @Post()
  @ZodSerializerDto(CreateHotelResDTO)
  async create(@Body() body: CreateHotelBodyDTO) {
    return await this.hotelService.create(body)
  }

  @Get(':id')
  @ZodSerializerDto(GetHotelResDTO)
  async find(@Param('id') id: string) {
    return await this.hotelService.find(+id)
  }

  @Get('partner/:partnerId')
  @ZodSerializerDto(GetHotelResDTO)
  async findById(@Param() params: { partnerId: string }) {
    return await this.hotelService.findByPartnerId(+params.partnerId)
  }

  @Put(':id')
  @ZodSerializerDto(UpdateHotelResDTO)
  async update(@Body() body: UpdateHotelBodyDTO, @Param('id') id: string) {
    return await this.hotelService.update({
      data: body,
      id: +id,
    })
  }

  @Post('amenities')
  @ZodSerializerDto(CreateHotelAmenityResDTO)
  async createAmenity(@Body() body: CreateHotelAmenityBodyDTO) {
    return await this.hotelService.createAmenity(body)
  }

  @Get('amenities/:hotelId')
  @ZodSerializerDto(GetAmenitiesResDTO)
  async findAmenitiesByHotelId(@Param('hotelId') hotelId: string) {
    return await this.hotelService.findAmenitiesByHotelId(+hotelId)
  }

  @Put('amenities/:hotelId')
  @ZodSerializerDto(UpdateHotelAmenitiesResDTO)
  async updateAmenities(@Body() body: UpdateHotelAmenitiesBodyDTO, @Param('hotelId') hotelId: string) {
    return await this.hotelService.updateAmenities({ data: body, hotelId: +hotelId })
  }
}
