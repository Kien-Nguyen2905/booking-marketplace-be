import { Injectable } from '@nestjs/common'
import { UserRepo } from 'src/routes/user/user.repo'
import { CreateUserBodyType, GetUsersQueryType, UpdateUserBodyType } from 'src/routes/user/user.model'
import { NotFoundRecordException } from 'src/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/shared/helpers'
import {
  CannotUpdateYourselfException,
  CannotUpdateUserAdminException,
  OrderPendingOrConfirmedException,
  RoleNotFoundException,
  UserAlreadyExistsException,
  PartnerHasPendingOrConfirmedOrderInHotelException,
  UserNotFoundException,
} from 'src/routes/user/user.error'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { ROLE_NAME } from 'src/shared/constants/role.constant'
import { RoleRepo } from 'src/routes/role/role.repo'

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepo,
    private hashingService: HashingService,
    private sharedUserRepository: SharedUserRepository,
    private roleRepo: RoleRepo,
  ) {}

  async list({ limit, page, search, role, status }: GetUsersQueryType) {
    return await this.userRepo.list({ limit, page, search, role, status })
  }

  async findById(id: number) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
      id,
    })
    if (!user) {
      throw NotFoundRecordException
    }
    return user
  }

  async create({ data }: { data: CreateUserBodyType }) {
    try {
      const hashedPassword = await this.hashingService.hash(data.password)
      const user = await this.userRepo.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      })
      return user
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException
      }
      throw error
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateUserBodyType; updatedById: number }) {
    try {
      await this.verifyYourself({
        userAgentId: updatedById,
        userTargetId: id,
      })
      await this.checkRole(id)

      const role = await this.roleRepo.findById(data.roleId)
      if (!role) {
        throw RoleNotFoundException
      }

      if (data.status === 'INACTIVE' && role.name === ROLE_NAME.PARTNER) {
        await this.checkUserExistPendingAndConfirmOrder(id)
        await this.checkUserExistPendingAndConfirmOrderInHotel(id)
      }
      if (data.status === 'INACTIVE' && role.name === ROLE_NAME.CUSTOMER) {
        await this.checkUserExistPendingAndConfirmOrder(id)
      }
      const updatedUser = await this.sharedUserRepository.update(
        { id },
        {
          ...data,
        },
      )

      return updatedUser
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException
      }
      throw error
    }
  }

  private verifyYourself({ userAgentId, userTargetId }: { userAgentId: number; userTargetId: number }) {
    if (userAgentId === userTargetId) {
      throw CannotUpdateYourselfException
    }
  }

  private async checkRole(userId: number) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({ id: userId })
    if (!user) {
      throw UserNotFoundException
    }
    if (user.role.name === ROLE_NAME.ADMIN) {
      throw CannotUpdateUserAdminException
    }
  }

  private async checkUserExistPendingAndConfirmOrder(userId: number) {
    const user = await this.userRepo.findUserIncludePendingAndConfirmOrder(userId)
    if (!user) {
      throw UserNotFoundException
    }
    if (user?.order?.length > 0) {
      throw OrderPendingOrConfirmedException
    }
  }

  private async checkUserExistPendingAndConfirmOrderInHotel(userId: number) {
    const user = await this.userRepo.findUserIncludeExistPendingAndConfirmOrderInHotel(userId)
    if (!user) {
      throw UserNotFoundException
    }
    if (user?.partner?.hotel?.order?.length || 0 > 0) {
      throw PartnerHasPendingOrConfirmedOrderInHotelException
    }
  }
}
