import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDeptDto {
  @ApiProperty({ description: '部门名称' })
  name: string;

  @ApiPropertyOptional({ description: '父部门ID' })
  parentDeptId?: string;

  @ApiPropertyOptional({ description: '部门元数据' })
  remark?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : null))
  sort?: number;
}
