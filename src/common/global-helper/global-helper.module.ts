import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { createKeyv } from '@keyv/redis';
import { Request } from 'express';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import { KEYV_GLOBAL_KEY } from 'src/types/global';

import config from '../../config/';
import { GlobalHelperService } from './global-helper.service';
import { TransformInterceptor } from '../interceptor/transform.interceptor';

const keyvProvider = {
  provide: KEYV_GLOBAL_KEY,
  useFactory: (configService: ConfigService) => {
    const redisUrl = configService.get<string>('env.redis.url');
    const keyv = createKeyv({
      url: redisUrl,
      pingInterval: 3000,
      socket: {
        connectTimeout: 10000,
        keepAlive: 5000,
      },
    });
    return keyv;
  },
  inject: [ConfigService],
};

const transformInterceptorProvider = {
  provide: APP_INTERCEPTOR,
  useClass: TransformInterceptor,
};

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<boolean>('env.isProduction');
        if (isProduction) {
          return {
            pinoHttp: {
              serializers: {
                req(req: Request & { raw: { body: unknown } }) {
                  req.body = req.raw.body;
                  return req;
                },
              },
              transport: {
                target: 'pino/file',
                options: { destination: '/data/log/app.log', mkdir: true },
              },
            },
          };
        }
        return {
          pinoHttp: {
            serializers: {
              req(req: Request & { raw: { body: unknown } }) {
                req.body = req.raw.body;
                return req;
              },
            },
            transport: { target: 'pino-pretty' },
          },
        };
      },
    }),
  ],
  providers: [GlobalHelperService, keyvProvider, transformInterceptorProvider],
  exports: [keyvProvider],
})
export class GlobalHelperModule {}
