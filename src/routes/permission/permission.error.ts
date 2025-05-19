import { UnprocessableEntityException } from '@nestjs/common'

export const PermissionAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'The path permission already exists',
    path: 'path',
  },
  {
    message: 'The method permission already exists',
    path: 'method',
  },
])
