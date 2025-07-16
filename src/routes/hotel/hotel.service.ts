import { Injectable } from '@nestjs/common'
import { HotelRepo } from './hotel.repo'
import {
  CreateHotelAmenitiesBodyType,
  CreateHotelBodyType,
  GetHotelsQueryType,
  UpdateHotelAmenitiesBodyType,
  UpdateHotelBodyType,
} from 'src/routes/hotel/hotel.model'
import {
  HotelAlreadyExistsException,
  HotelAmenityAlreadyExistsException,
  HotelNotFoundException,
  HotelInOrderPendingException,
  HotelInConfirmOrderException,
  HotelInactiveException,
} from './hotel.error'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HotelStatus } from 'src/shared/constants/hotel.constant'

@Injectable()
export class HotelService {
  constructor(private hotelRepo: HotelRepo) {}

  async checkHotelInPendingOrder(id: number) {
    const hotel = await this.hotelRepo.findHotelIncludePendingOrder(id)
    if (hotel) {
      throw HotelInOrderPendingException
    }
  }

  async checkHotelPendingOrConfirmOrder(id: number) {
    const hotel = await this.hotelRepo.findHotelIncludePendingOrConfirmOrder(id)
    if (hotel) {
      throw HotelInConfirmOrderException
    }
  }

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

  async update({ data, id }: { data: UpdateHotelBodyType; id: number }) {
    try {
      const hotel = await this.hotelRepo.find(id)
      if (!hotel) {
        throw HotelNotFoundException
      }

      if (data.status === hotel.status && data.status === HotelStatus.INACTIVE) {
        throw HotelInactiveException
      }

      // Không được vô hiệu hoá khi có đơn đang đặt
      if (data.status === HotelStatus.INACTIVE) {
        await this.checkHotelInPendingOrder(id)
      }
      // Dành cho partner
      if (data.status === HotelStatus.ACTIVE && data.status === hotel.status) {
        // Không được cập nhật khi có đơn đang đặt hoặc đã đặt
        await this.checkHotelPendingOrConfirmOrder(id)
      }
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
    try {
      // Không được cập nhật khi có đơn đang đặt hoặc đã đặt
      await this.checkHotelPendingOrConfirmOrder(hotelId)
      return await this.hotelRepo.updateAmenities({ data, hotelId })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw HotelAmenityAlreadyExistsException
      }
      throw error
    }
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
    lat?: number
    lon?: number
  }) {
    return await this.hotelRepo.findHotels(query)
  }
}
