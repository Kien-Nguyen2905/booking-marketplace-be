import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

export const NotFoundRecordException = new NotFoundException('Not Found')

export const InvalidPasswordException = new UnprocessableEntityException([
  {
    message: 'Password is incorrect',
    path: 'password',
  },
])
