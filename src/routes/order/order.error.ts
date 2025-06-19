import { BadRequestException, ConflictException } from '@nestjs/common'

export const ConflictRoomAvailabilityException = new ConflictException('Conflict room availability')

export const OrderCannotCheckoutException = new BadRequestException('Cannot checkout before check-in date')

export const OrderCannotCheckout1dayException = new BadRequestException('Cannot checkout before 1 day check-in date')

export const OrderNotFoundException = new BadRequestException('Order not found')

export const OrderNotCheckoutException = new BadRequestException('Order not checkout')
