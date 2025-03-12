import { Injectable } from '@nestjs/common';
import { AvailableStatus, Prisma } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class SysDictHelperService {
  constructor(private readonly prisma: PrismaService) {}

  whereByTypeAndKey(corpId: string, type: string, key: string) {
    return {
      type,
      ...(key ? { key } : {}),
      status: AvailableStatus.normal,
      corpId,
    };
  }

  async getListByTypeAndKey(corpId: string, type: string, key: string) {
    const where: Prisma.SysDictDataWhereInput = this.whereByTypeAndKey(
      corpId,
      type,
      key,
    );
    return this.prisma.sysDictData.findMany({
      where,
      orderBy: { sort: 'asc' },
    });
  }

  async getByTypeAndKey(corpId: string, type: string, key: string) {
    const where: Prisma.SysDictDataWhereInput = this.whereByTypeAndKey(
      corpId,
      type,
      key,
    );
    return this.prisma.sysDictData.findFirst({
      where,
      orderBy: { sort: 'asc' },
    });
  }
}
