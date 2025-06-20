import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { z } from 'zod'

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string().max(50),
  description: z.string().nullable(),
  createdAt: z.date().nullable(),
})

export const PermissionRoleSchema = z.object({
  id: z.number(),
  roleId: z.number(),
  permissionId: z.number(),
})

// Case Role
export const RoleWithPermissionsSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
})

export type RoleType = z.infer<typeof RoleSchema>
export type RoleWithPermissionsType = z.infer<typeof RoleWithPermissionsSchema>
