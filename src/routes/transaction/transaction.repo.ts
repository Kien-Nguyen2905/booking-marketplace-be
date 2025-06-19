import { Injectable } from '@nestjs/common'
import { GetTransactionsQueryType } from 'src/routes/transaction/transaction.model'
import { TransactionType } from 'src/shared/constants/transaction.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class TransactionRepo {
  constructor(private prismaService: PrismaService) {}

  async list({
    limit,
    page,
    order = 'desc',
    orderBy = 'createdAt',
    dateFrom,
    dateTo,
    search,
    type,
  }: GetTransactionsQueryType) {
    const skip = (page - 1) * limit
    const take = limit

    const where: any = {}
    if (dateFrom && dateTo) {
      // Nếu có cả hai: nằm trong khoảng
      where.AND = [{ transactionDate: { gte: dateFrom } }, { transactionDate: { lte: dateTo } }]
    } else if (dateFrom) {
      // Nếu chỉ có dateFrom
      where.transactionDate = { gte: dateFrom }
    }
    if (search) {
      where.OR = [{ code: { contains: search, mode: 'insensitive' } }]
    }
    if (type) {
      where.type = type.toUpperCase() as TransactionType
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.transaction.count({ where }),
      this.prismaService.transaction.findMany({
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
    return this.prismaService.transaction.findUnique({ where: { id } })
  }
}
