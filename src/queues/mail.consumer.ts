import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { SEND_MAIL_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { MailData, MailType } from 'src/shared/producers/mail.producer'
import { EmailService, PayloadSendCode, PayloadSendNewDeviceLogin } from 'src/shared/services/email.service'

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
      default:
        throw new Error(`Unsupported mail type: ${job.data.type}`)
    }
  }
}
