import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { SEND_MAIL_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { MailData, MailType } from 'src/shared/producers/mail.producer'
import {
  EmailService,
  PayloadCheckoutSuccess,
  PayloadCustomerOrderCancel,
  PayloadCustomerOrderRefund,
  PayloadNoShowCanceled,
  PayloadOrderCanceled,
  PayloadOrderRefundSuccess,
  PayloadOrderSuccess,
  PayloadPartnerCancelRefund,
  PayloadSendCode,
  PayloadSendNewDeviceLogin,
} from 'src/shared/services/email.service'

@Processor(SEND_MAIL_QUEUE_NAME)
export class MailConsumer extends WorkerHost {
  constructor(private mailService: EmailService) {
    super()
  }

  async process(job: Job<MailData>) {
    switch (job.data.type) {
      case MailType.OTP: {
        const data = job.data.data as PayloadSendCode
        await this.mailService.sendOTP(data)
        break
      }
      case MailType.TWO_FA: {
        const data = job.data.data as PayloadSendCode
        await this.mailService.send2FA(data)
        break
      }
      case MailType.NEW_DEVICE_LOGIN: {
        const data = job.data.data as PayloadSendNewDeviceLogin
        await this.mailService.sendNewDeviceNotification(data)
        break
      }
      case MailType.ORDER_CANCELED: {
        const data = job.data.data as PayloadOrderCanceled
        await this.mailService.sendOrderCanceled(data)
        break
      }
      case MailType.NO_SHOW_CANCELED: {
        const data = job.data.data as PayloadNoShowCanceled
        await this.mailService.sendNoShowCanceled(data)
        break
      }
      case MailType.CHECKOUT_SUCCESS: {
        const data = job.data.data as PayloadCheckoutSuccess
        await this.mailService.sendCheckoutSuccess(data)
        break
      }
      case MailType.PARTNER_CANCEL_REFUND: {
        const data = job.data.data as PayloadPartnerCancelRefund
        await this.mailService.sendPartnerCancelRefund(data)
        break
      }
      case MailType.CUSTOMER_ORDER_CANCEL: {
        const data = job.data.data as PayloadCustomerOrderCancel
        await this.mailService.sendCustomerOrderCancel(data)
        break
      }
      case MailType.CUSTOMER_ORDER_REFUND: {
        const data = job.data.data as PayloadCustomerOrderRefund
        await this.mailService.sendCustomerOrderRefund(data)
        break
      }
      case MailType.ORDER_REFUND_SUCCESS: {
        const data = job.data.data as PayloadOrderRefundSuccess
        await this.mailService.sendOrderRefundSuccess(data)
        break
      }
      case MailType.ORDER_SUCCESS: {
        const data = job.data.data as PayloadOrderSuccess
        await this.mailService.sendOrderSuccess(data)
        break
      }
      default:
        throw new Error(`Unsupported mail type: ${job.data.type}`)
    }
  }
}
