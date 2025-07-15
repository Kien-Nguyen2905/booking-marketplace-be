import { BadRequestException } from '@nestjs/common'

export const HotelAlreadyExistsException = new BadRequestException('Partner have hotel already exists')

export const HotelNotFoundException = new BadRequestException('Hotel not found')

export const HotelUpdatedException = new BadRequestException('Hotel has been updated, Please try again')

export const HotelAmenityAlreadyExistsException = new BadRequestException('Hotel amenity already exists')

export const HotelInOrderPendingException = new BadRequestException('Hotel is being ordered')

export const HotelInConfirmOrderException = new BadRequestException('Hotel in pending or confirmed order')

export const HotelInactiveException = new BadRequestException('Hotel is inactive')
