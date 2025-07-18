import { Injectable } from '@nestjs/common'
import { CouponRepo } from './coupon.repo'
import { CreateCouponBodyType, GetCouponsQueryType, UpdateCouponBodyType } from 'src/routes/coupon/coupon.model'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import {
  CouponAlreadyExistsException,
  CouponInPendingException,
  CouponNotFoundException,
  CouponUsedException,
  CouponUsedUpException,
} from 'src/routes/coupon/coupon.error'

@Injectable()
export class CouponService {
  constructor(private readonly couponRepo: CouponRepo) {}

  async checkCouponUsedUpById(id: number) {
    const coupon = await this.couponRepo.find(id)
    if (!coupon) {
      throw CouponNotFoundException
    }
    if (coupon.amount - coupon.available! !== 0) {
      throw CouponUsedException
    }
    if (coupon.available === 0) {
      throw CouponUsedUpException
    }
    return coupon
  }

  async checkCouponInPendingOrder(id: number) {
    const coupon = await this.couponRepo.findCouponInPendingOrder(id)
    if (coupon) {
      throw CouponInPendingException
    }
  }

  async find(id: number) {
    return await this.couponRepo.find(id)
  }

  async findMany({ limit, page, orderBy, order }: GetCouponsQueryType) {
    return await this.couponRepo.list({
      limit,
      page,
      orderBy,
      order,
    })
  }

  async create({ data, createdById }: { data: CreateCouponBodyType; createdById: number }) {
    try {
      return await this.couponRepo.create({ data, createdById })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw CouponAlreadyExistsException
      }
      throw error
    }
  }

  async update({ data, id }: { data: UpdateCouponBodyType; id: number }) {
    try {
      await this.checkCouponUsedUpById(id)
      return await this.couponRepo.update({ data, id })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw CouponAlreadyExistsException
      }
      if (isNotFoundPrismaError(error)) {
        throw CouponNotFoundException
      }
      throw error
    }
  }

  async delete(id: number) {
    try {
      await this.checkCouponInPendingOrder(id)
      return await this.couponRepo.delete(id)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw CouponNotFoundException
      }
      throw error
    }
  }

  async validateCoupon(code: string) {
    return await this.couponRepo.findByCode(code)
  }
}
