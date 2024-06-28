import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthSession } from 'src/types/auth';

@Injectable()
export class AccountService {
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
}
