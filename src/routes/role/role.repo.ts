import { Injectable } from '@nestjs/common'
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from 'src/routes/role/role.model'
import { PermissionType } from 'src/shared/models/shared-permission.model'
import { RoleSchema, RoleType, RoleWithPermissionsType } from 'src/shared/models/shared-role.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RoleRepo {
  constructor(private prismaService: PrismaService) {}

  async list() {
    const data = await this.prismaService.role.findMany({})
    return data
  }

  async findById(id: number) {
    const role = await this.prismaService.role.findUnique({
      where: {
        id,
      },
      include: {
        PermissionToRole: {
          include: {
            permission: true,
          },
        },
      },
    })

    if (role) {
      const { PermissionToRole, ...rest } = role
      return {
        ...rest,
        permissions: role?.PermissionToRole.map((ptr) => ptr.permission) as PermissionType[],
      }
    } else {
      return null
    }
  }

  async create({ data }: { data: CreateRoleBodyType }) {
    return await this.prismaService.role.create({
      data,
    })
  }

  async update({ id, data }: { id: number; data: UpdateRoleBodyType }) {
    if (data.permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: {
          id: {
            in: data.permissionIds,
          },
        },
      })

      const deletedPermissions = permissions.filter((permission) => !data.permissionIds.includes(permission.id))
      if (deletedPermissions.length > 0) {
        const deletedIds = deletedPermissions.map((permission) => permission.id).join(', ')
        throw new Error(`Permissions with IDs have been deleted: ${deletedIds}`)
      }

      // Validate that all provided permissionIds exist
      if (permissions.length !== data.permissionIds.length) {
        const foundIds = permissions.map((p) => p.id)
        const missingIds = data.permissionIds.filter((id) => !foundIds.includes(id)).join(', ')
        throw new Error(`Permissions with IDs not found: ${missingIds}`)
      }
    }

    // Perform the update in a transaction to ensure atomicity
    const updatedRole = await this.prismaService.$transaction(async (prisma) => {
      // Update the role's fields
      await prisma.role.update({
        where: {
          id,
        },
        data: {
          name: data.name,
          description: data.description,
        },
      })

      // Delete existing PermissionToRole records for this role
      await prisma.permissionToRole.deleteMany({
        where: {
          roleId: id,
        },
      })

      // Create new PermissionToRole records
      if (data.permissionIds.length > 0) {
        await prisma.permissionToRole.createMany({
          data: data.permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        })
      }

      // Fetch the updated role with its permissions
      const roleWithPermissions = await prisma.role.findUnique({
        where: {
          id,
        },
        include: {
          PermissionToRole: {
            include: {
              permission: true,
            },
          },
        },
      })

      if (!roleWithPermissions) {
        throw new Error('Role not found after update')
      }

      return roleWithPermissions
    })

    // Transform the result to match RoleType
    const transformedRole: RoleType = {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      createdAt: updatedRole.createdAt,
    }

    // Validate the transformed data
    return RoleSchema.parse(transformedRole)
  }

  async delete({ id }: { id: number }) {
    return await this.prismaService.role.delete({
      where: {
        id,
      },
    })
  }
}
