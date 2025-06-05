import { Injectable } from '@nestjs/common'
import { HotelRepo } from './hotel.repo'
import {
  CreateHotelAmenitiesBodyType,
  CreateHotelBodyType,
  GetHotelsQueryType,
  UpdateHotelAmenitiesBodyType,
  UpdateHotelBodyType,
} from 'src/routes/hotel/hotel.model'
import { HotelAlreadyExistsException, HotelAmenityAlreadyExistsException, HotelNotFoundException } from './hotel.error'
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

  async checkHotelExist(hotelId: number) {
    const hotel = await this.hotelRepo.find(hotelId)
    if (!hotel) {
      throw HotelNotFoundException
    }
  }

  async createAmenities(data: CreateHotelAmenitiesBodyType) {
    try {
      await this.checkHotelExist(data.hotelId)
      return await this.hotelRepo.createAmenities({ data })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw HotelAmenityAlreadyExistsException
      }
      throw error
    }
  }

  async findAmenitiesByHotelId(hotelId: number) {
    await this.checkHotelExist(hotelId)
    return await this.hotelRepo.findAmenitiesByHotelId(hotelId)
  }

  async updateAmenities({ data, hotelId }: { data: UpdateHotelAmenitiesBodyType; hotelId: number }) {
    await this.checkHotelExist(hotelId)
    return await this.hotelRepo.updateAmenities({ data, hotelId })
  }

  async getHotelsByProvinceCode(provinceCode: number) {
    return await this.hotelRepo.findHotelsByProvinceCode(provinceCode)
  }

  async countHotel(provinceCodes: number[]) {
    return await this.hotelRepo.countHotel(provinceCodes)
  }

  async findHotels(query: {
    province: number
    start: string // DD-MM-YYYY
    end: string // DD-MM-YYYY
    adult: number
    child?: number
    available: number
    page: number
    limit: number
  }) {
    return await this.hotelRepo.findHotels(query)
  }
}
