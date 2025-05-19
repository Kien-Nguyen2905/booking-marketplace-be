import { Injectable } from '@nestjs/common'
import { RoleRepo } from 'src/routes/role/role.repo'
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from 'src/routes/role/role.model'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { ProhibitedActionOnBaseRoleException, RoleAlreadyExistsException } from 'src/routes/role/role.error'
import { ROLE_NAME } from 'src/shared/constants/role.constant'

@Injectable()
export class RoleService {
  constructor(private roleRepo: RoleRepo) {}

  async list() {
    const data = await this.roleRepo.list()
    return data
  }

  async findById(id: number) {
    const role = await this.roleRepo.findById(id)
    if (!role) {
      throw NotFoundRecordException
    }
    return role
  }

  async create({ data }: { data: CreateRoleBodyType }) {
    try {
      const role = await this.roleRepo.create({
        data,
      })
      return role
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  /**
   * Kiểm tra xem role có phải là 1 trong 3 role cơ bản không
   */
  private async verifyRole(roleId: number) {
    const role = await this.roleRepo.findById(roleId)
    if (!role) {
      throw NotFoundRecordException
    }
    const baseRoles: string[] = [ROLE_NAME.ADMIN, ROLE_NAME.CUSTOMER, ROLE_NAME.PARTNER]

    if (baseRoles.includes(role.name)) {
      throw ProhibitedActionOnBaseRoleException
    }
  }

  async update({ id, data }: { id: number; data: UpdateRoleBodyType }) {
    try {
      // await this.verifyRole(id)
      const updatedRole = await this.roleRepo.update({
        id,
        data,
      })
      return updatedRole
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id }: { id: number }) {
    try {
      await this.verifyRole(id)
      await this.roleRepo.delete({
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
