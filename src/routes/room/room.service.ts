import { Injectable } from '@nestjs/common'
import { RoomRepo } from './room.repo'
import { CreateRoomBodyType, UpdateRoomBodyType } from 'src/routes/room/room.model'
import {
  RoomInOrderException,
  RoomNotFoundException,
  RoomAlreadyExistsException,
  RoomInOrderConfirmedException,
} from 'src/routes/room/room.error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class RoomService {
  constructor(private roomRepo: RoomRepo) {}

  async checkRoomInPendingOrder(id: number) {
    const room = await this.roomRepo.findRoomIncludeOrderPending(id)
    if (room) {
      throw RoomInOrderException
    }
  }

  async checkRoomInConfirmedOrder(id: number) {
    const room = await this.roomRepo.findRoomIncludeOrderConfirm(id)
    if (room) {
      throw RoomInOrderConfirmedException
    }
  }

  async findById(id: number) {
    return await this.roomRepo.findById(id)
  }

  async findRoomsByHotelId(hotelId: number) {
    return await this.roomRepo.findRoomsByHotelId(hotelId)
  }

  async create(data: CreateRoomBodyType) {
    try {
      return await this.roomRepo.create(data)
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoomAlreadyExistsException
      }
      throw error
    }
  }

  async update({ data, id }: { data: UpdateRoomBodyType; id: number }) {
    try {
      await this.checkRoomInPendingOrder(id)
      const roomConfirm = await this.roomRepo.findRoomIncludeOrderConfirm(id)
      if (
        roomConfirm &&
        (data.policy !== roomConfirm.policy ||
          data.notePolicy !== roomConfirm.notePolicy ||
          data.rangeLimitDate !== roomConfirm.rangeLimitDate)
      ) {
        throw RoomInOrderConfirmedException
      }
      return await this.roomRepo.update({ data, id })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoomAlreadyExistsException
      }
      throw error
    }
  }

  async delete(id: number) {
    try {
      await this.checkRoomInPendingOrder(id)
      await this.checkRoomInConfirmedOrder(id)
      return await this.roomRepo.delete(id)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RoomNotFoundException
      }
      throw error
    }
  }

  async findAvailableRoomsByRoomId(roomId: number, start: string, end: string) {
    return await this.roomRepo.findAvailableRoomsByRoomId(roomId, start, end)
  }
}
