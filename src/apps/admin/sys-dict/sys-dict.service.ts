import { Injectable } from '@nestjs/common';

import { Prisma } from 'src/generated/prisma';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthSession } from 'src/types/auth';
import { pageOptions } from 'src/common/helpers/page-helper';

import { SysDictQuery } from './dto';

@Injectable()
export class SysDictService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthSession, data: Prisma.SysDictCreateInput) {
    return this.prisma.sysDict.create({
      data: {
        ...data,
        corp: { connect: { id: user.corpId } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.sysDict.delete({ where: { id } });
  }

  async update(id: string, data: Prisma.SysDictUpdateInput) {
    return this.prisma.sysDict.update({
      where: { id },
      data,
    });
  }
  async list(user: AuthSession, query: SysDictQuery) {
    const where: Prisma.SysDictWhereInput = {
      corpId: user.corpId,
    };
    if (query.status) {
      where.status = query.status;
    }
    if (query.q) {
      where.OR = [
        { name: { contains: query.q } },
        { type: { contains: query.q } },
      ];
    }
    const total = await this.prisma.sysDict.count({ where });
    const items = await this.prisma.sysDict.findMany({
      where,
      ...pageOptions(query),
    });
    return { total, items };
  }

  async getById(id: string) {
    return this.prisma.sysDict.findUnique({
      where: { id },
    });
  }
}
