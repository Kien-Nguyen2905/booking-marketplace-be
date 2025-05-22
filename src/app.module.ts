import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './routes/auth/auth.module'
import { SharedModule } from 'src/shared/shared.module'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import CustomZodValidationPipe from 'src/shared/pipes/custom-zod-validation.pipe'
import { CustomZodSerializerInterceptor } from 'src/shared/interceptor/transform.interceptor'
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter'
import { MailConsumer } from 'src/queues/mail.consumer'
import { RedisModule } from 'src/redis/redis.module'
import { BullMQModule } from 'src/bull/bull.module'
import { PermissionModule } from 'src/routes/permission/permission.module'
import { RoleModule } from 'src/routes/role/role.module'
import { ProfileModule } from 'src/routes/profile/profile.module'
import { MediaModule } from './routes/media/media.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [process.env.NODE_ENV === 'production' ? '.env.production' : '.env'],
    }),
    AuthModule,
    SharedModule,
    RedisModule,
    BullMQModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    MailConsumer,
  ],
})
export class AppModule {}
