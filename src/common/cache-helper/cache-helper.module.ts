/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';

import { KEYV_GLOBAL_KEY } from 'src/types/global';

import { CacheHelperService } from './cache-helper.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (keyv: Keyv, configService: ConfigService) => {
        await keyv.store.client.connect();

        const cacheConfig = configService.get('env.cache');

        return {
          store: keyv,
          isGlobal: true,
          ...cacheConfig,
        };
      },
      inject: [KEYV_GLOBAL_KEY, ConfigService],
    }),
  ],
  providers: [CacheHelperService],
  exports: [CacheModule, CacheHelperService],
})
export class CacheHelperModule {}
