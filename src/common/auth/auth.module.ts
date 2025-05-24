import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { CacheHelperModule } from '../cache-helper/cache-helper.module';

@Module({
  imports: [
    ConfigModule,
    CacheHelperModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: (service: ConfigService) => {
        const app = service.get<string>('env.appInstance');
        const secret = service.get<string>(`env.jwt.secret`);
        const result = service.get<JwtModuleOptions>(`env.jwt.${app}`);
        return {
          secret,
          ...(result.signOptions ? { signOptions: result.signOptions } : {}),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtStrategy],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
