import { BadRequestException } from '@nestjs/common'

export const HotelAlreadyExistsException = new BadRequestException('Partner have hotel already exists')

export const HotelNotFoundException = new BadRequestException('Hotel not found')
