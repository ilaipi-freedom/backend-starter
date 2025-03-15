import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthSession } from 'src/types/auth';
import { SysDictHelperService } from 'src/common/sys-dict-helper/sys-dict-helper.service';
import { SysDictDataQuery } from 'src/common/sys-dict-helper/dto';

@Injectable()
export class SysDictDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sysDictHelper: SysDictHelperService,
  ) {}

  async create(user: AuthSession, data: Prisma.SysDictDataCreateInput) {
    return this.prisma.sysDictData.create({
      data: {
        ...data,
        corp: { connect: { id: user.corpId } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.sysDictData.delete({ where: { id } });
  }

  async update(id: string, data: Prisma.SysDictDataUpdateInput) {
    return this.prisma.sysDictData.update({
      where: { id },
      data,
    });
  }
  async list(user: AuthSession, query: SysDictDataQuery) {
    return await this.sysDictHelper.findAll(user.corpId, {
      ...(query || {}),
    });
  }

  async getById(id: string) {
    return this.prisma.sysDictData.findUnique({
      where: { id },
    });
  }
}
