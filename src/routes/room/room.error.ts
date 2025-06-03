import { BadRequestException, UnprocessableEntityException } from '@nestjs/common'

export const RoomAlreadyExistsException = new BadRequestException('Room already exists')
export const RoomNotFoundException = new BadRequestException('Room not found')

export const RoomPolicyAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Room policy already exists',
    path: 'policy',
  },
])
