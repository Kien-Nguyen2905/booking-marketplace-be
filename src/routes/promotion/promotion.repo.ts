import { Injectable } from '@nestjs/common'
import { endOfDay, format, isWithinInterval, parse, startOfDay } from 'date-fns'
import {
  CreatePromotionBodyType,
  GetPromotionsQueryType,
  UpdatePromotionBodyType,
} from 'src/routes/promotion/promotion.model'
import { toStartOfUTCDate } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class PromotionRepo {
  constructor(private prismaService: PrismaService) {}

  async findPromotionByFromAndUntil(validFrom: Date, validUntil: Date) {
    return await this.prismaService.promotion.findFirst({
      where: {
        deletedAt: null,
        AND: [{ validFrom: { lte: validUntil } }, { validUntil: { gte: validFrom } }],
      },
    })
  }

  async list({ limit, page, order = 'desc', orderBy = 'createdAt', dateFrom, dateTo }: GetPromotionsQueryType) {
    const skip = (page - 1) * limit
    const take = limit

    const where: any = {
      deletedAt: null,
    }
    if (dateFrom && dateTo) {
      // Nếu có cả hai: nằm trong khoảng
      where.AND = [{ validFrom: { gte: dateFrom } }, { validUntil: { lte: dateTo } }]
    } else if (dateFrom) {
      // Nếu chỉ có dateFrom
      where.validFrom = { gte: dateFrom }
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.promotion.count({ where }),
      this.prismaService.promotion.findMany({
        skip,
        take,
        where,
        orderBy: {
          [orderBy]: order,
        },
      }),
    ])

    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async find(id: number) {
    return await this.prismaService.promotion.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  async create({ data, userId }: { data: CreatePromotionBodyType; userId: number }) {
    return await this.prismaService.promotion.create({
      data: {
        ...data,
        createdById: userId,
        percentage: data.percentage / 100,
        sharePercentage: data.sharePercentage / 100,
      },
    })
  }

  async update({ data, id }: { data: UpdatePromotionBodyType; id: number }) {
    return await this.prismaService.promotion.update({
      where: {
        id,
      },
      data: {
        ...data,
        updatedAt: new Date(),
        percentage: data.percentage / 100,
        sharePercentage: data.sharePercentage / 100,
      },
    })
  }

  async delete(id: number) {
    return await this.prismaService.promotion.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  async findPromotionByDate(validFrom?: string, validUntil?: string) {
    // parse về ISOString để query prisma
    const startDate = validFrom ? parse(validFrom, 'dd-MM-yyyy', new Date()) : new Date()
    const endDate = validUntil ? parse(validUntil, 'dd-MM-yyyy', new Date()) : startDate
    // Query promotions that overlap with the given date range
    const promotions = await this.prismaService.promotion.findMany({
      where: {
        deletedAt: null,
        AND: [{ validFrom: { lt: toStartOfUTCDate(endDate) } }, { validUntil: { gt: toStartOfUTCDate(startDate) } }],
      },
      select: {
        id: true,
        title: true,
        percentage: true,
        sharePercentage: true,
        validFrom: true,
        validUntil: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        validFrom: 'asc',
      },
    })
    const today = toStartOfUTCDate(new Date())

    const todayPromotions = promotions.find((promotion) => {
      const promoStart = new Date(promotion.validFrom)
      const promoEnd = new Date(promotion.validUntil)
      return today >= promoStart && today < promoEnd
    })

    return {
      promotions, // All promotions overlapping with the input range
      todayPromotions, // Promotions active today
    }
  }
}
