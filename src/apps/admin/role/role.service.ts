import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

import { fmtBy } from 'src/common/helpers/date-helper';
import { pageOptions } from 'src/common/helpers/page-helper';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthSession } from 'src/types/auth';

import { RoleListQueryDto } from './dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthSession, data: Prisma.RoleCreateInput) {
    const { menu, ...others } = JSON.parse(JSON.stringify(data));
    const role = await this.prisma.role.create({
      data: {
        ...others,
        corp: { connect: { id: user.corpId } },
      },
    });
    if (menu?.length) {
      await this.prisma.roleMenuConfig.createMany({
        data: menu.map((sysMenuId: string) => ({ sysMenuId, roleId: role.id })),
      });
    }
    return role;
  }

  async remove(id: string) {
    const accountCounts = await this.prisma.account.count({
      where: {
        roleId: id,
      },
    });
    if (accountCounts > 0) {
      throw new BadRequestException('角色下有账号，不能删除');
    }
    return this.prisma.role.delete({ where: { id } });
  }
  async update(id: string, data: Prisma.RoleCreateInput) {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }
  async list(
    user: AuthSession,
    query: RoleListQueryDto,
  ) {
    const where: Prisma.RoleWhereInput = {
      corpId: user.corpId,
    };
    if (query.q) {
      where.name = { contains: query.q };
    }
    if (query.status) {
      where.status = query.status;
    }
    const total = query.isAll ? 0 : await this.prisma.role.count({ where });
    const list = await this.prisma.role.findMany({
      where,
      ...pageOptions(query),
    });
    return {
      total,
      list: list.map((row: Role) => ({
        ...row,
        createdAt: fmtBy(row.createdAt, 'yyyy-MM-dd HH:mm'),
      })),
    };
  }

  async getById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }
  async updatePerm(id: string, perm: string[]) {
    return await this.prisma.$transaction(async (tx: PrismaService) => {
      await tx.roleMenuConfig.deleteMany({
        where: {
          roleId: id,
        },
      });
      if (perm?.length) {
        const sysMenus = await tx.sysMenu.findMany({
          where: {
            id: { in: perm },
            permission: { not: null },
          },
          select: {
            permission: true,
          },
        });
        await tx.roleMenuConfig.createMany({
          data: sysMenus.map(({ permission }) => ({
            sysMenuPerm: permission,
            roleId: id,
          })),
        });
      }
    });
  }
}
