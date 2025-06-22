import { BadRequestException, ForbiddenException, UnprocessableEntityException } from '@nestjs/common'

export const UserAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'User already exists',
    path: 'email',
  },
])

export const CannotUpdateAdminUserException = new ForbiddenException('Cannot update Admin user')

export const CannotDeleteAdminUserException = new ForbiddenException('Cannot delete Admin user')

export const CannotSetAdminRoleToUserException = new ForbiddenException('Cannot set Admin role to user')

export const RoleNotFoundException = new UnprocessableEntityException([
  {
    message: 'Role not found',
    path: 'roleId',
  },
])

export const CannotUpdateOrDeleteYourselfException = new ForbiddenException('Cannot update or delete yourself')

export const CannotUpdateUserAdminException = new ForbiddenException('Cannot update Admin user')

export const OrderPendingOrConfirmedException = new BadRequestException('User has pending or confirmed order')

export const UserHasPendingOrConfirmedOrderInHotelException = new BadRequestException(
  'User has pending or confirmed order in hotel',
)

export const UserNotFoundException = new BadRequestException('User not found')
