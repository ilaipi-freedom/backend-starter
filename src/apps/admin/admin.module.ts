import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { JwtAuthGuard } from 'src/common/auth/auth.guard';
import { DemoRoleGuard } from 'src/common/auth/demo-role.guard';
import { AuthModule } from 'src/common/auth/auth.module';
import { CacheHelperModule } from 'src/common/cache-helper/cache-helper.module';
import { GlobalHelperModule } from 'src/common/global-helper/global-helper.module';
import { HttpExceptionFilter } from 'src/common/helpers/http-exception.filter';

import { AccountModule } from './account/account.module';
import { DeptModule } from './dept/dept.module';
import { SysMenuModule } from './sys-menu/sys-menu.module';
import { RoleModule } from './role/role.module';
import { SysDictModule } from './sys-dict/sys-dict.module';
import { SysDictDataModule } from './sys-dict-data/sys-dict-data.module';

@Module({
  imports: [
    AccountModule,
    GlobalHelperModule,
    AuthModule,
    CacheHelperModule,
    SysMenuModule,
    DeptModule,
    RoleModule,
    SysDictModule,
    SysDictDataModule,
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
    {
      provide: APP_GUARD,
      useClass: DemoRoleGuard,
    },
  ],
})
export class AdminApiModule {}
