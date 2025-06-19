import { Injectable } from '@nestjs/common'
import { CreateReviewBodyType, GetReviewsQueryType } from 'src/routes/review/review.model'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { ReviewRepo } from 'src/routes/review/review.repo'
import { ReviewAlreadyExistsException } from 'src/routes/review/review.error'
import { OrderRepo } from 'src/routes/order/order.repo'
import { OrderNotCheckoutException, OrderNotFoundException } from 'src/routes/order/order.error'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'

@Injectable()
export class ReviewService {
  constructor(
    private reviewRepo: ReviewRepo,
    private orderRepo: OrderRepo,
  ) {}

  async checkOrderCheckout(orderId: number) {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw OrderNotFoundException
    }
    if (order.status !== ORDER_STATUS.CHECKOUT) {
      throw OrderNotCheckoutException
    }
    return order
  }

  async listByHotelId(query: GetReviewsQueryType & { hotelId: number }) {
    return await this.reviewRepo.listByHotelId(query)
  }

  async create(data: CreateReviewBodyType & { userId: number }) {
    try {
      await this.checkOrderCheckout(data.orderId)
      return await this.reviewRepo.create(data)
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw ReviewAlreadyExistsException
      }
      throw error
    }
  }
}
