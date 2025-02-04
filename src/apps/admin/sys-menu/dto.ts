import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SysMenuType } from '@prisma/client';

export class MenuMetaDto {
  @ApiPropertyOptional({ description: '菜单名称' })
  title?: string;
  @ApiPropertyOptional({ description: '图标' })
  icon?: string;
  @ApiPropertyOptional({ description: '排序' })
  order?: number;
  @ApiPropertyOptional({ description: '是否固定标签' })
  affixTab?: boolean;

  [key: string]: any;
}

export class CreateMenuDto {
  @ApiProperty({ description: '菜单名称' })
  name: string;
  @ApiProperty({ description: '权限标识' })
  permission: string;
  @ApiPropertyOptional({ description: '组件路径' })
  component?: string;
  @ApiProperty({ description: '路由路径' })
  path: string;
  @ApiPropertyOptional({ description: '重定向路径' })
  redirect?: string;
  @ApiPropertyOptional({ description: '别名' })
  alias?: string;
  meta?: MenuMetaDto;
  parentMenuId?: string;
  type: SysMenuType;
}
