import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { PrismaModule } from 'src/common/prisma/prisma.module';

import { GlobalHelperService } from './global-helper.service';
import config from '../../config/';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule,
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
  ],
  providers: [GlobalHelperService],
})
export class GlobalHelperModule {}
