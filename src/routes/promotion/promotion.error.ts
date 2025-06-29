import { BadRequestException } from '@nestjs/common'

export const PromotionAlreadyExistsException = new BadRequestException('Promotion already exists')

export const PromotionRangeDateAlreadyExistsException = new BadRequestException('Promotion range date already exists')

export const PromotionNotFoundException = new BadRequestException('Promotion not found')

export const PromotionIsActiveException = new BadRequestException('Promotion is active')

export const PromotionExpiredException = new BadRequestException('Promotion is expired')

export const PromotionUsedException = new BadRequestException('Promotion has been used')

export const PromotionInPendingException = new BadRequestException('Promotion is in pending order')

export const PromotionAlreadyNotifyException = new BadRequestException('Promotion has been notified')
