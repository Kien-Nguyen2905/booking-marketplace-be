import { Injectable } from '@nestjs/common'
import { RoomTypeRepo } from './room-type.repo'
import {
  CreateRoomBedBodyType,
  CreateRoomTypeAmenitiesBodyType,
  CreateRoomTypeBodyType,
  UpdateRoomBedBodyType,
  UpdateRoomTypeAmenitiesBodyType,
  UpdateRoomTypeBodyType,
} from 'src/routes/room-type/room-type.model'
import { RoomTypeNotFoundException, TypeAlreadyExistsException } from './room-type.error'
import { isForeignKeyConstraintPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HotelNotFoundException } from 'src/routes/hotel/hotel.error'

@Injectable()
export class RoomTypeService {
  constructor(private roomTypeRepo: RoomTypeRepo) {}

  async getRoomTypeById(roomTypeId: number) {
    return await this.roomTypeRepo.findById(roomTypeId)
  }

  async checkRoomTypeExist(roomTypeId: number) {
    const roomType = await this.roomTypeRepo.findById(roomTypeId)
    if (!roomType) {
      throw RoomTypeNotFoundException
    }
  }

  async getRoomTypeByHotelId(hotelId: number) {
    return await this.roomTypeRepo.findByHotelId(hotelId)
  }

  async create(data: CreateRoomTypeBodyType) {
    try {
      return await this.roomTypeRepo.create(data)
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw TypeAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw HotelNotFoundException
      }
      throw error
    }
  }

  async update(data: UpdateRoomTypeBodyType & { id: number }) {
    try {
      return await this.roomTypeRepo.update(data)
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw TypeAlreadyExistsException
      }
      throw error
    }
  }

  async delete(id: number) {
    await this.checkRoomTypeExist(id)
    return await this.roomTypeRepo.delete(id)
  }

  async createRoomBed(data: CreateRoomBedBodyType & { roomTypeId: number }) {
    await this.checkRoomTypeExist(data.roomTypeId)
    return await this.roomTypeRepo.createRoomBed({ data, roomTypeId: data.roomTypeId })
  }

  async updateRoomBed(data: UpdateRoomBedBodyType & { roomTypeId: number }) {
    await this.checkRoomTypeExist(data.roomTypeId)
    return await this.roomTypeRepo.updateRoomBed({ data, roomTypeId: data.roomTypeId })
  }

  async createRoomTypeAmenities(data: CreateRoomTypeAmenitiesBodyType & { roomTypeId: number }) {
    await this.checkRoomTypeExist(data.roomTypeId)
    return await this.roomTypeRepo.createRoomTypeAmenities({ data, roomTypeId: data.roomTypeId })
  }

  async updateRoomTypeAmenities(data: UpdateRoomTypeAmenitiesBodyType & { roomTypeId: number }) {
    await this.checkRoomTypeExist(data.roomTypeId)
    return await this.roomTypeRepo.updateRoomTypeAmenities({ data, roomTypeId: data.roomTypeId })
  }
}
