import { BadRequestException } from '@nestjs/common'

export const HotelAlreadyExistsException = new BadRequestException('Partner have hotel already exists')

export const HotelNotFoundException = new BadRequestException('Hotel not found')

export const HotelAmenityAlreadyExistsException = new BadRequestException('Hotel amenity already exists')

export const HotelInOrderPendingException = new BadRequestException('Hotel is being ordered')
