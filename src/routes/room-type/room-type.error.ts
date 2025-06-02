import { BadRequestException, UnprocessableEntityException } from '@nestjs/common'

export const RoomTypeAlreadyExistsException = new BadRequestException('Room type already exists')
export const RoomTypeNotFoundException = new BadRequestException('Room type not found')

export const TypeAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Type already exists',
    path: 'type',
  },
])
