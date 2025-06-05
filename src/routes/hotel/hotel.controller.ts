import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { HotelService } from './hotel.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateHotelAmenitiesBodyDTO,
  CreateHotelAmenitiesResDTO,
  CreateHotelBodyDTO,
  CreateHotelResDTO,
  GetFindHotelsQueryDTO,
  GetFindHotelsResDTO,
  GetHotelResDTO,
  GetHotelsByProvinceCodeResDTO,
  GetHotelsQueryDTO,
  GetHotelsResDTO,
  GetQuantityHotelsByProvinceCodeBodyDTO,
  GetQuantityHotelsByProvinceCodeResDTO,
  UpdateHotelAmenitiesBodyDTO,
  UpdateHotelAmenitiesResDTO,
  UpdateHotelBodyDTO,
  UpdateHotelResDTO,
} from 'src/routes/hotel/hotel.dto'
import { GetAmenitiesResDTO } from 'src/routes/amenity/amenity.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get()
  @ZodSerializerDto(GetHotelsResDTO)
  async list(@Query() query: GetHotelsQueryDTO) {
    return await this.hotelService.list(query)
  }

  @Get('find-hotels')
  @IsPublic()
  @ZodSerializerDto(GetFindHotelsResDTO)
  async findHotels(@Query() query: GetFindHotelsQueryDTO) {
    return await this.hotelService.findHotels(query)
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
  @ZodSerializerDto(CreateHotelAmenitiesResDTO)
  async createAmenities(@Body() body: CreateHotelAmenitiesBodyDTO) {
    return await this.hotelService.createAmenities(body)
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

  @Post('province/count')
  @ZodSerializerDto(GetQuantityHotelsByProvinceCodeResDTO)
  @IsPublic()
  async countHotel(@Body() body: GetQuantityHotelsByProvinceCodeBodyDTO) {
    return await this.hotelService.countHotel(body.provinceCodes)
  }

  @Get('province/:provinceCode')
  @ZodSerializerDto(GetHotelsByProvinceCodeResDTO)
  @IsPublic()
  async getHotelsByProvinceCode(@Param('provinceCode') provinceCode: string) {
    return await this.hotelService.getHotelsByProvinceCode(+provinceCode)
  }
}
