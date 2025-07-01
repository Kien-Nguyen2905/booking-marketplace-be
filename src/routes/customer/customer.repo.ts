import { Injectable } from '@nestjs/common'
import { GetCustomersQueryType } from 'src/routes/customer/customer.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class CustomerRepo {
  constructor(private prismaService: PrismaService) {}

  async list({ limit, page, search }: GetCustomersQueryType) {
    const skip = (page - 1) * limit
    const totalItems = await this.prismaService.customer.count({
      where: {
        fullName: {
          contains: search,
          mode: 'insensitive',
        },
      },
    })
    const data = await this.prismaService.customer.findMany({
      skip,
      take: limit,
      where: {
        fullName: {
          contains: search,
          mode: 'insensitive',
        },
      },
    })
    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }
}
