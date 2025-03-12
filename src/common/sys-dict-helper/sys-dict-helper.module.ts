import { Module } from '@nestjs/common';

import { SysDictHelperService } from './sys-dict-helper.service';

@Module({
  providers: [SysDictHelperService],
  exports: [SysDictHelperService],
})
export class SysDictHelperModule {}
