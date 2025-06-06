import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSysDictDataDto {
  @ApiProperty({
    required: false,
    description: '显示顺序',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  sort?: number;

  @ApiProperty({
    required: false,
    description: '字典键',
    example: 'ship-route-way',
  })
  key: string;

  @ApiProperty({
    description: '字典标签',
    example: '正常',
  })
  label: string;

  @ApiProperty({
    description: '字典键值',
    example: 'normal',
  })
  value: string;

  @ApiProperty({
    description: '字典类型',
    example: 'sys_normal_disable',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: '备注信息',
    example: '系统正常状态',
  })
  remark: string;

  @ApiProperty({
    description: '扩展信息',
    example: {
      color: '#67C23A',
      icon: 'check-circle',
    },
  })
  extra: Record<string, any>;
}
