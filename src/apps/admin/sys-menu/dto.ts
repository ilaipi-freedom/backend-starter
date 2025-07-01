import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

import { SysMenuType } from 'src/generated/prisma';

export class MenuMetaDto {
  @ApiPropertyOptional({ description: '菜单名称' })
  title?: string;
  @ApiPropertyOptional({ description: '图标' })
  icon?: string;
  @ApiPropertyOptional({ description: '激活图标' })
  activeIcon?: string;
  @ApiPropertyOptional({ description: '徽标类型' })
  badgeType?: string;
  @ApiPropertyOptional({ description: '徽标' })
  badge?: string;
  @ApiPropertyOptional({ description: '徽标变体' })
  badgeVariants?: string;
  @ApiPropertyOptional({ description: '是否缓存' })
  keepAlive?: boolean;
  @ApiPropertyOptional({ description: '是否在菜单中隐藏' })
  hideInMenu?: boolean;
  @ApiPropertyOptional({ description: '是否在菜单中隐藏子菜单' })
  hideChildrenInMenu?: boolean;
  @ApiPropertyOptional({ description: '是否在面包屑中隐藏' })
  hideInBreadcrumb?: boolean;
  @ApiPropertyOptional({ description: '是否在标签页中隐藏' })
  hideInTab?: boolean;
  @ApiPropertyOptional({ description: '是否固定标签' })
  affixTab?: boolean;
  @ApiPropertyOptional({ description: '链接地址' })
  link?: string;
  @ApiPropertyOptional({ description: '排序' })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  order?: number;

  [key: string]: any;
}

export class CreateMenuDto {
  @ApiProperty({ description: '菜单类型', enum: SysMenuType })
  type: SysMenuType;
  @ApiProperty({ description: '菜单名称' })
  name: string;
  @ApiProperty({ description: '权限标识' })
  permission: string;
  @ApiProperty({ description: '路由路径' })
  path: string;
  @ApiPropertyOptional({ description: '激活路径' })
  activePath?: string;
  @ApiPropertyOptional({ description: '组件路径' })
  component?: string;
  @ApiPropertyOptional({ description: '元数据' })
  meta?: MenuMetaDto;
  @ApiPropertyOptional({ description: '父菜单ID' })
  parentMenuId?: string;
}
