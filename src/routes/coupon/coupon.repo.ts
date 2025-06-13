import { Injectable } from '@nestjs/common'
import { CreateCouponBodyType, UpdateCouponBodyType } from 'src/routes/coupon/coupon.model'
import { generateCouponCode } from 'src/shared/helpers'

import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class CouponRepo {
  constructor(private prismaService: PrismaService) {}

  async list({
    limit,
    page,
    orderBy = 'createdAt',
    order = 'desc',
  }: {
    limit: number
    page: number
    search?: string
    status?: string
    order?: string
    orderBy?: string
  }) {
    const isPaginated = !!page && !!limit && page > 0 && limit > 0
    if (!isPaginated) {
      const data = await this.prismaService.coupon.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: { [orderBy]: order },
      })
      return {
        data,
        totalItems: 0,
        page: 0,
        limit: 0,
        totalPages: 0,
      }
    }
    const skip = (page - 1) * limit
    const take = limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.coupon.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.coupon.findMany({
        skip,
        take,
        where: {
          deletedAt: null,
        },
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
    return await this.prismaService.coupon.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  async create({ data, createdById }: { data: CreateCouponBodyType; createdById: number }) {
    return await this.prismaService.coupon.create({
      data: {
        ...data,
        code: generateCouponCode(),
        percentage: data.percentage / 100,
        createdById,
      },
    })
  }

  async update({ data, id }: { data: UpdateCouponBodyType; id: number }) {
    return await this.prismaService.coupon.update({
      where: {
        id,
      },
      data: {
        ...data,
        percentage: data.percentage / 100,
        updatedAt: new Date(),
      },
    })
  }

  async delete(id: number) {
    return await this.prismaService.coupon.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  async findByCode(code: string) {
    return await this.prismaService.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        deletedAt: null,
      },
    })
  }
}
