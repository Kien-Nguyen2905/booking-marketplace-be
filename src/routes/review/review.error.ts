import { BadRequestException } from '@nestjs/common'

export const ReviewAlreadyExistsException = new BadRequestException('Review already exists')
