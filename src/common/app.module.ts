import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { getRuntimeModule } from '../utils/app.helper';
import { CacheModule } from '../common/cache/cache.module';
import { AuthModule } from '../common/auth/auth.module';
import { JwtAuthGuard } from '../common/auth/auth.guard';
import { HttpExceptionFilter } from '../common/helpers/http-exception.filter';
import { GlobalHelperModule } from './global-helper/global-helper.module';

const { module: runtimeModule, bootstrap } = getRuntimeModule();

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('env.isProduction');
        if (isProduction) {
          return {
            pinoHttp: {
              serializers: {
                req(req) {
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
              req(req) {
                req.body = req.raw.body;
                return req;
              },
            },
            transport: { target: 'pino-pretty' },
          },
        };
      },
    }),
    GlobalHelperModule, 
    AuthModule, 
    CacheModule, 
    runtimeModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

export { bootstrap };
