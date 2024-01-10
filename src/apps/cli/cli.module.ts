import { Module } from '@nestjs/common';

import { GlobalHelperModule } from 'src/common/global-helper/global-helper.module';

@Module({
  imports: [GlobalHelperModule],
})
export class CliModule {}
