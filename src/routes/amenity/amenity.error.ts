import { BadRequestException } from '@nestjs/common'

export const AmenityAlreadyExistsException = new BadRequestException('Amenity already exists')

export const AmenityNotFoundException = new BadRequestException('Amenity not found')
