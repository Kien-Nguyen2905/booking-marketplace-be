import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { RoomTypeService } from './room-type.service'
import {
  CreateRoomBedBodyDTO,
  CreateRoomBedResDTO,
  CreateRoomTypeAmenitiesBodyDTO,
  CreateRoomTypeAmenitiesResDTO,
  CreateRoomTypeBodyDTO,
  CreateRoomTypeResDTO,
  DeleteRoomTypeResDTO,
  GetRoomTypeByHotelIdResDTO,
  GetRoomTypeByIdResDTO,
  UpdateRoomBedBodyDTO,
  UpdateRoomBedResDTO,
  UpdateRoomTypeAmenitiesBodyDTO,
  UpdateRoomTypeAmenitiesResDTO,
  UpdateRoomTypeBodyDTO,
  UpdateRoomTypeResDTO,
} from 'src/routes/room-type/room-type.dto'
import { ZodSerializerDto } from 'nestjs-zod'

@Controller('room-types')
export class RoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  @Get('/:id')
  @ZodSerializerDto(GetRoomTypeByIdResDTO)
  async getRoomTypeById(@Param('id') id: string) {
    return await this.roomTypeService.getRoomTypeById(+id)
  }

  @Get('hotel/:hotelId')
  @ZodSerializerDto(GetRoomTypeByHotelIdResDTO)
  async getRoomTypeByHotelId(@Param('hotelId') hotelId: string) {
    return await this.roomTypeService.getRoomTypeByHotelId(+hotelId)
  }

  @Post()
  @ZodSerializerDto(CreateRoomTypeResDTO)
  async create(@Body() body: CreateRoomTypeBodyDTO) {
    return await this.roomTypeService.create(body)
  }

  @Put('/:id')
  @ZodSerializerDto(UpdateRoomTypeResDTO)
  async update(@Body() body: UpdateRoomTypeBodyDTO, @Param('id') id: string) {
    return await this.roomTypeService.update({ ...body, id: +id })
  }

  @Delete('/:id')
  @ZodSerializerDto(DeleteRoomTypeResDTO)
  async delete(@Param('id') id: string) {
    return await this.roomTypeService.delete(+id)
  }

  @Post('/room-beds/:roomTypeId')
  @ZodSerializerDto(CreateRoomBedResDTO)
  async createRoomBed(@Body() body: CreateRoomBedBodyDTO, @Param('roomTypeId') roomTypeId: string) {
    return await this.roomTypeService.createRoomBed({ ...body, roomTypeId: +roomTypeId })
  }

  @Put('/room-beds/:id')
  @ZodSerializerDto(UpdateRoomBedResDTO)
  async updateRoomBed(@Body() body: UpdateRoomBedBodyDTO, @Param('id') id: string) {
    return await this.roomTypeService.updateRoomBed({ ...body, roomTypeId: +id })
  }

  @Post('/amenities/:roomTypeId')
  @ZodSerializerDto(CreateRoomTypeAmenitiesResDTO)
  async createRoomTypeAmenities(@Body() body: CreateRoomTypeAmenitiesBodyDTO, @Param('roomTypeId') roomTypeId: string) {
    return await this.roomTypeService.createRoomTypeAmenities({ ...body, roomTypeId: +roomTypeId })
  }

  @Put('/amenities/:id')
  @ZodSerializerDto(UpdateRoomTypeAmenitiesResDTO)
  async updateRoomTypeAmenities(@Body() body: UpdateRoomTypeAmenitiesBodyDTO, @Param('id') id: string) {
    return await this.roomTypeService.updateRoomTypeAmenities({ ...body, roomTypeId: +id })
  }
}
