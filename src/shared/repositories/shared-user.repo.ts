import { Injectable } from '@nestjs/common'
import { PermissionType } from 'src/shared/models/shared-permission.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

export type WhereUniqueUserType = { id: number } | { email: string }

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findUnique(where: WhereUniqueUserType) {
    return await this.prismaService.user.findFirst({
      where: {
        ...where,
      },
    })
  }

  async update(where: { id: number }, data: Partial<UserType>) {
    return await this.prismaService.user.update({
      where: {
        ...where,
      },
      data,
    })
  }

  async findUniqueIncludeRolePermissions(where: WhereUniqueUserType) {
    const result = await this.prismaService.user.findFirst({
      where: {
        ...where,
      },
      include: {
        role: {
          include: {
            PermissionToRole: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })
    if (result) {
      const {
        role: { PermissionToRole, ...roleWithoutPermissionToRole },
        ...rest
      } = result
      return {
        ...rest,
        role: {
          ...roleWithoutPermissionToRole,
          permissions: PermissionToRole.map((ptr) => ptr.permission) as PermissionType[],
        },
      }
    } else {
      return null
    }
  }

  async findDeviceByUserAndUserAgent(where: {
    userId_userAgent: {
      userId: number
      userAgent: string
    }
  }) {
    return await this.prismaService.device.findUnique({
      where,
    })
  }
}
