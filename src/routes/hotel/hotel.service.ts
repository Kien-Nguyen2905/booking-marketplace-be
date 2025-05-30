import { Injectable } from '@nestjs/common'
import { HotelRepo } from './hotel.repo'
import { CreateHotelBodyType, GetHotelsQueryType, UpdateHotelBodyType } from 'src/routes/hotel/hotel.model'
import { HotelAlreadyExistsException, HotelNotFoundException } from './hotel.error'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class HotelService {
  constructor(private hotelRepo: HotelRepo) {}

  async list(query: GetHotelsQueryType) {
    return this.hotelRepo.list(query)
  }

  async create(body: CreateHotelBodyType) {
    try {
      return await this.hotelRepo.create(body)
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw HotelAlreadyExistsException
      }
      throw error
    }
  }

  async find(id: number) {
    return await this.hotelRepo.find(id)
  }

  async findByPartnerId(partnerId: number) {
    const hotel = await this.hotelRepo.findByPartnerId(partnerId)
    if (!hotel) {
      throw HotelNotFoundException
    }
    return hotel
  }

  async update({ data, id }: { data: UpdateHotelBodyType; id: number }) {
    try {
      return await this.hotelRepo.update({ data, id })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw HotelAlreadyExistsException
      }
      throw error
    }
  }
}
