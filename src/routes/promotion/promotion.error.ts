import { BadRequestException } from '@nestjs/common'

export const PromotionAlreadyExistsException = new BadRequestException('Promotion already exists')

export const PromotionRangeDateAlreadyExistsException = new BadRequestException('Promotion range date already exists')

export const PromotionNotFoundException = new BadRequestException('Promotion not found')

export const PromotionIsActiveException = new BadRequestException('Cannot update promotion active')

export const DeletePromotionIsActiveException = new BadRequestException('Cannot delete promotion active')

export const PromotionExpiredException = new BadRequestException('Cannot update promotion expired')
