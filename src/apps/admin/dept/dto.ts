import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeptDto {
  @ApiProperty({ description: '部门名称' })
  name: string;

  @ApiPropertyOptional({ description: '父部门ID' })
  parentDeptId?: string;

  @ApiPropertyOptional({ description: '部门元数据' })
  remark?: string;

  @ApiPropertyOptional({ description: '排序' })
  sort?: number;
}
