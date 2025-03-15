import { Module } from '@nestjs/common';

import { SysDictHelperModule } from 'src/common/sys-dict-helper/sys-dict-helper.module';

import { SysDictDataController } from './sys-dict-data.controller';
import { SysDictDataService } from './sys-dict-data.service';

@Module({
  imports: [SysDictHelperModule],
  controllers: [SysDictDataController],
  providers: [SysDictDataService],
})
export class SysDictDataModule {}
