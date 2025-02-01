import { SysMenuType } from '@prisma/client';

export interface MenuMetaDto {
  title?: string;
  icon?: string;
  order?: number;
  affixTab?: boolean;

  [key: string]: any;
}

export interface CreateMenuDto {
  name: string;
  permission: string;
  component?: string;
  path: string;
  redirect?: string;
  alias?: string;
  meta?: MenuMetaDto;
  parentMenuId?: string;
  type: SysMenuType;
}
