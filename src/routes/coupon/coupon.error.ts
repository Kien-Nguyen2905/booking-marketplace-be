import { BadRequestException, UnprocessableEntityException } from '@nestjs/common'

export const CouponAlreadyExistsException = new UnprocessableEntityException([
  { message: 'Coupon code already exists', path: 'title' },
])

export const CouponNotFoundException = new BadRequestException('Coupon not found')

export const CouponUsedException = new BadRequestException('Coupon has been used')

export const CouponInPendingException = new BadRequestException('Coupon is in pending order')
