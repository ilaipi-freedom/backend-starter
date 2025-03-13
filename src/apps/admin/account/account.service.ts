import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { map } from 'lodash';
import { SysMenuType } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthSession } from 'src/types/auth';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getAccountInfo(user: AuthSession) {
    const account = await this.prisma.account.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        phone: true,
        role: {
          select: {
            name: true,
            perm: true,
            route: true,
          },
        },
      },
    });
    return account;
  }

  async getPermCode(user: AuthSession) {
    const account = await this.prisma.account.findUnique({
      where: { id: user.id },
    });
    if (!account?.roleId) {
      this.logger.log({ user, account }, '用户不存在或未配置角色');
      throw new BadRequestException('用户状态异常，请联系管理员');
    }
    const list = await this.prisma.roleMenuConfig.findMany({
      where: {
        roleId: account.roleId,
        sysMenu: {
          type: { not: SysMenuType.catalog },
        },
      },
      include: {
        sysMenu: {
          select: {
            permission: true,
            type: true,
          },
        },
      },
    });
    return map(list, 'sysMenu.permission');
  }

  async getPermCodeByRole(roleId: string) {
    const list = await this.prisma.roleMenuConfig.findMany({
      where: {
        roleId: roleId,
      },
      include: {
        sysMenu: {
          select: {
            id: true,
            permission: true,
            type: true,
          },
        },
      },
    });
    return map(list, 'sysMenu.id');
  }
}
