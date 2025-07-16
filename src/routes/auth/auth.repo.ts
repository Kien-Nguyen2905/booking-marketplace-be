import { Injectable } from '@nestjs/common'
import { DeviceType, VerificationCodeType } from 'src/routes/auth/auth.model'
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import { UserType } from 'src/shared/models/shared-user.model'
import { WhereUniqueUserType } from 'src/shared/repositories/shared-user.repo'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // Create verification code
  async createVerificationCode(payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>) {
    return await this.prismaService.verificationCode.upsert({
      where: {
        email_type: {
          email: payload.email,
          type: payload.type,
        },
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    })
  }

  async findUniqueVerificationCode(
    uniqueValue:
      | { id: number }
      | {
          // Find  @@unique([email, code, type]) verification code
          email_type: {
            email: string
            type: TypeOfVerificationCodeType
          }
          code: string
        },
  ) {
    return await this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    })
  }

  async deleteVerificationCode(
    uniqueValue:
      | { id: number }
      | {
          // Delete  @@unique([email, code, type]) verification code
          email_type: {
            email: string
            type: TypeOfVerificationCodeType
          }
          code: string
        },
  ) {
    return await this.prismaService.verificationCode.delete({
      where: uniqueValue,
    })
  }

  // Create user
  async createUser(user: Pick<UserType, 'email' | 'fullName' | 'password' | 'roleId'>) {
    const { id, ...userData } = user as any
    return await this.prismaService.user.create({
      data: userData,
      omit: {
        password: true,
        totpSecret: true,
        uriSecret: true,
      },
      include: {
        role: true,
      },
    })
  }

  // Find user include role
  async findUniqueUserIncludeRole(where: WhereUniqueUserType) {
    return await this.prismaService.user.findFirst({
      where: {
        ...where,
      },
      include: {
        role: true,
      },
    })
  }

  // Create device
  async createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'browser' | 'os' | 'deviceType'> &
      Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ) {
    return await this.prismaService.device.create({
      data,
    })
  }

  // Create refresh token
  async createRefreshToken(data: { token: string; userId: number; expiresAt: Date; deviceId: number }) {
    return await this.prismaService.refreshToken.create({
      data,
    })
  }

  // Find unique refresh token include user role
  async findUniqueRefreshTokenIncludeUserRole(where: { token: string }) {
    return await this.prismaService.refreshToken.findUnique({
      where,
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    })
  }

  // Update device
  async updateDevice(deviceId: number, data: Partial<DeviceType>) {
    return await this.prismaService.device.update({
      where: {
        id: deviceId,
      },
      data,
    })
  }

  // Delete refresh token
  async deleteRefreshToken(where: { token: string }) {
    return await this.prismaService.refreshToken.delete({
      where,
    })
  }

  async createUserIncludeRole(user: Pick<UserType, 'email' | 'fullName' | 'password' | 'avatar' | 'roleId'>) {
    const { id, ...userData } = user as any
    return await this.prismaService.user.create({
      data: userData,
      include: {
        role: true,
      },
    })
  }

  async findDevicesByUserId(userId: number) {
    return await this.prismaService.device.findMany({
      where: {
        userId,
      },
    })
  }

  async deleteDeviceAndRefreshToken(deviceId: number) {
    return await this.prismaService.$transaction([
      this.prismaService.refreshToken.deleteMany({
        where: {
          deviceId,
        },
      }),
      this.prismaService.device.delete({
        where: {
          id: deviceId,
        },
      }),
    ])
  }
}
