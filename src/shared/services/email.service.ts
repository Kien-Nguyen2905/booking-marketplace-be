import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from 'src/shared/config'
import fs from 'fs'
import path from 'path'
const otpTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), {
  encoding: 'utf-8',
})
const newDeviceTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/new-device.html'), {
  encoding: 'utf-8',
})
const twoFactorTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/2fa.html'), {
  encoding: 'utf-8',
})

export type PayloadSendCode = {
  email: string
  code: string
}
export type PayloadSendNewDeviceLogin = {
  email: string
  deviceInfo: {
    browser: string
    os: string
    deviceType: string
  }
  loginTime: Date
}
@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }
  // Send OTP
  sendOTP(payload: PayloadSendCode) {
    const subject = 'Mã OTP'
    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html: otpTemplate.replaceAll('{{subject}}', subject).replaceAll('{{code}}', payload.code),
    })
  }
  // Send 2FA
  send2FA(payload: PayloadSendCode) {
    const subject = 'Mã 2FA'
    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html: twoFactorTemplate.replaceAll('{{subject}}', subject).replaceAll('{{code}}', payload.code),
    })
  }
  // Send Notification New Device Login
  async sendNewDeviceNotification(payload: PayloadSendNewDeviceLogin) {
    const subject = 'New Device Login Detected'
    const html = newDeviceTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{browser}}', payload.deviceInfo.browser)
      .replaceAll('{{os}}', payload.deviceInfo.os)
      .replaceAll('{{device}}', payload.deviceInfo.deviceType)
      .replaceAll('{{loginTime}}', new Date(payload.loginTime).toLocaleString('vi-VN'))

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }
}
