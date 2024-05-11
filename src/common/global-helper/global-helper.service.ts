import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GlobalHelperService implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  constructor(private readonly prisma: PrismaService) {}
  onModuleInit() {
    this.prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
      this.logger.log({ ...e });
    });
  }
}
