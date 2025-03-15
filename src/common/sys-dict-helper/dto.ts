import { ApiProperty } from '@nestjs/swagger';

import { BaseQuery } from 'src/types/BaseQuery';

export class SysDictDataQuery extends BaseQuery {
  @ApiProperty({
    required: false,
    description: '字典类型',
    example: 'system-setting',
  })
  type?: string;
  @ApiProperty({
    required: false,
    description: '字典键',
    example: 'ship-route-way',
  })
  key?: string;
  @ApiProperty({
    required: false,
    description: '搜索关键字',
    example: '男',
  })
  q?: string;
}
