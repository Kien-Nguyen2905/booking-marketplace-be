import { Injectable } from '@nestjs/common'
import { CreateReviewBodyType, GetReviewsQueryType } from 'src/routes/review/review.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class ReviewRepo {
  constructor(private prismaService: PrismaService) {}

  async listByHotelId({ limit, page, hotelId }: GetReviewsQueryType & { hotelId: number }) {
    const skip = (page - 1) * limit
    const take = limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.review.count({
        where: {
          hotelId,
        },
      }),
      this.prismaService.review.findMany({
        skip,
        take,
        where: {
          hotelId,
        },
        include: {
          user: true,
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

  async create(data: CreateReviewBodyType & { userId: number }) {
    const score = data.rating < 3 ? -3 : 3
    const [review] = await this.prismaService.$transaction([
      this.prismaService.review.create({
        data,
      }),
      this.prismaService.user.update({
        where: {
          id: data.userId,
        },
        data: {
          earnPoint: {
            increment: 1,
          },
        },
      }),
      this.prismaService.hotel.update({
        where: {
          id: data.hotelId,
        },
        data: {
          reputationScore: {
            increment: score,
          },
        },
      }),
    ])
    return review
  }
}
