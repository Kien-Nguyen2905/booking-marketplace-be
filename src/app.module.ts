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
import { OrderConsumer } from 'src/queues/order.consumer'
import { RedisModule } from 'src/redis/redis.module'
import { BullMQModule } from 'src/bull/bull.module'
import { PermissionModule } from 'src/routes/permission/permission.module'
import { RoleModule } from 'src/routes/role/role.module'
import { ProfileModule } from 'src/routes/profile/profile.module'
import { MediaModule } from './routes/media/media.module'
import { UserModule } from 'src/routes/user/user.module'
import { PartnerModule } from './routes/partner/partner.module'
import { HotelModule } from './routes/hotel/hotel.module'
import { AmenityModule } from './routes/amenity/amenity.module'
import { RoomTypeModule } from './routes/room-type/room-type.module'
import { RoomModule } from './routes/room/room.module'
import { WishlistModule } from './routes/wishlist/wishlist.module'
import { PromotionModule } from './routes/promotion/promotion.module'
import { NotifyModule } from './routes/notify/notify.module'
import { CouponModule } from './routes/coupon/coupon.module'
import { CustomerModule } from './routes/customer/customer.module'
import { OrderModule } from './routes/order/order.module'
import { PaymentModule } from './routes/payment/payment.module'
import { TransactionModule } from './routes/transaction/transaction.module'
import { RefundModule } from './routes/refund/refund.module'
import { ReviewModule } from './routes/review/review.module'
import { MetricModule } from './routes/metric/metric.module'
import { ScheduleModule } from '@nestjs/schedule'
import { RemoveRefreshTokenCronjob } from 'src/cronjobs/remove-refresh-token.cronjob'
import { CheckoutOrderCronjob } from 'src/cronjobs/checkout-order.cronjobs'
import { RemoveRoomAvailabilityCronjob } from 'src/cronjobs/remove-roomavailability.cronjobs'

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    UserModule,
    PartnerModule,
    HotelModule,
    AmenityModule,
    RoomTypeModule,
    RoomModule,
    WishlistModule,
    PromotionModule,
    NotifyModule,
    CouponModule,
    CustomerModule,
    OrderModule,
    PaymentModule,
    TransactionModule,
    RefundModule,
    ReviewModule,
    MetricModule,
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
    OrderConsumer,
    RemoveRefreshTokenCronjob,
    CheckoutOrderCronjob,
    RemoveRoomAvailabilityCronjob,
  ],
})
export class AppModule {}
