import { Injectable } from '@nestjs/common'
import { PermissionRepo } from 'src/routes/permission/permission.repo'
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  UpdatePermissionBodyType,
} from 'src/routes/permission/permission.model'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { PermissionAlreadyExistsException } from 'src/routes/permission/permission.error'

@Injectable()
export class PermissionService {
  constructor(private permissionRepo: PermissionRepo) {}

  async list(pagination: GetPermissionsQueryType) {
    const data = await this.permissionRepo.list(pagination)

    return data
  }

  async findById(id: number) {
    const permission = await this.permissionRepo.findById(id)
    if (!permission) {
      throw NotFoundRecordException
    }
    return permission
  }

  async create({ data }: { data: CreatePermissionBodyType }) {
    try {
      return await this.permissionRepo.create({
        data,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async update({ id, data }: { id: number; data: UpdatePermissionBodyType }) {
    try {
      const permission = await this.permissionRepo.update({
        id,
        data,
      })
      return permission
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id }: { id: number }) {
    try {
      await this.permissionRepo.delete({
        id,
      })
      return {
        message: 'Delete successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
