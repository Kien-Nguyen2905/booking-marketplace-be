import { Inject, Injectable } from '@nestjs/common'
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  UpdatePermissionBodyType,
} from 'src/routes/permission/permission.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
@Injectable()
export class PermissionRepo {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async list(pagination: GetPermissionsQueryType) {
    const isPaginated = pagination.page != null && pagination.limit != null
    const skip = isPaginated ? (pagination.page! - 1) * pagination.limit! : undefined
    const take = isPaginated ? pagination.limit : undefined

    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({}),
      this.prismaService.permission.findMany({
        skip,
        take,
      }),
    ])

    const result = {
      data,
      totalItems,
      ...(isPaginated
        ? {
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(totalItems / pagination.limit!),
          }
        : {}),
    }

    return result
  }

  async findById(id: number) {
    return await this.prismaService.permission.findUnique({
      where: {
        id,
      },
    })
  }

  async create({ data }: { data: CreatePermissionBodyType }) {
    return await this.prismaService.permission.create({
      data,
    })
  }

  async update({ id, data }: { id: number; data: UpdatePermissionBodyType }) {
    return await this.prismaService.permission.update({
      where: {
        id,
      },
      data,
    })
  }

  async delete({ id }: { id: number }) {
    return await this.prismaService.permission.delete({
      where: {
        id,
      },
    })
  }
}
