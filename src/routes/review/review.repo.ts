import { Injectable } from '@nestjs/common'
import { CreateReviewBodyType, GetReviewsQueryType } from 'src/routes/review/review.model'
import { REPUTATION_SCORE } from 'src/shared/constants/order.constant'
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
    const score = data.rating < 3 ? REPUTATION_SCORE.REVIEW_LESS_3 : REPUTATION_SCORE.REVIEW_FROM_3

    const [review] = await this.prismaService.$transaction([
      // 1. Tạo review
      this.prismaService.review.create({
        data,
      }),

      // 2. Tăng điểm người dùng
      this.prismaService.user.update({
        where: { id: data.userId },
        data: {
          earnPoint: { increment: 1 },
        },
      }),

      // 3. Cập nhật điểm uy tín và tính rating mới
      this.prismaService.hotel.update({
        where: { id: data.hotelId },
        data: {
          reputationScore: { increment: score },
        },
      }),
    ])

    // 4. Lấy lại tổng số lượt đánh giá và tổng rating
    const aggregate = await this.prismaService.review.aggregate({
      where: {
        hotelId: data.hotelId,
      },
      _avg: {
        rating: true,
      },
    })

    const avg = aggregate._avg.rating ?? data.rating
    const roundedRating = Math.round(avg * 2) / 2

    // 5. Cập nhật rating đã làm tròn
    await this.prismaService.hotel.update({
      where: { id: data.hotelId },
      data: {
        rating: roundedRating,
      },
    })

    return review
  }
}
