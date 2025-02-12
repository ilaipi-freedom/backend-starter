import { Injectable } from '@nestjs/common';
import { Dept } from '@prisma/client';

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

  async findAll(user: AuthSession, q?: string) {
    // 一次性获取该企业的所有部门
    const allCorpDepts = await this.prisma.dept.findMany({
      where: {
        corpId: user.corpId,
      },
    });

    // 如果没有搜索条件，直接返回所有部门
    if (!q) {
      return allCorpDepts.map((dept) => ({
        ...dept,
        createdAt: fmtBy(dept.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      }));
    }

    // 构建部门 ID 映射，方便快速查找
    const deptMap = new Map(allCorpDepts.map((dept) => [dept.id, dept]));

    // 找出名称匹配的部门
    const matchedDepts = allCorpDepts.filter((dept) => dept.name.includes(q));
    const matchedDeptIds = new Set(matchedDepts.map((d) => d.id));

    // 收集所有匹配部门的父级部门
    const parentDeptIds = new Set<string>();
    for (const dept of matchedDepts) {
      let currentParentId = dept.parentDeptId;
      while (currentParentId) {
        parentDeptIds.add(currentParentId);
        const parentDept = deptMap.get(currentParentId);
        currentParentId = parentDept?.parentDeptId || null;
      }
    }

    // 合并匹配的部门和父级部门
    const resultDepts = [
      ...matchedDepts,
      ...Array.from(parentDeptIds)
        .map((id) => deptMap.get(id)!)
        .filter((dept) => !matchedDeptIds.has(dept.id)),
    ];

    return resultDepts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((dept) => ({
        ...dept,
        createdAt: fmtBy(dept.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        isMatched: matchedDeptIds.has(dept.id),
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
