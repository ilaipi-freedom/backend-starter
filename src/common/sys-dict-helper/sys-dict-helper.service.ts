import { Injectable } from '@nestjs/common';
import { AvailableStatus, Prisma, SysDictData } from '@prisma/client';
import { keyBy, map, uniq } from 'lodash';

import { pageOptions } from '../helpers/page-helper';
import { PrismaService } from '../prisma/prisma.service';
import { SysDictDataQuery } from './dto';

@Injectable()
export class SysDictHelperService {
  constructor(private readonly prisma: PrismaService) {}

  whereByTypeAndKey(
    corpId: string,
    type: string,
    key?: string | string[],
  ): Prisma.SysDictDataWhereInput {
    return {
      type,
      ...(key ? { key } : {}),
      ...(Array.isArray(key) && key.length ? { key: { in: key } } : {}),
      status: AvailableStatus.normal,
      corpId,
    } as Prisma.SysDictDataWhereInput;
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

  async getListByTypeAndKeys(corpId: string, type: string, keys?: string[]) {
    const where = this.whereByTypeAndKey(corpId, type, keys);
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

  async findAll(corpId: string, query: SysDictDataQuery) {
    const where: Prisma.SysDictDataWhereInput = {
      corpId,
    };
    if (query.type) {
      where.type = query.type;
    }
    if (query.key) {
      where.key = query.key;
    }
    if (query.q) {
      where.OR = [
        { label: { contains: query.q } },
        { key: { contains: query.q } },
        { value: { contains: query.q } },
        { remark: { contains: query.q } },
      ];
    }
    const total = await this.prisma.sysDictData.count({ where });
    const items = await this.prisma.sysDictData.findMany({
      where,
      ...pageOptions(query),
      orderBy: [
        {
          type: 'asc',
        },
        {
          sort: 'asc',
        },
      ],
    });
    const sysDictTypes = uniq(map(items, 'type'));
    const sysDict = await this.prisma.sysDict.findMany({
      where: { type: { in: sysDictTypes } },
    });
    const sysDictMap = keyBy(sysDict, 'type');
    return {
      total,
      items: items.map((row: SysDictData) => ({
        ...row,
        sysDict: sysDictMap[row.type],
      })),
    };
  }
}
