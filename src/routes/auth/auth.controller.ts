import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dto/response.dto'
import {
  DisableTwoFactorBodyDTO,
  ForgotPasswordBodyDTO,
  ForgotTwoFactorAuthDTO,
  GetAllDevicesDTO,
  GetAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
  TwoFactorSetupResDTO,
} from 'src/routes/auth/auth.dto'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { Message } from 'src/shared/decorators/message.decorator'
import { GoogleService } from 'src/routes/auth/google.service'
import { Response } from 'express'
import envConfig from 'src/shared/config'
import { IsPublic, IsPublicNotAPIKey } from 'src/shared/decorators/auth.decorator'
import { EmptyBodyDTO } from 'src/shared/dto/request.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDTO)
  register(@Body() body: RegisterBodyDTO, @UserAgent() userAgent: string) {
    return this.authService.register({ ...body, userAgent })
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  @Message('Login successful')
  login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string) {
    return this.authService.login({
      ...body,
      userAgent,
    })
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDTO)
  refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string) {
    return this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
    })
  }

  @Post('logout')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  @HttpCode(HttpStatus.OK)
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }

  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResDTO)
  getAuthorizationUrl(@UserAgent() userAgent: string) {
    return this.googleService.getAuthorizationUrl({
      userAgent,
    })
  }

  @Get('google/callback')
  @IsPublicNotAPIKey()
  async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      const data = await this.googleService.googleCallback({
        code,
        state,
      })
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Oops! Something went wrong with Google sign-in. Try another way to log in'
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${message}`)
    }
  }

  @Post('forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body)
  }

  @Post('2fa/setup')
  @ZodSerializerDto(TwoFactorSetupResDTO)
  setupTwoFactorAuth(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.setupTwoFactorAuth(userId)
  }

  @Post('2fa/disable')
  @ZodSerializerDto(MessageResDTO)
  disableTwoFactorAuth(@Body() body: DisableTwoFactorBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.disableTwoFactorAuth({
      ...body,
      userId,
    })
  }

  @Post('forgot-2fa')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  forgotTwoFactorAuth(@Body() body: ForgotTwoFactorAuthDTO) {
    return this.authService.forgotTwoFactorAuth(body)
  }

  @Get('all-devices')
  @ZodSerializerDto(GetAllDevicesDTO)
  getDevices(@ActiveUser('userId') userId: number, @UserAgent() userAgent: string) {
    return this.authService.getAllDevices({
      userId,
      userAgent,
    })
  }
}
