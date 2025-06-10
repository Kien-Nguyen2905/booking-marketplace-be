import { Injectable } from '@nestjs/common'
import { CreateNotifyBodyType, GetNotifiesByRecipientIdQueryType } from 'src/routes/notify/notify.model'
import { PartnerStatus } from 'src/shared/constants/partner.constant'
import { ROLE_NAME } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class NotifyRepo {
  constructor(private prismaService: PrismaService) {}

  async list({
    limit,
    page,
    recipientId,
    roleName,
  }: GetNotifiesByRecipientIdQueryType & { recipientId?: number; roleName?: string }) {
    const whereClause = {
      recipientId: roleName === ROLE_NAME.ADMIN ? null : recipientId,
    }
    const isPaginated = !!page && !!limit && page > 0 && limit > 0
    if (!isPaginated) {
      const data = await this.prismaService.notify.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
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
      this.prismaService.notify.count({ where: whereClause }),
      this.prismaService.notify.findMany({
        skip,
        take,
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const totalPages = Math.ceil(totalItems / limit)

    return {
      data,
      totalItems,
      page,
      limit,
      totalPages,
    }
  }

  async create({ data, createdById }: { data: CreateNotifyBodyType; createdById: number }) {
    return await this.prismaService.notify.create({
      data: {
        ...data,
        createdById,
        createdAt: new Date(),
      },
    })
  }

  async updateReadAt({ id }: { id: number }) {
    return await this.prismaService.notify.update({
      where: {
        id,
      },
      data: {
        readAt: new Date(),
      },
    })
  }

  async createMultiplePartner({ data, createdById }: { data: CreateNotifyBodyType; createdById: number }) {
    const partnerIds = await this.prismaService.partner.findMany({
      where: {
        status: PartnerStatus.ACCEPTED,
      },
      select: {
        userId: true,
      },
    })
    const notify = await this.prismaService.notify.createMany({
      data: partnerIds.map((partner) => ({
        ...data,
        createdById,
        createdAt: new Date(),
        recipientId: partner.userId,
      })),
    })
    return notify
  }
}
