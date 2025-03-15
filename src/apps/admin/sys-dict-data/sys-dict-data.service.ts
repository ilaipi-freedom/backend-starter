import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthSession } from 'src/types/auth';
import { SysDictHelperService } from 'src/common/sys-dict-helper/sys-dict-helper.service';
import { SysDictDataQuery } from 'src/common/sys-dict-helper/dto';

import { CreateSysDictDataDto } from './dto';

@Injectable()
export class SysDictDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sysDictHelper: SysDictHelperService,
  ) {}

  async create(user: AuthSession, data: CreateSysDictDataDto) {
    return await this.prisma.sysDictData.create({
      data: {
        ...data,
        corpId: user.corpId,
      },
      include: {
        corp: true,
        sysDict: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.sysDictData.delete({ where: { id } });
  }

  async update(id: string, data: CreateSysDictDataDto) {
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
