import { BadRequestException, UnprocessableEntityException } from '@nestjs/common'

export const RoomTypeAlreadyExistsException = new BadRequestException('Room type already exists')
export const RoomTypeNotFoundException = new BadRequestException('Room type not found')
export const RoomTypeAlreadyHasRoomException = new BadRequestException('Room type already has room')
export const TypeAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Type already exists',
    path: 'type',
  },
])

export const RoomTypeInOrderException = new BadRequestException('Room type is in pending or confirmed order')

export const RoomTypeUpdatedException = new BadRequestException('Room type has been updated, Please try again')
