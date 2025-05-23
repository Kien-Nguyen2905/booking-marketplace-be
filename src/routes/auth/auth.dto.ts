import {
  DisableTwoFactorBodySchema,
  ForgotPasswordBodySchema,
  ForgotTwoFactorAuthSchema,
  GetAllDevicesSchema,
  GetAuthorizationUrlResSchema,
  LoginBodySchema,
  LoginBodySchema2FA,
  LoginResSchema,
  LoginResSchema2FA,
  LogoutBodySchema,
  RefreshTokenBodySchema,
  RefreshTokenResSchema,
  RegisterBodySchema,
  RegisterResSchema,
  SendOTPBodySchema,
  TwoFactorSetupResSchema,
} from 'src/routes/auth/auth.model'
import { createZodDto } from 'nestjs-zod'

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class LoginResDTO extends createZodDto(LoginResSchema) {}

export class LoginBodyDTO2FA extends createZodDto(LoginBodySchema2FA) {}

export class LoginResDTO2FA extends createZodDto(LoginResSchema2FA) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}

export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema) {}

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}

export class GetAuthorizationUrlResDTO extends createZodDto(GetAuthorizationUrlResSchema) {}

export class ForgotPasswordBodyDTO extends createZodDto(ForgotPasswordBodySchema) {}

export class TwoFactorSetupResDTO extends createZodDto(TwoFactorSetupResSchema) {}

export class DisableTwoFactorBodyDTO extends createZodDto(DisableTwoFactorBodySchema) {}

export class ForgotTwoFactorAuthDTO extends createZodDto(ForgotTwoFactorAuthSchema) {}

export class GetAllDevicesDTO extends createZodDto(GetAllDevicesSchema) {}
