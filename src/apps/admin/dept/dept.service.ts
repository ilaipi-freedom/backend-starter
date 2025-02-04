import { Injectable } from '@nestjs/common';
import { AvailableStatus, Dept } from '@prisma/client';

import { fmtBy } from 'src/common/helpers/date-helper';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthSession } from 'src/types/auth';

import { CreateDeptDto } from './dto';

@Injectable()
export class DeptService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthSession, createDeptDto: CreateDeptDto) {
    const { parentDeptId, ...rest } = createDeptDto;
    return this.prisma.dept.create({
      data: {
        ...rest,
        ...(parentDeptId
          ? { parentDept: { connect: { id: parentDeptId } } }
          : {}),
        corp: { connect: { id: user.corpId } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.dept.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateDeptDto: CreateDeptDto) {
    return this.prisma.dept.update({
      where: { id },
      data: updateDeptDto,
    });
  }

  async remove(id: string) {
    return this.prisma.dept.delete({
      where: { id },
    });
  }

  async findAll(user: AuthSession) {
    const depts = await this.prisma.dept.findMany({
      where: {
        corpId: user.corpId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return depts.map((dept) => ({
      ...dept,
      createdAt: fmtBy(dept.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    }));
  }

  async findDeptTree(user: AuthSession) {
    const depts = await this.prisma.dept.findMany({
      where: {
        corpId: user.corpId,
      },
      orderBy: {
        sort: 'asc',
      },
    });
    const tree = this.buildDeptTree(depts);
    console.log(tree);
    return tree;
  }

  private buildDeptTree(depts: Dept[], parentId: string | null = null): any[] {
    const tree = [];

    for (const dept of depts) {
      if (dept.parentDeptId === parentId) {
        const children = this.buildDeptTree(depts, dept.id);
        const node = {
          ...dept,
          createdAt: fmtBy(dept.createdAt, 'yyyy-MM-dd HH:mm:ss'),
          ...(children.length ? { children } : {}),
        };
        tree.push(node);
      }
    }
    return tree;
  }
}
