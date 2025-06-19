import { Injectable } from '@nestjs/common'
import { CreateRefundBodyType, GetRefundsQueryType } from 'src/routes/refund/refund.model'
import { REFUND_STATUS, RefundStatusType } from 'src/shared/constants/refund.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RefundRepo {
  constructor(private prismaService: PrismaService) {}

  async list({
    limit,
    page,
    order = 'desc',
    orderBy = 'createdAt',
    dateFrom,
    dateTo,
    search,
    status,
  }: GetRefundsQueryType) {
    const skip = (page - 1) * limit
    const take = limit

    const where: any = {}
    if (dateFrom && dateTo) {
      // Nếu có cả hai: nằm trong khoảng
      where.AND = [{ createdAt: { gte: dateFrom } }, { createdAt: { lte: dateTo } }]
    } else if (dateFrom) {
      // Nếu chỉ có dateFrom
      where.createdAt = { gte: dateFrom }
    }
    if (search) {
      where.OR = [{ orderId: { equals: Number(search) } }]
    }
    if (status) {
      where.status = status.toUpperCase() as RefundStatusType
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.refund.count({ where }),
      this.prismaService.refund.findMany({
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

  async findById(id: number) {
    return this.prismaService.refund.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    })
  }

  async listByUserId({
    limit,
    page,
    order = 'desc',
    orderBy = 'createdAt',
    dateFrom,
    dateTo,
    search,
    status,
    userId,
  }: GetRefundsQueryType & { userId: number }) {
    const skip = (page - 1) * limit
    const take = limit

    const where: any = { order: { userId } }

    if (dateFrom && dateTo) {
      // Nếu có cả hai: nằm trong khoảng
      where.AND = [{ checkinDate: { equals: dateFrom } }, { checkoutDate: { lte: dateTo } }]
    } else if (dateFrom) {
      // Nếu chỉ có dateFrom
      where.checkinDate = { equals: dateFrom }
    }
    if (search) {
      where.OR = [{ id: { equals: Number(search) } }]
    }
    if (status) {
      where.status = status.toUpperCase() as RefundStatusType
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.refund.count({ where }),
      this.prismaService.refund.findMany({
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

  async create(data: CreateRefundBodyType & { createdById: number }) {
    return this.prismaService.refund.create({
      data: { ...data, status: REFUND_STATUS.PENDING },
    })
  }
}
