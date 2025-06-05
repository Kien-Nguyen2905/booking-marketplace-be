import { Injectable } from '@nestjs/common'
import { PartnerRepo } from './partner.repo'
import {
  CreatePartnerBodyType,
  GetPartnersQueryType,
  UpdatePartnerBodyType,
  UpdatePartnerStatusBodyType,
} from 'src/routes/partner/partner.model'
import {
  PartnerAlreadyAcceptedException,
  PartnerAlreadyExistsException,
  PartnerNotFoundException,
  PartnerUnauthorizedAccessException,
} from 'src/routes/partner/partner.error'
import { AuthService } from 'src/routes/auth/auth.service'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { PartnerStatus } from 'src/shared/constants/partner.constant'
import { ROLE_NAME } from 'src/shared/constants/role.constant'
import { EmailService } from 'src/shared/services/email.service'

@Injectable()
export class PartnerService {
  constructor(
    private partnerRepo: PartnerRepo,
    private authService: AuthService,
    private authRepository: AuthRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly emailService: EmailService,
  ) {}

  async list(query: GetPartnersQueryType) {
    return await this.partnerRepo.list(query)
  }

  async create({ data, userId }: { data: CreatePartnerBodyType; userId: number }) {
    try {
      // await this.authService.validateVerificationCode({
      //   email: data.email,
      //   code: data.code,
      //   type: TypeOfVerificationCode.VERIFY,
      // })
      const adminRoleId = await this.authRepository.findUniqueUserIncludeRole({
        email: data.email,
      })
      if (adminRoleId?.role.name === ROLE_NAME.ADMIN) {
        throw PartnerUnauthorizedAccessException
      }
      const { code, ...partnerData } = data

      const [partner] = await Promise.all([
        this.partnerRepo.create({ data: partnerData, userId }),
        // this.authRepository.deleteVerificationCode({
        //   email_type: {
        //     email: data.email,
        //     type: TypeOfVerificationCode.VERIFY,
        //   },
        //   code: data.code,
        // }),
      ])
      return partner
    } catch (error) {
      //Unique constraint failed on the fields: (`userId`)
      //Unique constraint failed on the fields: (`email`)
      if (isUniqueConstraintPrismaError(error)) {
        throw PartnerAlreadyExistsException
      }
      throw error
    }
  }

  async update({ data, userId }: { data: UpdatePartnerBodyType; userId: number }) {
    const partnerExists = await this.findByUserId(userId)
    if (!partnerExists) {
      throw PartnerNotFoundException
    }
    await this.authService.validateVerificationCode({
      email: data.email,
      code: data.code,
      type: TypeOfVerificationCode.VERIFY,
    })
    const { code, ...partnerData } = data
    const [partner] = await Promise.all([
      this.partnerRepo.update({ data: partnerData, userId }),
      this.authRepository.deleteVerificationCode({
        email_type: {
          email: data.email,
          type: TypeOfVerificationCode.VERIFY,
        },
        code: data.code,
      }),
    ])
    return partner
  }

  async findByUserId(userId: number) {
    return await this.partnerRepo.getPartnerByUserId(userId)
  }

  async findById(id: number) {
    return this.partnerRepo.getPartnerById(id)
  }

  async updatePartnerStatus({
    data,
    partnerId,
    createdById,
  }: {
    data: UpdatePartnerStatusBodyType
    partnerId: number
    createdById: number
  }) {
    const partnerExists = await this.findByUserId(partnerId)
    if (!partnerExists) {
      throw PartnerNotFoundException
    }
    if (partnerExists.status === PartnerStatus.ACCEPTED) {
      throw PartnerAlreadyAcceptedException
    }
    const partnerRoleId = await this.sharedRoleRepository.getPartnerRoleId()

    const result = await this.partnerRepo.updatePartnerStatus({
      data,
      userId: partnerId,
      createdById,
      partnerRoleId,
      partnerId: partnerExists.id,
    })

    // Get user's email and name from the partner
    const user = await this.authRepository.findUniqueUserIncludeRole({ id: partnerId })
    if (user && user.email) {
      // Send appropriate email based on status
      if (data.status === PartnerStatus.ACCEPTED) {
        await this.emailService.sendPartnerStatusAccepted({
          email: user.email,
          partnerName: partnerExists.fullName || user.email.split('@')[0] || 'Partner',
        })
      } else if (data.status === PartnerStatus.REJECTED) {
        await this.emailService.sendPartnerStatusRejected({
          email: user.email,
          partnerName: partnerExists.fullName || user.email.split('@')[0] || 'Partner',
          rejectionReason: 'We found that your application does not meet our current partnership criteria.',
        })
      }
    }

    return result
  }
}
