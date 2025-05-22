import { Injectable } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  EmptyTOTPException,
  InvalidOTPException,
  InvalidTOTPException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  TOTPAlreadyEnabledException,
  TOTPNotEnabledException,
  UnauthorizedAccessException,
  UserInactiveException,
} from 'src/routes/auth/auth.error'
import {
  DisableTwoFactorBodyType,
  ForgotPasswordBodyType,
  ForgotTwoFactorAuthType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from 'src/routes/auth/auth.model'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import envConfig from 'src/shared/config'
import { TypeOfVerificationCode, TypeOfVerificationCodeType, UserStatus } from 'src/shared/constants/auth.constant'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import ms from 'ms'
import {
  extractDeviceInfo,
  generateOTP,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { TwoFactorService } from 'src/shared/services/2fa.service'
import { TokenService } from 'src/shared/services/token.service'
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type'
import { InvalidPasswordException } from 'src/shared/error'
import { MESSAGES } from 'src/shared/message'
import { MailProducer, MailType } from 'src/shared/producers/mail.producer'
@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly hashingService: HashingService,
    private readonly twoFactorService: TwoFactorService,
    private readonly tokenService: TokenService,
    private readonly mailProducer: MailProducer,
  ) {}

  async sendOTP(body: SendOTPBodyType) {
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    })
    if (user && user.status === UserStatus.INACTIVE) {
      throw UserInactiveException
    }
    // Checking for register
    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException
    }
    // Checking for forgot password
    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundException
    }
    // Generate and store new OTP
    const code = generateOTP()
    await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    })
    // Send OTP
    await this.mailProducer.sendOtpCodeMail({
      email: body.email,
      code,
    })

    return {
      message: MESSAGES.AUTH.OTP_SENT,
    }
  }

  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string
    code: string
    type: TypeOfVerificationCodeType
  }) {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email_code_type: {
        email,
        code,
        type,
      },
    })
    if (!verificationCode) {
      throw InvalidOTPException
    }
    if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException
    }
    return verificationCode
  }

  async register(body: RegisterBodyType & { userAgent: string }) {
    // Extract device info
    const { browser, os, deviceType } = extractDeviceInfo(body.userAgent)

    try {
      await this.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      })
      // Get client role id
      const customerRoleId = await this.sharedRoleRepository.getCustomerRoleId()
      // Hash password
      const hashedPassword = await this.hashingService.hash(body.password)
      // Create user and delete verification code
      const [user] = await Promise.all([
        this.authRepository.createUser({
          email: body.email,
          fullName: 'User',
          password: hashedPassword,
          roleId: customerRoleId,
        }),
        this.authRepository.deleteVerificationCode({
          email_code_type: {
            email: body.email,
            code: body.code,
            type: TypeOfVerificationCode.REGISTER,
          },
        }),
      ])
      // Create device
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: body.userAgent,
        browser,
        os,
        deviceType,
      })

      // Create accessToken and refreshToken
      const tokens = await this.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      })
      return tokens
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({
        userId,
      }),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    })
    return { accessToken, refreshToken }
  }

  async login(body: LoginBodyType & { userAgent: string }) {
    // Extract device info
    const { browser, os, deviceType } = extractDeviceInfo(body.userAgent)

    // Check user exist
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    })
    if (!user) {
      throw EmailNotFoundException
    }
    if (user && user.status === UserStatus.INACTIVE) {
      throw UserInactiveException
    }
    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      throw InvalidPasswordException
    }
    // Check TOTP enabled
    if (user.totpSecret) {
      // Check TOTP Code
      if (!body.totpCode) {
        throw EmptyTOTPException
      }
      // Check TOTP Code valid
      if (body.totpCode) {
        const isValid = this.twoFactorService.verifyTOTP({
          email: user.email,
          secret: user.totpSecret,
          token: body.totpCode,
        })
        if (!isValid) {
          throw InvalidTOTPException
        }
      }
    }
    const deviceExist = await this.sharedUserRepository.findDeviceByUserAndUserAgent({
      userId_userAgent: {
        userId: user.id,
        userAgent: body.userAgent,
      },
    })
    if (!deviceExist) {
      // Create device
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: body.userAgent,
        browser,
        os,
        deviceType,
      })
      // Send email notification for new device
      await this.mailProducer.sendNewDeviceMail({
        email: user.email,
        deviceInfo: {
          browser,
          os,
          deviceType,
        },
        loginTime: new Date(),
      })
      // Create accessToken and refreshToken
      const tokens = await this.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      })
      return tokens
    }
    // Update device had been logout
    await this.authRepository.updateDevice(deviceExist.id, {
      isActive: true,
      lastActive: new Date(),
    })
    // Create accessToken and refreshToken
    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: deviceExist.id,
      roleId: user.roleId,
      roleName: user.role.name,
    })
    return tokens
  }

  async refreshToken({ refreshToken, userAgent }: RefreshTokenBodyType & { userAgent: string }) {}

  async logout(refreshToken: string) {
    try {
      // Check refreshToken valid
      await this.tokenService.verifyRefreshToken(refreshToken)
      // Delete refreshToken in db
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({
        token: refreshToken,
      })
      // Update device had been logout
      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, {
        isActive: false,
      })
      return { message: MESSAGES.AUTH.LOGOUT_SUCCESS }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenAlreadyUsedException
      }
      throw UnauthorizedAccessException
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body
    // Check email exist in db
    const user = await this.sharedUserRepository.findUnique({
      email,
    })
    if (!user) {
      throw EmailNotFoundException
    }
    // Check OPT code valid
    await this.validateVerificationCode({
      email,
      code,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
    })
    // Update password and delete OTP code
    const hashedPassword = await this.hashingService.hash(newPassword)
    await Promise.all([
      this.sharedUserRepository.update(
        { id: user.id },
        {
          password: hashedPassword,
        },
      ),
      this.authRepository.deleteVerificationCode({
        email_code_type: {
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.FORGOT_PASSWORD,
        },
      }),
    ])
    return {
      message: MESSAGES.AUTH.RESET_PASSWORD_SUCCESS,
    }
  }

  async setupTwoFactorAuth(userId: number) {
    // Find the user
    const user = await this.sharedUserRepository.findUnique({
      id: userId,
    })

    if (!user) {
      throw EmailNotFoundException
    }
    if (user.totpSecret) {
      throw TOTPAlreadyEnabledException
    }
    // 2. Tạo ra secret và uri
    const { secret, uri } = this.twoFactorService.generateTOTPSecret(user.email)
    // 3. Cập nhật secret vào user trong database
    await this.sharedUserRepository.update({ id: userId }, { totpSecret: secret, uriSecret: uri })
    // 4. Trả về secret và uri
    return {
      secret,
      uri,
    }
  }

  async disableTwoFactorAuth(data: DisableTwoFactorBodyType & { userId: number }) {
    const { userId, totpCode } = data
    // 1. Lấy thông tin user, kiểm tra xem user có tồn tại hay không, và xem họ đã bật 2FA chưa
    const user = await this.sharedUserRepository.findUnique({ id: userId })
    if (!user) {
      throw EmailNotFoundException
    }

    // Check if TOTP is enabled
    if (!user.totpSecret) {
      throw TOTPNotEnabledException
    }

    // Verify with either TOTP code or email verification code
    if (totpCode) {
      // Check TOTP code validity
      const isValid = this.twoFactorService.verifyTOTP({
        email: user.email,
        secret: user.totpSecret,
        token: totpCode,
      })
      if (!isValid) {
        throw InvalidTOTPException
      }
    }

    // 4. Cập nhật secret thành null
    await this.sharedUserRepository.update({ id: userId }, { totpSecret: null, uriSecret: null })

    // 5. Trả về thông báo
    return {
      message: MESSAGES.AUTH.DISABLE_2FA_SUCCESS,
    }
  }

  async forgotTwoFactorAuth(body: ForgotTwoFactorAuthType) {
    const user = await this.sharedUserRepository.findUnique({ email: body.email })
    if (!user) {
      throw EmailNotFoundException
    }
    if (!user.totpSecret) {
      throw TOTPNotEnabledException
    }
    await this.mailProducer.sendTwoFaCodeMail({
      email: body.email,
      code: user.totpSecret,
    })

    return {
      message: MESSAGES.AUTH.OTP_SENT_2FA,
    }
  }

  async getAllDevices({ userId, userAgent }: { userId: number; userAgent: string }) {
    const devices = await this.authRepository.findDevicesByUserId(userId)
    const listDevicesMarkMe = devices.map((device) => {
      if (device.userAgent === userAgent) {
        return {
          ...device,
          isMe: true,
        }
      }
      return {
        ...device,
        isMe: false,
      }
    })
    return listDevicesMarkMe
  }
}
