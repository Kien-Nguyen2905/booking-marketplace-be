import { Injectable } from '@nestjs/common'
import { CreateUserBodyType, GetUsersQueryType } from 'src/routes/user/user.model'
import { UserStatusType } from 'src/shared/constants/auth.constant'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class UserRepo {
  constructor(private prismaService: PrismaService) {}

  async list({ limit, page, search, role, status }: GetUsersQueryType) {
    const skip = (page - 1) * limit
    const take = limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          fullName: {
            contains: search,
            mode: 'insensitive',
          },
          role: {
            name: role?.toUpperCase(),
          },
          status: status?.toUpperCase() as UserStatusType,
        },
      }),
      this.prismaService.user.findMany({
        skip,
        take,
        include: {
          role: true,
        },
        where: {
          fullName: {
            contains: search,
            mode: 'insensitive',
          },
          role: {
            name: role?.toUpperCase(),
          },
          status: status?.toUpperCase() as UserStatusType,
        },
        orderBy: {
          createdAt: 'desc',
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

  async create({ data }: { data: CreateUserBodyType }) {
    return await this.prismaService.user.create({
      data,
    })
  }

  async updateRole({ data, userId }: { data: { roleId: number }; userId: number }) {
    return await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data,
    })
  }

  async findUserIncludePendingAndConfirmOrder(id: number) {
    return await this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        order: {
          where: {
            OR: [{ status: ORDER_STATUS.PENDING }, { status: ORDER_STATUS.CONFIRMED }],
          },
        },
      },
    })
  }

  async findUserIncludeExistPendingAndConfirmOrderInHotel(id: number) {
    return await this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        partner: {
          include: {
            hotel: {
              include: {
                order: {
                  where: {
                    OR: [{ status: ORDER_STATUS.PENDING }, { status: ORDER_STATUS.CONFIRMED }],
                  },
                },
              },
            },
          },
        },
      },
    })
  }
}
