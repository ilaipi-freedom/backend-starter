import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { JwtAuthGuard } from 'src/common/auth/auth.guard';
import { AuthModule } from 'src/common/auth/auth.module';
import { CacheHelperModule } from 'src/common/cache-helper/cache-helper.module';
import { GlobalHelperModule } from 'src/common/global-helper/global-helper.module';
import { HttpExceptionFilter } from 'src/common/helpers/http-exception.filter';

import { AccountModule } from './account/account.module';
import { DeptModule } from './dept/dept.module';
import { SysMenuModule } from './sys-menu/sys-menu.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    AccountModule,
    GlobalHelperModule,
    AuthModule,
    CacheHelperModule,
    SysMenuModule,
    DeptModule,
    RoleModule,
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
export class AdminApiModule {}
