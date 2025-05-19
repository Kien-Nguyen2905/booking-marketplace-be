import { Injectable, Logger } from '@nestjs/common'
import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { SEND_MAIL_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { PayloadSendNewDeviceLogin, PayloadSendCode } from 'src/shared/services/email.service'
import { FailedToSendMailException } from 'src/routes/auth/auth.error'

export enum MailType {
  OTP = 'otp',
  TWO_FA = '2fa',
  NEW_DEVICE_LOGIN = 'new_device_login',
}

export type MailData = {
  type: MailType
  data: PayloadSendCode | PayloadSendNewDeviceLogin
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
}
