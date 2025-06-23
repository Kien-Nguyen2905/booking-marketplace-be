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
import {
  RoomTypeAlreadyHasRoomException,
  RoomTypeInOrderException,
  RoomTypeNotFoundException,
  TypeAlreadyExistsException,
} from './room-type.error'
import { isForeignKeyConstraintPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HotelNotFoundException } from 'src/routes/hotel/hotel.error'
import { RoomRepo } from 'src/routes/room/room.repo'

@Injectable()
export class RoomTypeService {
  constructor(
    private roomTypeRepo: RoomTypeRepo,
    private roomRepo: RoomRepo,
  ) {}

  async checkRoomTypeInOrder(roomTypeId: number) {
    const roomType = await this.roomTypeRepo.findRoomIncludePendingOrConfirmedOrder(roomTypeId)
    if (roomType) {
      throw RoomTypeInOrderException
    }
  }

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
      await this.checkRoomTypeInOrder(data.id)
      return await this.roomTypeRepo.update(data)
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw TypeAlreadyExistsException
      }
      throw error
    }
  }

  async delete(id: number) {
    const rooms = await this.roomRepo.findRoomByRoomTypeId(id)
    if (rooms?.length > 0) {
      throw RoomTypeAlreadyHasRoomException
    }
    await this.checkRoomTypeInOrder(id)
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
