import { Injectable } from '@nestjs/common'
import { PromotionRepo } from './promotion.repo'
import {
  CreateNotifyPromotionBodyType,
  CreatePromotionBodyType,
  GetPromotionsQueryType,
  UpdatePromotionBodyType,
} from 'src/routes/promotion/promotion.model'
import {
  PromotionAlreadyNotifyException,
  PromotionExpiredException,
  PromotionInPendingException,
  PromotionIsActiveException,
  PromotionNotFoundException,
  PromotionRangeDateAlreadyExistsException,
  PromotionUsedException,
} from './promotion.error'
import { generateRoomAdminToPartner, isNotFoundPrismaError } from 'src/shared/helpers'
import { WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { EVENT } from 'src/shared/constants/event.constant'
import { WebSocketGateway } from '@nestjs/websockets'
@Injectable()
@WebSocketGateway({ namespace: '' })
export class PromotionService {
  @WebSocketServer()
  server: Server
  constructor(private promotionRepo: PromotionRepo) {}

  async checkPromotionInPendingOrder(promotionId: number) {
    const promotion = await this.promotionRepo.findPromotionInPendingOrder(promotionId)
    if (promotion) {
      throw PromotionInPendingException
    }
  }

  async checkPromotionIsActive(promotionId: number) {
    const currentPromotion = await this.promotionRepo.find(promotionId)
    if (!currentPromotion) {
      throw PromotionNotFoundException
    }

    const currentFromDate = currentPromotion.validFrom
    const currentToDate = currentPromotion.validUntil

    const currentDate = new Date()

    if (currentFromDate <= currentDate && currentToDate >= currentDate) {
      throw PromotionIsActiveException
    }
  }

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
      const currentPromotion = await this.promotionRepo.findIncludeOrder(id)

      if (!currentPromotion) {
        throw PromotionUsedException
      }
      // Check if promotion has been used
      if (currentPromotion.order.length > 0) {
        throw PromotionUsedException
      }

      const currentFromDate = currentPromotion.validFrom
      const currentToDate = currentPromotion.validUntil

      const currentDate = new Date()

      // Check if promotion is active
      if (currentFromDate <= currentDate && currentToDate >= currentDate) {
        throw PromotionIsActiveException
      }

      // Check if promotion is expired
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
      await this.checkPromotionInPendingOrder(id)
      await this.checkPromotionIsActive(id)
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

  async notifyToPartners({ data, createdById }: { data: CreateNotifyPromotionBodyType; createdById: number }) {
    const promotion = await this.promotionRepo.find(data.promotionId)

    if (!promotion) {
      throw PromotionNotFoundException
    }

    if (promotion.notifiedAt) {
      throw PromotionAlreadyNotifyException
    }

    const currentDate = new Date()

    if (promotion.validUntil <= currentDate) {
      throw PromotionExpiredException
    }

    const notify = await this.promotionRepo.createNotifyPromotion({ data, createdById })
    this.server.to(generateRoomAdminToPartner()).emit(EVENT.NOTIFY, notify)
    return notify
  }
}
