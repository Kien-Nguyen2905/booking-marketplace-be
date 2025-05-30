import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { HotelService } from './hotel.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateHotelBodyDTO,
  CreateHotelResDTO,
  GetHotelResDTO,
  GetHotelsQueryDTO,
  GetHotelsResDTO,
  UpdateHotelBodyDTO,
  UpdateHotelResDTO,
} from 'src/routes/hotel/hotel.dto'

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
}
