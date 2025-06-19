import { Injectable, Logger } from '@nestjs/common'
import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { SEND_MAIL_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import {
  PayloadSendNewDeviceLogin,
  PayloadSendCode,
  PayloadOrderCanceled,
  PayloadNoShowCanceled,
  PayloadCheckoutSuccess,
  PayloadPartnerCancelRefund,
  PayloadCustomerOrderCancel,
  PayloadCustomerOrderRefund,
  PayloadOrderRefundSuccess,
  PayloadOrderSuccess,
} from 'src/shared/services/email.service'
import { FailedToSendMailException } from 'src/routes/auth/auth.error'

export enum MailType {
  OTP = 'otp',
  TWO_FA = '2fa',
  NEW_DEVICE_LOGIN = 'new_device_login',
  ORDER_CANCELED = 'order_canceled',
  NO_SHOW_CANCELED = 'no_show_canceled',
  CHECKOUT_SUCCESS = 'checkout_success',
  PARTNER_CANCEL_REFUND = 'partner_cancel_refund',
  CUSTOMER_ORDER_CANCEL = 'customer_order_cancel',
  CUSTOMER_ORDER_REFUND = 'customer_order_refund',
  ORDER_REFUND_SUCCESS = 'order_refund_success',
  ORDER_SUCCESS = 'order_success',
}

export type MailData = {
  type: MailType
  data:
    | PayloadSendCode
    | PayloadSendNewDeviceLogin
    | PayloadOrderCanceled
    | PayloadNoShowCanceled
    | PayloadCheckoutSuccess
    | PayloadPartnerCancelRefund
    | PayloadCustomerOrderCancel
    | PayloadCustomerOrderRefund
}

@Injectable()
export class MailProducer {
  private readonly logger = new Logger(MailProducer.name)
  constructor(@InjectQueue(SEND_MAIL_QUEUE_NAME) private sendMailQueue: Queue) {}

  async sendMail(mailData: MailData) {
    const priority = mailData.type === MailType.OTP || mailData.type === MailType.TWO_FA ? 1 : 2
    try {
      await this.sendMailQueue.add(mailData.type, mailData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
        },
        priority,
      })
      this.logger.log(`Added job of type ${mailData.type} to queue`)
    } catch (error) {
      this.logger.error(`Failed to add job to queue: ${error.message}`)
      throw FailedToSendMailException
    }
  }

  async sendOtpCodeMail(payload: PayloadSendCode) {
    return await this.sendMail({
      type: MailType.OTP,
      data: payload,
    })
  }

  async sendTwoFaCodeMail(payload: PayloadSendCode) {
    return await this.sendMail({
      type: MailType.TWO_FA,
      data: payload,
    })
  }

  async sendNewDeviceMail(payload: PayloadSendNewDeviceLogin) {
    return await this.sendMail({
      type: MailType.NEW_DEVICE_LOGIN,
      data: payload,
    })
  }

  async sendOrderCanceledMail(payload: PayloadOrderCanceled) {
    return await this.sendMail({
      type: MailType.ORDER_CANCELED,
      data: payload,
    })
  }

  async sendNoShowCanceledMail(payload: PayloadNoShowCanceled) {
    return await this.sendMail({
      type: MailType.NO_SHOW_CANCELED,
      data: payload,
    })
  }

  async sendCheckoutSuccessMail(payload: PayloadCheckoutSuccess) {
    return await this.sendMail({
      type: MailType.CHECKOUT_SUCCESS,
      data: payload,
    })
  }

  async sendPartnerCancelRefundMail(payload: PayloadPartnerCancelRefund) {
    return await this.sendMail({
      type: MailType.PARTNER_CANCEL_REFUND,
      data: payload,
    })
  }

  async sendCustomerOrderCancelMail(payload: PayloadCustomerOrderCancel) {
    return await this.sendMail({
      type: MailType.CUSTOMER_ORDER_CANCEL,
      data: payload,
    })
  }

  async sendCustomerOrderRefundMail(payload: PayloadCustomerOrderRefund) {
    return await this.sendMail({
      type: MailType.CUSTOMER_ORDER_REFUND,
      data: payload,
    })
  }

  async sendOrderRefundSuccessMail(payload: PayloadOrderRefundSuccess) {
    return await this.sendMail({
      type: MailType.ORDER_REFUND_SUCCESS,
      data: payload,
    })
  }

  async sendOrderSuccessMail(payload: PayloadOrderSuccess) {
    return await this.sendMail({
      type: MailType.ORDER_SUCCESS,
      data: payload,
    })
  }
}
