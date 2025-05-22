import { Global, Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HashingService } from './services/hashing.service'
import { TokenService } from './services/token.service'
import { JwtModule } from '@nestjs/jwt'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { EmailService } from 'src/shared/services/email.service'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { TwoFactorService } from 'src/shared/services/2fa.service'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { APP_GUARD } from '@nestjs/core'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { BullModule } from '@nestjs/bullmq'
import { SEND_MAIL_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { MailProducer } from 'src/shared/producers/mail.producer'
import { S3Service } from 'src/shared/services/s3.service'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  EmailService,
  SharedUserRepository,
  SharedRoleRepository,
  TwoFactorService,
  MailProducer,
  S3Service,
]

@Global()
@Module({
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedServices,
  imports: [
    JwtModule,
    BullModule.registerQueue({
      name: SEND_MAIL_QUEUE_NAME,
    }),
  ],
})
export class SharedModule {}
