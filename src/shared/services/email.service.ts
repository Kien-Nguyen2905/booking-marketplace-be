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
const partnerApplicationReceivedTemplate = fs.readFileSync(
  path.resolve('src/shared/email-templates/partner-application-received.html'),
  { encoding: 'utf-8' },
)
const partnerStatusAcceptedTemplate = fs.readFileSync(
  path.resolve('src/shared/email-templates/partner-status-accepted.html'),
  { encoding: 'utf-8' },
)
const partnerStatusRejectedTemplate = fs.readFileSync(
  path.resolve('src/shared/email-templates/partner-status-rejected.html'),
  { encoding: 'utf-8' },
)
const orderCanceledTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/order-canceled.html'), {
  encoding: 'utf-8',
})
const noShowCancelTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/no-show-cancel.html'), {
  encoding: 'utf-8',
})
const checkoutSuccessTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/checkout-success.html'), {
  encoding: 'utf-8',
})
const partnerCancelRefundTemplate = fs.readFileSync(
  path.resolve('src/shared/email-templates/partner-cancel-refund.html'),
  { encoding: 'utf-8' },
)
const customerOrderCancelTemplate = fs.readFileSync(
  path.resolve('src/shared/email-templates/customer-order-cancel.html'),
  { encoding: 'utf-8' },
)
const customerOrderRefundTemplate = fs.readFileSync(
  path.resolve('src/shared/email-templates/customer-order-refund.html'),
  { encoding: 'utf-8' },
)

const orderRefundSuccessTemplate = fs.readFileSync(
  path.resolve('src/shared/email-templates/order-refund-success.html'),
  { encoding: 'utf-8' },
)

const orderSuccessTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/order-success.html'), {
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

export type PayloadPartnerApplication = {
  email: string
  partnerName: string
}

export type PayloadPartnerStatusAccepted = {
  email: string
  partnerName: string
}

export type PayloadPartnerStatusRejected = {
  email: string
  partnerName: string
  rejectionReason: string
}

export type PayloadOrderCanceled = {
  email: string
  customerName: string
  orderId: string | number
  reason: string
}

export type PayloadNoShowCanceled = {
  email: string
  customerName: string
  orderId: string | number
}

export type PayloadCheckoutSuccess = {
  email: string
  customerName: string
  orderId: string | number
  hotelName: string
}

export type PayloadPartnerCancelRefund = {
  email: string
  customerName: string
  orderId: string | number
  reason: string
}

export type PayloadCustomerOrderCancel = {
  email: string
  customerName: string
  orderId: string | number
  reason: string
}

export type PayloadCustomerOrderRefund = {
  email: string
  customerName: string
  orderId: string | number
  reason: string
}

export type PayloadOrderRefundSuccess = {
  email: string
  customerName: string
  orderId: string | number
}
export type PayloadOrderSuccess = {
  email: string
  customerName: string
  orderId: string | number
  hotelName: string
  roomType: string
  quantity: number
  policy: string
  checkinDate: string
  checkoutDate: string
  arrivalTime: string
  totalPrice: number
  paymentType: string
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
      .replaceAll('{{device}}', payload.deviceInfo.deviceType === 'Unknown' ? '' : payload.deviceInfo.deviceType)
      .replaceAll('{{loginTime}}', new Date(payload.loginTime).toLocaleString('vi-VN'))

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }

  // Send Partner Application Received Notification
  async sendPartnerApplicationReceived(payload: PayloadPartnerApplication) {
    const subject = 'Your Partner Application Has Been Received'
    const html = partnerApplicationReceivedTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{partnerName}}', payload.partnerName)

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }

  // Send Partner Status Accepted Notification
  async sendPartnerStatusAccepted(payload: PayloadPartnerStatusAccepted) {
    const subject = 'Congratulations! Your Partner Application Has Been Accepted'
    const html = partnerStatusAcceptedTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{partnerName}}', payload.partnerName)

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }

  // Send Partner Status Rejected Notification
  async sendPartnerStatusRejected(payload: PayloadPartnerStatusRejected) {
    const subject = 'Important Information Regarding Your Partner Application'
    const html = partnerStatusRejectedTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{partnerName}}', payload.partnerName)
      .replaceAll(
        '{{rejectionReason}}',
        payload.rejectionReason || 'We found that your application does not meet our current partnership criteria.',
      )

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }

  // Send Order Canceled Notification
  async sendOrderCanceled(payload: PayloadOrderCanceled) {
    const subject = 'Your Booking Has Been Canceled'
    const html = orderCanceledTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{customerName}}', payload.customerName)
      .replaceAll('{{orderId}}', String(payload.orderId))
      .replaceAll('{{reason}}', payload.reason || 'unforeseen circumstances')

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }

  // Send No-Show Cancellation Notification
  async sendNoShowCanceled(payload: PayloadNoShowCanceled) {
    const subject = 'Booking Canceled: No-Show'
    const html = noShowCancelTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{customerName}}', payload.customerName)
      .replaceAll('{{orderId}}', String(payload.orderId))

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }

  // Send Checkout Success Notification
  async sendCheckoutSuccess(payload: PayloadCheckoutSuccess) {
    const subject = 'Thank You for Your Stay!'
    const html = checkoutSuccessTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{customerName}}', payload.customerName)
      .replaceAll('{{orderId}}', String(payload.orderId))
      .replaceAll('{{hotelName}}', payload.hotelName)

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }

  // Send Partner Cancel Refund Notification
  async sendPartnerCancelRefund(payload: PayloadPartnerCancelRefund) {
    const subject = 'Your Booking Has Been Canceled with a Refund'
    const html = partnerCancelRefundTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{customerName}}', payload.customerName)
      .replaceAll('{{orderId}}', String(payload.orderId))
      .replaceAll('{{reason}}', payload.reason)

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }

  // Send Customer Order Cancel Notification
  async sendCustomerOrderCancel(payload: PayloadCustomerOrderCancel) {
    const subject = 'Your Booking Has Been Canceled'
    const html = customerOrderCancelTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{customerName}}', payload.customerName)
      .replaceAll('{{orderId}}', String(payload.orderId))
      .replaceAll('{{reason}}', payload.reason)

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }

  // Send Customer Order Refund Notification
  async sendCustomerOrderRefund(payload: PayloadCustomerOrderRefund) {
    const subject = 'Your Booking Has Been Refunded'
    const html = customerOrderRefundTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{customerName}}', payload.customerName)
      .replaceAll('{{orderId}}', String(payload.orderId))
      .replaceAll('{{reason}}', payload.reason)

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }

  // Send Order Refund Success Notification
  async sendOrderRefundSuccess(payload: PayloadOrderRefundSuccess) {
    const subject = 'Refunded Success'
    const html = orderRefundSuccessTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{customerName}}', payload.customerName)
      .replaceAll('{{orderId}}', String(payload.orderId))

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }

  // Send Order Success Notification
  async sendOrderSuccess(payload: PayloadOrderSuccess) {
    const subject = 'Booking Confirmation'
    const html = orderSuccessTemplate
      .replaceAll('{{subject}}', subject)
      .replaceAll('{{customerName}}', payload.customerName)
      .replaceAll('{{orderId}}', String(payload.orderId))
      .replaceAll('{{hotelName}}', payload.hotelName)
      .replaceAll('{{roomType}}', payload.roomType)
      .replaceAll('{{quantity}}', String(payload.quantity))
      .replaceAll('{{policy}}', payload.policy)
      .replaceAll('{{checkinDate}}', payload.checkinDate)
      .replaceAll('{{checkoutDate}}', payload.checkoutDate)
      .replaceAll('{{arrivalTime}}', payload.arrivalTime)
      .replaceAll('{{totalPrice}}', String(payload.totalPrice))
      .replaceAll('{{paymentType}}', payload.paymentType)

    return this.resend.emails.send({
      from: 'Booking <no-reply@ntk2905.site>',
      to: [payload.email],
      subject,
      html,
    })
  }
}
