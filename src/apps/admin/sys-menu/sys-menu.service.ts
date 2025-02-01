import { Injectable } from '@nestjs/common';
import { SysMenu } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';

import { CreateMenuDto } from './dto';

@Injectable()
export class SysMenuService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMenuDto: CreateMenuDto) {
    const { parentMenuId, ...rest } = createMenuDto;
    return this.prisma.sysMenu.create({
      data: {
        ...rest,
        ...(parentMenuId
          ? { parentMenu: { connect: { id: parentMenuId } } }
          : {}),
      },
    });
  }

  async findAll() {
    const menus = await this.prisma.sysMenu.findMany({
      where: {
        status: 'normal',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return this.buildMenuTree(menus);
  }

  async findOne(id: string) {
    return this.prisma.sysMenu.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateMenuDto: CreateMenuDto) {
    return this.prisma.sysMenu.update({
      where: { id },
      data: updateMenuDto,
    });
  }

  async remove(id: string) {
    return this.prisma.sysMenu.update({
      where: { id },
      data: { status: 'forbidden' },
    });
  }

  async findAllMenuTree() {
    const menus = await this.prisma.sysMenu.findMany({
      where: {
        status: 'normal',
      },
    });
    return this.buildMenuTree(menus);
  }

  async findUserMenuTree(userId: string) {
    // 先获取用户的角色ID
    const user = await this.prisma.account.findUnique({
      where: { id: userId },
      select: { roleId: true },
    });

    if (!user) {
      return [];
    }

    // 获取角色关联的菜单权限
    const roleMenuConfigs = await this.prisma.roleMenuConfig.findMany({
      where: {
        roleId: user.roleId,
      },
      select: {
        sysMenuPerm: true,
      },
    });

    const menuPerms = roleMenuConfigs.map((item) => item.sysMenuPerm);

    // 查询用户有权限的菜单
    const menus = await this.prisma.sysMenu.findMany({
      where: {
        status: 'normal',
        permission: {
          in: menuPerms,
        },
      },
    });

    return this.buildMenuTree(menus);
  }

  private buildMenuTree(
    menus: SysMenu[],
    parentId: string | null = null,
  ): any[] {
    const sortedMenus = menus.sort((a, b) => {
      const orderA = (a.meta as any)?.orderNo ?? 0;
      const orderB = (b.meta as any)?.orderNo ?? 0;
      if (orderA === orderB) {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      return orderA - orderB;
    });

    const tree = [];

    for (const menu of sortedMenus) {
      if (menu.parentMenuId === parentId) {
        const children = this.buildMenuTree(menus, menu.id);
        const node = {
          ...menu,
          ...(children.length ? { children } : {}),
        };
        tree.push(node);
      }
    }
    return tree;
  }
}
