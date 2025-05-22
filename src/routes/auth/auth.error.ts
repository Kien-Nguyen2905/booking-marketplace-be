import { UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'

// OTP
export const InvalidOTPException = new UnprocessableEntityException([{ message: 'OTP code is invalid', path: 'code' }])

export const OTPExpiredException = new UnprocessableEntityException([{ message: 'OTP code has expired', path: 'code' }])

export const FailedToSendMailException = new UnprocessableEntityException('Failed to send the mail. Please try again')

// Email
export const EmailAlreadyExistsException = new UnprocessableEntityException([
  { message: 'Email has already been used', path: 'email' },
])

export const EmailNotFoundException = new UnprocessableEntityException([{ message: 'Email not found', path: 'email' }])

// Auth Token
export const RefreshTokenAlreadyUsedException = new UnauthorizedException('Refresh token has already been used')

export const UnauthorizedAccessException = new UnauthorizedException('You are not authorized to access this resource')

// Google Auth
export const GoogleUserInfoError = new Error('Failed to retrieve user information from Google')

// TOTP
export const InvalidTOTPException = new UnprocessableEntityException([{ message: 'Code is invalid', path: 'totpCode' }])
export const EmptyTOTPException = new UnprocessableEntityException([
  { message: 'TOTP code is required', path: 'totpCode' },
])

export const TOTPAlreadyEnabledException = new UnprocessableEntityException([
  { message: 'Two-factor authentication is already enabled', path: 'totpCode' },
])

export const TOTPNotEnabledException = new UnprocessableEntityException([
  { message: 'Two-factor authentication is not enabled', path: 'totpCode' },
])

// User
export const UserInactiveException = new UnauthorizedException('User is inactive')
