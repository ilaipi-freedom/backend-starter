import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @InjectPinoLogger(PrismaService.name)
    private readonly logger: PinoLogger,
  ) {
    super({
      log: [
        {
          level: 'query',
          emit: 'event',
        },
        {
          level: 'error',
          emit: 'event',
        },
        {
          level: 'info',
          emit: 'event',
        },
        {
          level: 'warn',
          emit: 'event',
        },
      ],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      transactionOptions: {
        maxWait: 10000,
        timeout: 60000,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.$on('query' as never, (event) => {
        this.logger.info({ event }, 'Prisma Query');
      });
      this.$on('error' as never, (event) => {
        this.logger.error({ event }, 'Prisma Error');
      });
      this.$on('info' as never, (event) => {
        this.logger.info({ event }, 'Prisma Info');
      });
      this.$on('warn' as never, (event) => {
        this.logger.warn({ event }, 'Prisma Warn');
      });
      this.logger.info('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.info('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
      throw error;
    }
  }

  // 简单的重试机制，用于处理临时性连接问题
  async withRetry<T>(action: () => Promise<T>, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await action();
      } catch (error: unknown) {
        const shouldRetry =
          error instanceof Error &&
          error.message?.includes('Connection pool timeout');

        if (shouldRetry && attempt < retries) {
          this.logger.warn(
            `Database operation failed, retry ${attempt}/${retries}`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries reached');
  }
}
