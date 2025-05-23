import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { GoogleAuthStateType } from 'src/routes/auth/auth.model'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import { AuthService } from 'src/routes/auth/auth.service'
import { GoogleUserInfoError, UserInactiveException } from 'src/routes/auth/auth.error'
import envConfig from 'src/shared/config'
import { HashingService } from 'src/shared/services/hashing.service'
import { v4 as uuidv4 } from 'uuid'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { extractDeviceInfo } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { MailProducer } from 'src/shared/producers/mail.producer'
import { UserStatus } from 'src/shared/constants/auth.constant'

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly authService: AuthService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly mailProducer: MailProducer,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    )
  }
  getAuthorizationUrl({ userAgent }: GoogleAuthStateType) {
    const scope = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    // Chuyển Object sang string base64 an toàn bỏ lên url
    const stateString = Buffer.from(
      JSON.stringify({
        userAgent,
      }),
    ).toString('base64')
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      include_granted_scopes: true,
      state: stateString,
    })
    return { url }
  }

  async googleCallback({ code, state }: { code: string; state: string }) {
    try {
      let userAgent = 'Unknown'
      const ip = 'Unknown'
      // 1. Lấy state từ url
      try {
        if (state) {
          const clientInfo = JSON.parse(Buffer.from(state, 'base64').toString()) as GoogleAuthStateType
          userAgent = clientInfo.userAgent
        }
      } catch (error) {
        console.error('Error parsing state', error)
      }
      // 2. Dùng code để lấy token
      const { tokens } = await this.oauth2Client.getToken(code)
      this.oauth2Client.setCredentials(tokens)

      // 3. Lấy thông tin google user
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      })
      const { data } = await oauth2.userinfo.get()
      if (!data.email) {
        throw GoogleUserInfoError
      }

      let user = await this.authRepository.findUniqueUserIncludeRole({
        email: data.email,
      })
      let newDevice: any | null = null
      let authTokens: { accessToken: string; refreshToken: string } = {
        accessToken: '',
        refreshToken: '',
      }

      const { browser, os, deviceType } = extractDeviceInfo(userAgent)

      if (user && user.status === UserStatus.INACTIVE) {
        throw UserInactiveException
      }
      // Nếu không có user tức là người mới, vậy nên sẽ tiến hành đăng ký
      if (!user) {
        const customerRoleId = await this.sharedRoleRepository.getCustomerRoleId()
        const randomPassword = uuidv4()
        const hashedPassword = await this.hashingService.hash(randomPassword)
        user = await this.authRepository.createUserIncludeRole({
          email: data.email,
          fullName: data.name ?? '',
          password: hashedPassword,
          roleId: customerRoleId,
          avatar: data.picture ?? null,
        })
        newDevice = await this.authRepository.createDevice({
          userId: user.id,
          userAgent,
          browser,
          os,
          deviceType,
        })
      }
      // Extract device info
      const deviceExist = await this.sharedUserRepository.findDeviceByUserAndUserAgent({
        userId_userAgent: {
          userId: user.id,
          userAgent,
        },
      })
      // Lần đầu đăng ký với google
      if (newDevice) {
        // Create accessToken and refreshToken
        authTokens = await this.authService.generateTokens({
          userId: user.id,
          deviceId: newDevice.id,
          roleId: user.roleId,
          roleName: user.role.name,
        })
        // Update device had been logout
        await this.authRepository.updateDevice(newDevice.id, {
          isActive: true,
          lastActive: new Date(),
        })
      }
      // // Lần thứ 2 đăng nhập với google trên cùng 1 thiết bị đã đăng ký trước đó
      if (deviceExist && !newDevice?.id) {
        // Create accessToken and refreshToken
        authTokens = await this.authService.generateTokens({
          userId: user.id,
          deviceId: deviceExist.id,
          roleId: user.roleId,
          roleName: user.role.name,
        })
        // Update device had been logout
        await this.authRepository.updateDevice(deviceExist.id, {
          isActive: true,
          lastActive: new Date(),
        })
      }
      // Lần thứ 2 đăng nhập với google trên cùng 1 thiết bị khác
      if (!deviceExist && !newDevice?.id) {
        // Tạo thiết bị mới cho đăng nhập thiết bị mới
        const device = await this.authRepository.createDevice({
          userId: user.id,
          userAgent,
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
        authTokens = await this.authService.generateTokens({
          userId: user.id,
          deviceId: device.id,
          roleId: user.roleId,
          roleName: user.role.name,
        })
        // Update device had been logout
        await this.authRepository.updateDevice(device.id, {
          isActive: true,
          lastActive: new Date(),
        })
      }
      return authTokens
    } catch (error) {
      console.error('Error in googleCallback', error)
      throw error
    }
  }
}
