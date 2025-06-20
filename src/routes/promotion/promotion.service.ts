import { Injectable } from '@nestjs/common'
import { PromotionRepo } from './promotion.repo'
import {
  CreatePromotionBodyType,
  GetPromotionsQueryType,
  UpdatePromotionBodyType,
} from 'src/routes/promotion/promotion.model'
import {
  DeletePromotionIsActiveException,
  PromotionExpiredException,
  PromotionIsActiveException,
  PromotionNotFoundException,
  PromotionRangeDateAlreadyExistsException,
  PromotionUsedException,
} from './promotion.error'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { format } from 'date-fns'

@Injectable()
export class PromotionService {
  constructor(private promotionRepo: PromotionRepo) {}

  async findPromotionByFromAndUntil(validFrom: Date, validUntil: Date, id?: number) {
    const promotion = await this.promotionRepo.findPromotionByFromAndUntil(validFrom, validUntil)
    if (id && promotion?.id === id) {
      return
    }
    if (promotion) {
      throw PromotionRangeDateAlreadyExistsException
    }
  }

  async getPromotion(id: number) {
    return await this.promotionRepo.find(id)
  }

  async getAllPromotions(query: GetPromotionsQueryType) {
    return await this.promotionRepo.list(query)
  }

  async createPromotion({ data, userId }: { data: CreatePromotionBodyType; userId: number }) {
    await this.findPromotionByFromAndUntil(data.validFrom, data.validUntil)
    return await this.promotionRepo.create({ data, userId })
  }

  async updatePromotion({ data, id }: { data: UpdatePromotionBodyType; id: number }) {
    try {
      const currentPromotion = await this.promotionRepo.find(id)
      if (!currentPromotion) {
        throw PromotionNotFoundException
      }
      if (currentPromotion.order.length > 0) {
        throw PromotionUsedException
      }
      const currentFromDate = format(new Date(currentPromotion.validFrom), 'yyyy-MM-dd')
      const currentToDate = format(new Date(currentPromotion.validUntil), 'yyyy-MM-dd')
      const currentDate = format(new Date(), 'yyyy-MM-dd')

      if (currentFromDate <= currentDate && currentToDate >= currentDate) {
        throw PromotionIsActiveException
      }
      if (currentToDate <= currentDate) {
        throw PromotionExpiredException
      }

      await this.findPromotionByFromAndUntil(data.validFrom, data.validUntil, id)
      return await this.promotionRepo.update({ data, id })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PromotionNotFoundException
      }
      throw error
    }
  }

  async deletePromotion(id: number) {
    try {
      const currentPromotion = await this.promotionRepo.find(id)
      if (!currentPromotion) {
        throw PromotionNotFoundException
      }

      const currentFromDate = format(new Date(currentPromotion.validFrom), 'yyyy-MM-dd')
      const currentToDate = format(new Date(currentPromotion.validUntil), 'yyyy-MM-dd')
      const currentDate = format(new Date(), 'yyyy-MM-dd')

      if (currentFromDate <= currentDate && currentToDate >= currentDate) {
        throw DeletePromotionIsActiveException
      }
      return await this.promotionRepo.delete(id)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PromotionNotFoundException
      }
      throw error
    }
  }

  async findPromotionByValidFrom(validFrom: string, validUntil?: string) {
    return await this.promotionRepo.findPromotionByDate(validFrom, validUntil)
  }
}
