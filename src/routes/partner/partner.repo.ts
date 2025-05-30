import { Injectable } from '@nestjs/common'
import {
  CreatePartnerBodyType,
  GetPartnersQueryType,
  UpdatePartnerBodyType,
  UpdatePartnerStatusBodyType,
} from 'src/routes/partner/partner.model'
import { HotelStatus } from 'src/shared/constants/hotel.constant'
import { PartnerStatus, PartnerStatusType } from 'src/shared/constants/partner.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { S3Service } from 'src/shared/services/s3.service'

@Injectable()
export class PartnerRepo {
  constructor(
    private prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async list({ limit, page, search, status }: GetPartnersQueryType) {
    const skip = (page - 1) * limit
    const take = limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.partner.count({
        where: {
          fullName: {
            contains: search,
            mode: 'insensitive',
          },
          status: status?.toUpperCase() as PartnerStatusType,
        },
      }),
      this.prismaService.partner.findMany({
        skip,
        take,
        where: {
          fullName: {
            contains: search,
            mode: 'insensitive',
          },
          status: status?.toUpperCase() as PartnerStatusType,
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

  async create({ data, userId }: { data: Omit<CreatePartnerBodyType, 'code'>; userId: number }) {
    return await this.prismaService.partner.create({
      data: {
        ...data,
        userId,
      },
    })
  }

  async update({ data, userId }: { data: Omit<UpdatePartnerBodyType, 'code'>; userId: number }) {
    return await this.prismaService.partner.update({
      where: {
        userId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async getPartnerById(id: number) {
    return await this.prismaService.partner.findUnique({
      where: {
        id,
      },
      include: {
        hotel: true,
      },
    })
  }

  async getPartnerByUserId(userId: number) {
    return await this.prismaService.partner.findUnique({
      where: {
        userId,
      },
      include: {
        hotel: true,
      },
    })
  }

  async updatePartnerStatus({
    data,
    userId,
    createdById,
    partnerRoleId,
    partnerId,
  }: {
    data: UpdatePartnerStatusBodyType
    userId: number
    createdById: number
    partnerRoleId: number
    partnerId: number
  }) {
    if (data.status === PartnerStatus.ACCEPTED) {
      const [partner] = await this.prismaService.$transaction([
        this.prismaService.partner.update({
          where: {
            userId,
          },
          data: {
            ...data,
            createdById,
            updatedAt: new Date(),
          },
        }),
        this.prismaService.user.update({
          where: {
            id: userId,
          },
          data: {
            roleId: partnerRoleId,
            updatedAt: new Date(),
          },
        }),
        this.prismaService.hotel.update({
          where: {
            partnerId,
          },
          data: {
            status: HotelStatus.ACTIVE,
            updatedAt: new Date(),
          },
        }),
      ])
      return partner
    }
    if (data.status === PartnerStatus.REJECTED) {
      const [hotel, partner] = await this.prismaService.$transaction([
        this.prismaService.hotel.delete({
          where: {
            partnerId,
          },
        }),
        this.prismaService.partner.delete({
          where: {
            userId,
          },
        }),
      ])
      if (partner && hotel) {
        await this.s3Service.deleteFiles(hotel.images)
      }
      return partner
    }
    return null
  }
}
