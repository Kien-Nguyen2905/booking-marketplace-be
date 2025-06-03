import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { RoomService } from './room.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateRoomBodyDTO,
  CreateRoomResDTO,
  DeleteRoomResDTO,
  GetRoomByIdResDTO,
  GetRoomsByHotelIdResDTO,
  UpdateRoomBodyDTO,
  UpdateRoomResDTO,
} from 'src/routes/room/room.dto'

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('hotel/:hotelId')
  @ZodSerializerDto(GetRoomsByHotelIdResDTO)
  async getRoomsByHotelId(@Param('hotelId') hotelId: string) {
    return await this.roomService.findRoomsByHotelId(+hotelId)
  }

  @Get('/:id')
  @ZodSerializerDto(GetRoomByIdResDTO)
  async getRoomById(@Param('id') id: string) {
    return await this.roomService.findById(+id)
  }

  @Post()
  @ZodSerializerDto(CreateRoomResDTO)
  async create(@Body() body: CreateRoomBodyDTO) {
    return await this.roomService.create(body)
  }

  @Put('/:id')
  @ZodSerializerDto(UpdateRoomResDTO)
  async update(@Body() body: UpdateRoomBodyDTO, @Param('id') id: string) {
    return await this.roomService.update({ data: body, id: +id })
  }

  @Delete('/:id')
  @ZodSerializerDto(DeleteRoomResDTO)
  async delete(@Param('id') id: string) {
    return await this.roomService.delete(+id)
  }
}
