import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { map } from 'lodash';
import { Prisma, SysMenuType, RoleMenuConfig } from '@prisma/client';
import * as argon2 from 'argon2';

import { pageOptions } from 'src/common/helpers/page-helper';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthSession } from 'src/types/auth';

import {
  CreateAccountDto,
  UpdateAccountDto,
  AccountQuery,
  ResetPasswordDto,
} from './dto';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getPermBtnCodes(user: AuthSession) {
    return this.getPermCode(user, SysMenuType.button);
  }

  async getPermCode(user: AuthSession, type?: SysMenuType) {
    const account = await this.prisma.account.findUnique({
      where: { id: user.id },
    });
    if (!account?.roleId) {
      this.logger.log({ user, account }, '用户不存在或未配置角色');
      throw new BadRequestException('用户状态异常，请联系管理员');
    }
    const list: RoleMenuConfig[] = await this.prisma.roleMenuConfig.findMany({
      where: {
        roleId: account.roleId,
        ...(type ? { sysMenu: { type } } : {}),
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
    return map(list, 'sysMenu.permission') as string[];
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
    return map(list, 'sysMenu.id') as string[];
  }
  async create(user: AuthSession, dto: CreateAccountDto) {
    const hashedPassword = await argon2.hash(dto.password);
    return this.prisma.account.create({
      data: {
        username: dto.username?.toLowerCase(),
        password: hashedPassword,
        ...(dto.phone ? { phone: dto.phone } : {}),
        name: dto.name,
        corp: { connect: { id: user.corpId } },
        role: {
          connect: { id: dto.roleId },
        },
      },
      select: {
        id: true,
        username: true,
        phone: true,
        name: true,
        corpId: true,
        roleId: true,
        role: true,
        status: true,
      },
    });
  }

  async update(user: AuthSession, id: string, dto: UpdateAccountDto) {
    const data: Prisma.AccountUpdateInput = {
      ...(dto.roleId ? { roleId: dto.roleId } : {}),
      ...(dto.password ? { password: await argon2.hash(dto.password) } : {}),
      ...(dto.username ? { username: dto.username.toLowerCase() } : {}),
      ...(dto.phone ? { phone: dto.phone } : { phone: null }),
      ...(dto.name ? { name: dto.name } : {}),
    };

    return this.prisma.account.update({
      where: { id, corpId: user.corpId },
      data,
      select: {
        id: true,
        username: true,
        phone: true,
        name: true,
        corpId: true,
        roleId: true,
        role: true,
        status: true,
      },
    });
  }

  async delete(user: AuthSession, id: string) {
    return this.prisma.account.delete({
      where: { id, corpId: user.corpId },
    });
  }

  async findAll(user: AuthSession, query: AccountQuery) {
    const where: Prisma.AccountWhereInput = {
      corpId: user.corpId,
    };

    if (query.q) {
      where.OR = [
        { username: { contains: query.q } },
        { phone: { contains: query.q } },
        { name: { contains: query.q } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.roleId) {
      where.roleId = query.roleId;
    }

    const [total, items] = await Promise.all([
      this.prisma.account.count({ where }),
      this.prisma.account.findMany({
        where,
        ...pageOptions(query),
        select: {
          id: true,
          username: true,
          phone: true,
          name: true,
          corpId: true,
          roleId: true,
          role: true,
          status: true,
        },
        orderBy: {
          id: 'desc',
        },
      }),
    ]);

    return {
      items,
      total,
    };
  }

  async findById(user: AuthSession, id: string) {
    return this.prisma.account.findUnique({
      where: { id, corpId: user.corpId },
      select: {
        id: true,
        username: true,
        phone: true,
        name: true,
        corpId: true,
        roleId: true,
        role: true,
        status: true,
      },
    });
  }

  async getAccountInfo(user: AuthSession) {
    if (!user?.id) {
      throw new UnauthorizedException('请先登录');
    }
    const account = await this.prisma.account.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        phone: true,
        status: true,
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

  async resetPassword(id: string, payload: ResetPasswordDto) {
    if (!payload.password) {
      throw new BadRequestException('密码不能为空');
    }
    const password = await argon2.hash(payload.password);
    return this.prisma.account.update({
      where: { id },
      data: { password },
      select: {
        id: true,
      },
    });
  }
}
