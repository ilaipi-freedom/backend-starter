import { Module } from '@nestjs/common';

import { AuthModule } from 'src/common/auth/auth.module';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [AuthModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
