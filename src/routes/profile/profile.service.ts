import { Injectable } from '@nestjs/common'
import { InvalidPasswordException, NotFoundRecordException } from 'src/shared/error'
import { ChangePasswordBodyType, UpdateMeBodyType } from './profile.model'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { MESSAGES } from 'src/shared/message'
import { PartnerRepo } from 'src/routes/partner/partner.repo'

@Injectable()
export class ProfileService {
  constructor(
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly partnerRepo: PartnerRepo,
    private readonly hashingService: HashingService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
      id: userId,
    })

    if (!user) {
      throw NotFoundRecordException
    }

    const partner = await this.partnerRepo.getPartnerByUserId(userId)
    return {
      ...user,
      partnerStatus: partner?.status || null,
    }
  }

  async updateProfile({ userId, body }: { userId: number; body: UpdateMeBodyType }) {
    try {
      return await this.sharedUserRepository.update(
        { id: userId },
        {
          ...body,
        },
      )
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async changePassword({ userId, body }: { userId: number; body: Omit<ChangePasswordBodyType, 'confirmNewPassword'> }) {
    try {
      const { password, newPassword } = body
      const user = await this.sharedUserRepository.findUnique({
        id: userId,
      })
      if (!user) {
        throw NotFoundRecordException
      }
      const isPasswordMatch = await this.hashingService.compare(password, user.password)
      if (!isPasswordMatch) {
        throw InvalidPasswordException
      }
      const hashedPassword = await this.hashingService.hash(newPassword)

      await this.sharedUserRepository.update(
        { id: userId },
        {
          password: hashedPassword,
        },
      )
      return {
        message: MESSAGES.AUTH.CHANGE_PASSWORD_SUCCESS,
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
