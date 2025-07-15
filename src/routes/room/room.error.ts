import { BadRequestException, UnprocessableEntityException } from '@nestjs/common'

export const RoomAlreadyExistsException = new BadRequestException('Room already exists')
export const RoomNotFoundException = new BadRequestException('Room not found')

export const RoomPolicyAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Room policy already exists',
    path: 'policy',
  },
])

export const RoomInOrderException = new BadRequestException('Room is being ordered')

export const RoomInOrderConfirmedException = new BadRequestException('Room in order confirmed')

export const RoomUpdatedException = new BadRequestException('Room has been updated, Please try again')
