import { ApiProperty } from '@nestjs/swagger';

import { AvailableStatus } from 'src/generated/prisma';
import { BaseQuery } from 'src/types/BaseQuery';

export class RoleListQueryDto extends BaseQuery {
  @ApiProperty({
    description: '角色名称',
    example: '管理员',
  })
  q: string;

  @ApiProperty({
    description: '角色状态',
    enum: AvailableStatus,
    example: AvailableStatus.normal,
  })
  status: AvailableStatus;
}

export class CreateRoleDto {
  @ApiProperty({
    description: '角色名称',
    example: '管理员',
  })
  name: string;

  @ApiProperty({
    description: '权限标识符',
    example: 'admin',
  })
  perm: string;

  @ApiProperty({
    enum: AvailableStatus,
    description: '角色状态',
    example: 'normal',
  })
  status: AvailableStatus;

  @ApiProperty({
    description: '默认路由',
    example: '/dashboard',
  })
  route: string;
}
