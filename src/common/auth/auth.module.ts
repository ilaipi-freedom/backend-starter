import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { CacheModule } from '../cache/cache.module';

const JWT_SECRET = {
  provide: 'APP_JWT_SECRET',
  imports: [ConfigModule],
  useFactory: async (service: ConfigService) => {
    const secret = await service.get(`env.jwt.secret`);
    return secret;
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (service: ConfigService) => {
        const app = await service.get('env.appInstance');
        const secret = await service.get(`env.jwt.secret`);
        const result = await service.get(`env.jwt.${app}`);
        const { signOptions } = result || {};
        return {
          secret,
          signOptions,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JWT_SECRET, JwtStrategy],
  exports: [AuthService, JwtAuthGuard, JWT_SECRET, JwtModule],
})
export class AuthModule {}
