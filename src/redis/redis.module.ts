import { CacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as redisStore from 'cache-manager-redis-store'

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = {
          store: redisStore as any,
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          auth_pass: configService.get('REDIS_PASS'),
          ttl: configService.get('REDIS_TTL'),
        }
        console.log('Redis CacheModule Config:', config)
        return config
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
