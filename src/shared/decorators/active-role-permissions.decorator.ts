import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REQUEST_ROLE_PERMISSIONS } from 'src/shared/constants/auth.constant'
import { RoleWithPermissionsType } from 'src/shared/models/shared-role.model'

export const ActiveRolePermissions = createParamDecorator(
  (field: keyof RoleWithPermissionsType | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    const rolePermissions: RoleWithPermissionsType | undefined = request[REQUEST_ROLE_PERMISSIONS]
    return field ? rolePermissions?.[field] : rolePermissions
  },
)
