import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bullmq';
import { createKeyv } from '@keyv/redis';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import config from 'src/config/';
import { KEYV_GLOBAL_KEY } from 'src/types/global';

import { GlobalHelperService } from './global-helper.service';

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
        const customProps = () => {
          return {
            timeStamp: new Date().toISOString(),
          };
        };
        if (isProduction) {
          return {
            pinoHttp: {
              customProps,
              serializers: {
                req(req) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                  req.body = req.raw.body;
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
            customProps,
            serializers: {
              req(req) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                req.body = req.raw.body;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return req;
              },
            },
            transport: { target: 'pino-pretty' },
          },
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        prefix: configService.get('env.appDeployment'),
        connection: { url: configService.get('env.redis.url') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GlobalHelperService, keyvProvider],
  exports: [keyvProvider],
})
export class GlobalHelperModule {}
