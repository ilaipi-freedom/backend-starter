import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { AccountModule } from './account/account.module';
import { GlobalHelperModule } from 'src/common/global-helper/global-helper.module';
import { AuthModule } from 'src/common/auth/auth.module';
import { CacheModule } from 'src/common/cache/cache.module';
import { HttpExceptionFilter } from 'src/common/helpers/http-exception.filter';
import { JwtAuthGuard } from 'src/common/auth/auth.guard';

@Module({
  imports: [AccountModule, GlobalHelperModule, AuthModule, CacheModule],
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
export class AdminApiModule {}
