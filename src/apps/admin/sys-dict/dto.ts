import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AvailableStatus, SysDictCategory } from 'src/generated/prisma';
import { BaseQuery } from 'src/types/BaseQuery';

export class CreateSysDictDto {
  @ApiProperty({
    description: '字典名称',
    example: '系统状态',
  })
  name: string;

  @ApiProperty({
    description: '字典类型',
    example: 'sys_normal_disable',
  })
  type: string;

  @ApiProperty({
    description: '备注信息',
    example: '系统状态列表',
  })
  remark: string;

  @ApiProperty({
    enum: SysDictCategory,
    description: '字典分类',
    example: SysDictCategory.text,
  })
  category: SysDictCategory;
}

export class SysDictQuery extends BaseQuery {
  @ApiPropertyOptional({
    description: '字典类型状态',
    example: AvailableStatus.normal,
  })
  status?: AvailableStatus;

  @ApiPropertyOptional({
    description: '搜索关键字',
  })
  q?: string;
}
