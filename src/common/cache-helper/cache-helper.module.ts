import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';

import { CacheHelperService } from './cache-helper.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        stores: [
          new Keyv({
            store: new KeyvRedis(configService.get('env.redis.url')),
          }),
        ],
        isGlobal: true,
        ...configService.get('env.cache'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheHelperService],
  exports: [CacheModule, CacheHelperService],
})
export class CacheHelperModule {}
